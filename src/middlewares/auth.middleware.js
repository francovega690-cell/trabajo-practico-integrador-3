import { verifyToken } from "../helpers/jwt.helper.js";
import { User } from "../models/user.model.js";

// Verifica el JWT de la cookie y deja el usuario activo en req.user
export const authMiddleware = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return res.status(401).json({ message: "No autenticado: falta el token" });
    }

    const decoded = verifyToken(token);
    const user = await User.findOne({ _id: decoded.id, deletedAt: null });

    if (!user) {
      return res.status(401).json({ message: "No autenticado: el usuario no existe" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token inválido o expirado", error: error.message });
  }
};
