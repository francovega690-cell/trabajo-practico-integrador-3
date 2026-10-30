import { Router } from "express";
import { register, login, getProfile, updateProfile, logout } from "../controllers/auth.controller.js";
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
} from "../middlewares/validations/user.validations.js";
import { validate } from "../middlewares/validator.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validateRegister, validate, register);
router.post("/login", validateLogin, validate, login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, validateUpdateProfile, validate, updateProfile);
router.post("/logout", authMiddleware, logout);

export default router;
