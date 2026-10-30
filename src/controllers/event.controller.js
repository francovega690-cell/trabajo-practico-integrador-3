import { matchedData } from "express-validator";
import { Event } from "../models/event.model.js";

const populateEvent = [
  { path: "organizer", select: "username email profile" },
  { path: "categories", select: "name" },
];

// El organizador es siempre el usuario autenticado
export const createEvent = async (req, res) => {
  try {
    const data = matchedData(req);
    const event = await Event.create({ ...data, organizer: req.user._id });
    await event.populate(populateEvent);

    res.status(201).json({ message: "Evento creado correctamente", event });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el evento", error: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().populate(populateEvent);
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los eventos", error: error.message });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).populate("categories", "name");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener tus eventos", error: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const event = await Event.findById(id).populate(populateEvent);

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el evento", error: error.message });
  }
};

// Actualiza solo los campos enviados; la ubicación embebida se combina con la guardada
export const updateEvent = async (req, res) => {
  try {
    const { id, location, ...data } = matchedData(req);
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    event.set(data);
    if (location) {
      Object.assign(event.location, location);
    }
    await event.save();
    await event.populate(populateEvent);

    res.status(200).json({ message: "Evento actualizado correctamente", event });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el evento", error: error.message });
  }
};

// Eliminación física
export const deleteEvent = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const event = await Event.findByIdAndDelete(id);

    if (!event) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    res.status(200).json({ message: "Evento eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el evento", error: error.message });
  }
};
