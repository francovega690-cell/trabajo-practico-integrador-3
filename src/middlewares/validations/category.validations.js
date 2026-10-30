import { body, param } from "express-validator";
import { Category } from "../../models/category.model.js";

export const validateCategoryId = [
  param("id").isMongoId().withMessage("El id de la categoría no es un ObjectId válido"),
];

const nameRule = (required) =>
  (required ? body("name").exists().withMessage("El nombre es obligatorio").bail() : body("name").optional())
    .isString().withMessage("El nombre debe ser texto").bail()
    .trim()
    .isLength({ min: 2, max: 30 }).withMessage("El nombre debe tener entre 2 y 30 caracteres").bail()
    .custom(async (name, { req }) => {
      const category = await Category.findOne({ name, _id: { $ne: req.params.id } });
      if (category) {
        throw new Error("Ya existe una categoría con ese nombre");
      }
      return true;
    });

const descriptionRule = body("description")
  .optional()
  .isString().withMessage("La descripción debe ser texto").bail()
  .trim()
  .isLength({ max: 200 }).withMessage("La descripción puede tener como máximo 200 caracteres");

export const validateCreateCategory = [nameRule(true), descriptionRule];

export const validateUpdateCategory = [...validateCategoryId, nameRule(false), descriptionRule];
