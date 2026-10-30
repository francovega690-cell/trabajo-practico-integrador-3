import { Schema, model } from "mongoose";

// Documento embebido 1:1: el perfil vive dentro del usuario
const profileSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    birthDate: { type: Date },
    phone: { type: String, trim: true, match: /^\d{8,15}$/ },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: /^\S+@\S+\.\S+$/,
    },
    // select: false para que la contraseña hasheada no viaje en las consultas
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    profile: { type: profileSchema, required: true },
    // Eliminación lógica: null significa que el usuario está activo
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual populate 1:N: el usuario no guarda sus eventos, se buscan por el campo organizer
userSchema.virtual("events", {
  ref: "Event",
  localField: "_id",
  foreignField: "organizer",
});

export const User = model("User", userSchema);
