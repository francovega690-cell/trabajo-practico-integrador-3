import { validationResult } from "express-validator";

// Middleware reutilizable: si alguna validación falló, responde 400 con los errores
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
};
