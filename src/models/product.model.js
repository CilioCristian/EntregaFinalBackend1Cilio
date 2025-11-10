import mongoose from "mongoose";
// Importo mongoose para crear esquemas y modelos y trabajar con MongoDB

import mongoosePaginate from "mongoose-paginate-v2";
// Importo el plugin de paginación para poder paginar resultados fácilmente

// Defino el esquema del producto con todos los campos que voy a guardar
const productSchema = new mongoose.Schema({
  title: String, 
  // Guardo el nombre del producto

  description: String, 
  // Guardo una descripción corta del producto

  price: Number, 
  // Guardo el precio del producto

  category: String, 
  // Guardo la categoría a la que pertenece el producto

  stock: Number, 
  // Guardo la cantidad disponible del producto

  status: { type: Boolean, default: true }, 
  // Indico si el producto está activo o no, por defecto activo

  thumbnails: [String] 
  // Guardo un arreglo con URLs o rutas de imágenes del producto
});

// Agrego el plugin de paginación al esquema para poder usar el método .paginate()
productSchema.plugin(mongoosePaginate);

// Creo el modelo 'products' basado en el esquema definido
export const ProductModel = mongoose.model("products", productSchema);
// Este modelo me permite interactuar con la colección 'products' en la base de datos
