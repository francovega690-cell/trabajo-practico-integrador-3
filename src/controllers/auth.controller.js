import { matchedData } from "express-validator";
import { User } from "../models/user.model.js";
import "../models/event.model.js"; // registra el modelo Event para el populate de events
import { hashPassword, comparePassword } from "../helpers/bcrypt.helper.js";
import { generateToken } from "../helpers/jwt.helper.js";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

export const register = async (req, res) => {
  try {
    const data = matchedData(req);
    data.password = await hashPassword(data.password);

    const user = await User.create(data);
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ message: "Usuario registrado correctamente", user: userResponse });
  } catch (error) {
    res.status(500).json({ message: "Error al registrar el usuario", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = matchedData(req);
    const user = await User.findOne({ email, deletedAt: null }).select("+password");

    if (!user || !(await comparePassword(password, user.password))) {
      return res.status(401).json({ message: "Email o contraseña incorrectos" });
    }

    const token = generateToken({ id: user._id, role: user.role });
    res.cookie("token", token, { ...cookieOptions, maxAge: 60 * 60 * 1000 });

    res.status(200).json({
      message: "Login exitoso",
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión", error: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("events", "title startDate status");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener el perfil", error: error.message });
  }
};

// Actualiza solo los campos enviados del perfil embebido
export const updateProfile = async (req, res) => {
  try {
    const { profile } = matchedData(req);
    const user = req.user;

    Object.assign(user.profile, profile);
    await user.save();

    res.status(200).json({ message: "Perfil actualizado correctamente", profile: user.profile });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el perfil", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("token", cookieOptions);
    res.status(200).json({ message: "Logout exitoso" });
  } catch (error) {
    res.status(500).json({ message: "Error al cerrar sesión", error: error.message });
  }
};
