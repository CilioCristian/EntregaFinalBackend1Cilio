import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// defino el esquema del producto con todos los campos que voy a guardar
const productSchema = new mongoose.Schema({
  title: String, // nombre del producto
  description: String, // una descripción corta
  price: Number, // el precio
  category: String, // categoría del producto
  stock: Number, // cantidad disponible
  status: { type: Boolean, default: true }, // activo o no (por defecto está activo)
  thumbnails: [String] // array de imágenes
});

// le agrego el plugin de paginación para poder usar .paginate()
productSchema.plugin(mongoosePaginate);

// creo el modelo 'products' basado en el esquema anterior
export const ProductModel = mongoose.model("products", productSchema);
