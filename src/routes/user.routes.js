import { Router } from "express";
import { getUsers, getUserById, updateUser, deleteUser } from "../controllers/user.controller.js";
import { validateUserId, validateUpdateUser } from "../middlewares/validations/user.validations.js";
import { validate } from "../middlewares/validator.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = Router();

// Todas las rutas de usuarios son solo para admin
router.use(authMiddleware, adminMiddleware);

router.get("/", getUsers);
router.get("/:id", validateUserId, validate, getUserById);
router.put("/:id", validateUpdateUser, validate, updateUser);
router.delete("/:id", validateUserId, validate, deleteUser);

export default router;
