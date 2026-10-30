import { Schema, model } from "mongoose";

// Documento embebido 1:1: la ubicación vive dentro del evento
const locationSchema = new Schema(
  {
    venue: { type: String, required: true, trim: true, minlength: 3, maxlength: 100 },
    address: { type: String, required: true, trim: true, minlength: 5, maxlength: 150 },
    city: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  },
  { _id: false },
);

const eventSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },
    description: { type: String, required: true, trim: true, minlength: 20 },
    startDate: { type: Date, required: true },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (endDate) {
          return endDate > this.startDate;
        },
        message: "La fecha de fin debe ser posterior a la fecha de inicio",
      },
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      validate: { validator: Number.isInteger, message: "La capacidad debe ser un número entero" },
    },
    price: { type: Number, min: 0, default: 0 },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "finished"],
      default: "scheduled",
    },
    location: { type: locationSchema, required: true },
    // Relación 1:N: un usuario organiza muchos eventos
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true },
    // Relación N:M: un evento tiene muchas categorías y una categoría está en muchos eventos
    categories: {
      type: [{ type: Schema.Types.ObjectId, ref: "Category" }],
      default: undefined,
    },
  },
  { timestamps: true, versionKey: false },
);

export const Event = model("Event", eventSchema);
