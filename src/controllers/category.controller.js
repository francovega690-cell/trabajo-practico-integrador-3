import { matchedData } from "express-validator";
import { Category } from "../models/category.model.js";
import { Event } from "../models/event.model.js";

export const createCategory = async (req, res) => {
  try {
    const data = matchedData(req);
    const category = await Category.create(data);
    res.status(201).json({ message: "Categoría creada correctamente", category });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la categoría", error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener las categorías", error: error.message });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const category = await Category.findById(id).populate("events", "title startDate status");

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la categoría", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id, ...data } = matchedData(req);
    const category = await Category.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    res.status(200).json({ message: "Categoría actualizada correctamente", category });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la categoría", error: error.message });
  }
};

// Eliminación en cascada: se borra la categoría y se quita de todos los eventos que la referencian
export const deleteCategory = async (req, res) => {
  try {
    const { id } = matchedData(req);
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Categoría no encontrada" });
    }

    await Event.updateMany({ categories: id }, { $pull: { categories: id } });

    res.status(200).json({ message: "Categoría eliminada correctamente y quitada de los eventos" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la categoría", error: error.message });
  }
};
