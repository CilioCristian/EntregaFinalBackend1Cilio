import { Router } from "express";
import {CartModel} from "../models/cart.model.js";
import {ProductModel} from "../models/product.model.js";

const router = Router();

// ✅ Crear carrito nuevo
router.post("/", async (req, res) => {
  try {
    const newCart = await CartModel.create({ products: [] });
    res.send({ status: "success", payload: newCart });
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message });
  }
});

// ✅ Obtener carrito con populate
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findById(cid).populate("products.product").lean();
    if (!cart) return res.status(404).send({ status: "error", message: "Carrito no encontrado" });
    res.send({ status: "success", payload: cart });
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message });
  }
});

// ✅ Agregar producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).send({ status: "error", message: "Carrito no encontrado" });

    const product = await ProductModel.findById(pid);
    if (!product) return res.status(404).send({ status: "error", message: "Producto no encontrado" });

    const existing = cart.products.find(p => p.product.toString() === pid);
    if (existing) existing.quantity += quantity;
    else cart.products.push({ product: pid, quantity });

    await cart.save();
    res.send({ status: "success", message: "Producto agregado", payload: cart });
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message });
  }
});

// ✅ Actualizar cantidad
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).send({ status: "error", message: "Cantidad inválida" });

    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).send({ status: "error", message: "Carrito no encontrado" });

    const prod = cart.products.find(p => p.product.toString() === pid);
    if (!prod) return res.status(404).send({ status: "error", message: "Producto no está en el carrito" });

    prod.quantity = quantity;
    await cart.save();

    res.send({ status: "success", message: "Cantidad actualizada", payload: cart });
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message });
  }
});

// ✅ Eliminar producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).send({ status: "error", message: "Carrito no encontrado" });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();

    res.send({ status: "success", message: "Producto eliminado", payload: cart });
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message });
  }
});

// ✅ Vaciar carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).send({ status: "error", message: "Carrito no encontrado" });

    cart.products = [];
    await cart.save();

    res.send({ status: "success", message: "Carrito vaciado" });
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message });
  }
});

export default router;
