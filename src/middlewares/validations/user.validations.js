import { body, param } from "express-validator";
import { User } from "../../models/user.model.js";

const onlyLetters = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;

// En la creación el campo es obligatorio; en la actualización es opcional
const field = (name, required, message) => {
  return required ? body(name).exists().withMessage(message).bail() : body(name).optional();
};

export const validateUserId = [
  param("id").isMongoId().withMessage("El id del usuario no es un ObjectId válido"),
];

// Perfil embebido (1:1)
const profileRules = (required) => [
  field("profile", required, "El perfil es obligatorio")
    .isObject().withMessage("El perfil debe ser un objeto"),

  field("profile.firstName", required, "El nombre es obligatorio")
    .isString().withMessage("El nombre debe ser texto").bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("El nombre debe tener entre 2 y 50 caracteres").bail()
    .matches(onlyLetters).withMessage("El nombre solo puede tener letras"),

  field("profile.lastName", required, "El apellido es obligatorio")
    .isString().withMessage("El apellido debe ser texto").bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("El apellido debe tener entre 2 y 50 caracteres").bail()
    .matches(onlyLetters).withMessage("El apellido solo puede tener letras"),

  body("profile.birthDate")
    .optional()
    .isISO8601().withMessage("La fecha de nacimiento no es una fecha válida").bail()
    .custom((birthDate) => {
      if (new Date(birthDate) > new Date()) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }
      return true;
    })
    .toDate(),

  body("profile.phone")
    .optional()
    .isString().withMessage("El teléfono debe ser texto").bail()
    .trim()
    .matches(/^\d{8,15}$/).withMessage("El teléfono debe tener solo números, entre 8 y 15 dígitos"),
];

// Datos de la cuenta. Al revisar unicidad se excluye al propio usuario (req.params.id en el PUT)
const accountRules = (required) => [
  field("username", required, "El username es obligatorio")
    .isString().withMessage("El username debe ser texto").bail()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage("El username debe tener entre 3 y 20 caracteres").bail()
    .isAlphanumeric().withMessage("El username solo puede tener letras y números").bail()
    .custom(async (username, { req }) => {
      const user = await User.findOne({ username, _id: { $ne: req.params.id } });
      if (user) {
        throw new Error("El username ya está en uso");
      }
      return true;
    }),

  field("email", required, "El email es obligatorio")
    .isString().withMessage("El email debe ser texto").bail()
    .trim()
    .isEmail().withMessage("El email no tiene un formato válido").bail()
    .toLowerCase()
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (user) {
        throw new Error("El email ya está en uso");
      }
      return true;
    }),

  field("password", required, "La contraseña es obligatoria")
    .isString().withMessage("La contraseña debe ser texto").bail()
    .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres").bail()
    .matches(/[A-Z]/).withMessage("La contraseña debe tener al menos una mayúscula").bail()
    .matches(/[a-z]/).withMessage("La contraseña debe tener al menos una minúscula").bail()
    .matches(/\d/).withMessage("La contraseña debe tener al menos un número"),

  body("role")
    .optional()
    .isIn(["user", "admin"]).withMessage("El rol solo puede ser 'user' o 'admin'"),
];

export const validateRegister = [...accountRules(true), ...profileRules(true)];

export const validateLogin = [
  body("email")
    .exists().withMessage("El email es obligatorio").bail()
    .isEmail().withMessage("El email no tiene un formato válido")
    .toLowerCase(),

  body("password")
    .exists().withMessage("La contraseña es obligatoria").bail()
    .isString().withMessage("La contraseña debe ser texto"),
];

// PUT /api/auth/profile: solo se actualiza el perfil embebido, que tiene que venir en el body
export const validateUpdateProfile = [
  body("profile").exists().withMessage("El perfil es obligatorio"),
  ...profileRules(false),
];

export const validateUpdateUser = [...validateUserId, ...accountRules(false), ...profileRules(false)];
