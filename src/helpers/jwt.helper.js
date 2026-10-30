import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Lanza un error si el token es inválido o expiró
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
