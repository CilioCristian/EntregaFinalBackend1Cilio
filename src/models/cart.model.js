// Importo mongoose para poder crear esquemas y modelos y trabajar con MongoDB
import mongoose from "mongoose";

// Defino el esquema del carrito
// Cada carrito va a tener un arreglo de productos
const cartSchema = new mongoose.Schema({
  products: [
    {
      // Guardo la referencia al producto mediante su ID en la colección "products"
      product: { type: mongoose.Schema.Types.ObjectId, ref: "products" },

      // Guardo la cantidad de este producto en el carrito
      // Si no pongo cantidad, por defecto será 1
      quantity: { type: Number, default: 1 }
    }
  ]
});

// Exporto el modelo "CartModel"
// Con esto puedo interactuar con la colección "carts" en MongoDB
export const CartModel = mongoose.model("carts", cartSchema);
