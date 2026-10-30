import { Router } from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import {
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
} from "../middlewares/validations/category.validations.js";
import { validate } from "../middlewares/validator.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", adminMiddleware, validateCreateCategory, validate, createCategory);
router.get("/", getCategories);
router.get("/:id", validateCategoryId, validate, getCategoryById);
router.put("/:id", adminMiddleware, validateUpdateCategory, validate, updateCategory);
router.delete("/:id", adminMiddleware, validateCategoryId, validate, deleteCategory);

export default router;
