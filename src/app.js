import express from "express";
import mongoose from "mongoose";
import { engine } from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Rutas
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import viewsRouter from "./routes/views.router.js";

// Cargo las variables de entorno desde el archivo .env
dotenv.config();

const app = express();
const PORT = 8080;
const hbs = engine({
  helpers: {
    ifEquals: (arg1, arg2, options) => {
      return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
    }
  }
});
// --- Configuración de handlebars ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Obtengo la ruta del archivo actual y del directorio para usar rutas relativas

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));
// Configuro handlebars como motor de plantillas y establezco la carpeta de vistas

// Middlewares 
// Esto es para que el servidor pueda interpretar JSON y formularios enviados por POST
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas principales
app.use("/", viewsRouter);
// Todas las rutas de la web normal van a viewsRouter

app.use("/api/products", productsRouter);
// Todas las rutas de productos van a productsRouter
app.use("/api/carts", cartsRouter);
// Todas las rutas de carritos van a cartsRouter

// Ruta principal 
// Si alguien entra al inicio, lo redirijo a la lista de productos
app.get("/", (req, res) => {
  res.redirect("/api/products");
});

// Conexión con Mongo Atlas
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch((error) => console.error("Error al conectar con MongoDB:", error));
// Intento conectar con la base de datos y muestro mensaje según resultado

// Servidor corriendo
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
// Inicio el servidor en el puerto definido

app.use(express.static(path.join(__dirname, "public")));
// Sirvo archivos estáticos (CSS, JS, imágenes) desde la carpeta public
app.engine("handlebars", hbs);
app.set("view engine", "handlebars");