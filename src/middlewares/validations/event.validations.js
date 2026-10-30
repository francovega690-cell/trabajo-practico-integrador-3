import { body, param } from "express-validator";
import { isValidObjectId } from "mongoose";
import { Event } from "../../models/event.model.js";
import { Category } from "../../models/category.model.js";

// En la creación el campo es obligatorio; en la actualización es opcional
const field = (name, required, message) => {
  return required ? body(name).exists().withMessage(message).bail() : body(name).optional();
};

export const validateEventId = [
  param("id").isMongoId().withMessage("El id del evento no es un ObjectId válido"),
];

// endDate debe ser posterior a startDate. En el PUT, si falta alguna fecha se usa la guardada
const checkDates = async (req) => {
  let { startDate, endDate } = req.body;

  if (req.params.id && isValidObjectId(req.params.id) && (!startDate || !endDate)) {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return true; // el 404 lo responde el middleware del organizador
    }
    startDate = startDate ?? event.startDate;
    endDate = endDate ?? event.endDate;
  }

  if (new Date(endDate) <= new Date(startDate)) {
    throw new Error("La fecha de fin debe ser posterior a la fecha de inicio");
  }
  return true;
};

const eventRules = (required) => [
  field("title", required, "El título es obligatorio")
    .isString().withMessage("El título debe ser texto").bail()
    .trim()
    .isLength({ min: 3, max: 150 }).withMessage("El título debe tener entre 3 y 150 caracteres").bail()
    .custom(async (title, { req }) => {
      const event = await Event.findOne({ title, _id: { $ne: req.params.id } });
      if (event) {
        throw new Error("Ya existe un evento con ese título");
      }
      return true;
    }),

  field("description", required, "La descripción es obligatoria")
    .isString().withMessage("La descripción debe ser texto").bail()
    .trim()
    .isLength({ min: 20 }).withMessage("La descripción debe tener al menos 20 caracteres"),

  field("startDate", required, "La fecha de inicio es obligatoria")
    .isISO8601().withMessage("La fecha de inicio no es una fecha válida")
    .toDate(),

  field("endDate", required, "La fecha de fin es obligatoria")
    .isISO8601().withMessage("La fecha de fin no es una fecha válida").bail()
    .custom((endDate, { req }) => checkDates(req))
    .toDate(),

  // Si solo se cambia startDate en el PUT, igual se compara contra la fecha de fin guardada
  body("startDate")
    .if(body("endDate").not().exists())
    .optional()
    .custom((startDate, { req }) => (startDate instanceof Date ? checkDates(req) : true)),

  field("capacity", required, "La capacidad es obligatoria")
    .isInt({ min: 1 }).withMessage("La capacidad debe ser un número entero mayor o igual a 1")
    .toInt(),

  body("price")
    .optional()
    .isFloat({ min: 0 }).withMessage("El precio debe ser un número mayor o igual a 0")
    .toFloat(),

  body("status")
    .optional()
    .isIn(["scheduled", "cancelled", "finished"])
    .withMessage("El estado solo puede ser 'scheduled', 'cancelled' o 'finished'"),

  // Ubicación embebida (1:1)
  field("location", required, "La ubicación es obligatoria")
    .isObject().withMessage("La ubicación debe ser un objeto"),

  field("location.venue", required, "El lugar es obligatorio")
    .isString().withMessage("El lugar debe ser texto").bail()
    .trim()
    .isLength({ min: 3, max: 100 }).withMessage("El lugar debe tener entre 3 y 100 caracteres"),

  field("location.address", required, "La dirección es obligatoria")
    .isString().withMessage("La dirección debe ser texto").bail()
    .trim()
    .isLength({ min: 5, max: 150 }).withMessage("La dirección debe tener entre 5 y 150 caracteres"),

  field("location.city", required, "La ciudad es obligatoria")
    .isString().withMessage("La ciudad debe ser texto").bail()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage("La ciudad debe tener entre 2 y 50 caracteres"),

  // Categorías (N:M): opcional, pero si se envía no puede estar vacío ni tener repetidas
  body("categories")
    .optional()
    .isArray({ min: 1 }).withMessage("Las categorías deben ser un arreglo con al menos 1 elemento").bail()
    .custom((categories) => {
      if (new Set(categories).size !== categories.length) {
        throw new Error("Hay categorías repetidas");
      }
      return true;
    }),

  body("categories.*")
    .isMongoId().withMessage("Cada categoría debe ser un ObjectId válido").bail()
    .custom(async (categoryId) => {
      const category = await Category.findById(categoryId);
      if (!category) {
        throw new Error(`La categoría ${categoryId} no existe`);
      }
      return true;
    }),
];

export const validateCreateEvent = eventRules(true);

export const validateUpdateEvent = [...validateEventId, ...eventRules(false)];
