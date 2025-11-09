// Importo mongoose, que me permite trabajar con MongoDB usando modelos y esquemas
import mongoose from "mongoose";

// Defino el esquema del carrito (cartSchema)
// Cada carrito tiene un arreglo de productos
const cartSchema = new mongoose.Schema({
  products: [
    {
      // "product" hace referencia al ID de un producto dentro de la colección "products"
      product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },

      // "quantity" indica la cantidad de ese producto en el carrito
      // Si no se especifica, por defecto será 1
      quantity: { type: Number, default: 1 }
    }
  ]
});

// Exporto el modelo "CartModel"
// Este modelo representa la colección "carts" en la base de datos
export const CartModel = mongoose.model("carts", cartSchema);
