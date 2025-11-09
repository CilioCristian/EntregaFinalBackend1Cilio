import express from "express";
import { CartModel } from "../models/cart.model.js";

const router = express.Router();

// Trae un carrito por ID con todos los productos (populate)
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findById(cid).populate("products.product").lean();

    if (!cart) {
      return res.status(404).json({ status: "error", message: "No se encontró el carrito 😕" });
    }

    // Si la petición viene del navegador, renderiza la vista
    if (req.headers.accept?.includes("text/html")) {
      return res.render("cart", { cart });
    }

    // Si viene de Postman o API, devuelve un JSON
    res.json({ status: "success", payload: cart });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al buscar el carrito" });
  }
});

// Agregar producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    const existingProduct = cart.products.find(p => p.product.toString() === pid);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    await cart.save();

    res.json({ status: "success", message: "Producto agregado al carrito ✅" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al agregar producto al carrito" });
  }
});

// Elimina un producto en específico del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await CartModel.findById(cid);

    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();

    res.json({ status: "success", message: "Producto eliminado del carrito ✅" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al eliminar el producto" });
  }
});

// Actualiza todos los productos del carrito
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const updated = await CartModel.findByIdAndUpdate(cid, { products }, { new: true });
    res.json({ status: "success", message: "Carrito actualizado 🔄", payload: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al actualizar el carrito" });
  }
});

// Actualiza la cantidad de un producto en específico 
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: "error", message: "Carrito no encontrado" });

    const item = cart.products.find(p => p.product.toString() === pid);
    if (!item) return res.status(404).json({ status: "error", message: "Producto no está en el carrito" });

    item.quantity = quantity;
    await cart.save();

    res.json({ status: "success", message: "Cantidad actualizada ✅" });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al actualizar cantidad" });
  }
});

// Vacia el carrito 
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const updated = await CartModel.findByIdAndUpdate(cid, { products: [] }, { new: true });
    res.json({ status: "success", message: "Carrito vaciado 🧹", payload: updated });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Error al vaciar el carrito" });
  }
});

export default router;
