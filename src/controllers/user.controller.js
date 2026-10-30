import { matchedData } from "express-validator";
import { User } from "../models/user.model.js";
import { Event } from "../models/event.model.js";
import { hashPassword } from "../helpers/bcrypt.helper.js";

// Las consultas normales ignoran a los usuarios eliminados lógicamente (deletedAt distinto de null)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ deletedAt: null }).populate("events", "title startDate status");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios", error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const user = await User.findOne({ _id: id, deletedAt: null }).populate(
      "events",
      "title startDate status",
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el usuario", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id, profile, ...data } = matchedData(req);
    const user = await User.findOne({ _id: id, deletedAt: null });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (data.password) {
      data.password = await hashPassword(data.password);
    }

    user.set(data);
    if (profile) {
      Object.assign(user.profile, profile);
    }
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ message: "Usuario actualizado correctamente", user: userResponse });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el usuario", error: error.message });
  }
};

// Eliminación lógica del usuario y en cascada (física) de los eventos que organizó
export const deleteUser = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const user = await User.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { returnDocument: "after" },
    );

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const { deletedCount } = await Event.deleteMany({ organizer: id });

    res.status(200).json({
      message: `Usuario eliminado correctamente (lógico) junto con sus ${deletedCount} eventos`,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario", error: error.message });
  }
};
