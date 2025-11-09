import express from "express";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Rutas
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";

// Cargo las variables del .env
dotenv.config();

const app = express();
const PORT = 8080;

// --- Configuración de handlebars ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middlewares 
// Esto es para que el servidor entienda JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

// Ruta principal 
// Si entrás al inicio, te redirige a los productos
app.get("/", (req, res) => {
  res.redirect("/api/products");
});

// Conexión con Mongo Atlas 
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Conectado a MongoDB Atlas"))
  .catch((error) => console.error("❌ Error al conectar con MongoDB:", error));

// Servidor andando
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
