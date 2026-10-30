import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conexión a MongoDB exitosa:", mongoose.connection.name);
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
    process.exit(1); // si MongoDB no está disponible el servidor no arranca
  }
};
