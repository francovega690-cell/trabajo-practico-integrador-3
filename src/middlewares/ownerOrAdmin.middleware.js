import { Event } from "../models/event.model.js";

// Solo el organizador del evento o un admin pueden seguir. Se usa después de validar el id
export const ownerOrAdminMiddleware = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    const isOwner = event.organizer.equals(req.user._id);

    if (!isOwner && req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Acceso denegado: solo el organizador o un admin pueden hacerlo" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Error al verificar el organizador", error: error.message });
  }
};
