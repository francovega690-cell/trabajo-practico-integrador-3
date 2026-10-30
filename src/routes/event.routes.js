import { Router } from "express";
import {
  createEvent,
  getEvents,
  getMyEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} from "../controllers/event.controller.js";
import {
  validateEventId,
  validateCreateEvent,
  validateUpdateEvent,
} from "../middlewares/validations/event.validations.js";
import { validate } from "../middlewares/validator.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { ownerOrAdminMiddleware } from "../middlewares/ownerOrAdmin.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validateCreateEvent, validate, createEvent);
router.get("/", getEvents);
router.get("/my", getMyEvents); // va antes de /:id para que "my" no se tome como id
router.get("/:id", validateEventId, validate, getEventById);

// Primero se valida el id, después el permiso (403/404) y por último el body
router.put(
  "/:id",
  validateEventId,
  validate,
  ownerOrAdminMiddleware,
  validateUpdateEvent,
  validate,
  updateEvent,
);
router.delete("/:id", validateEventId, validate, ownerOrAdminMiddleware, deleteEvent);

export default router;
