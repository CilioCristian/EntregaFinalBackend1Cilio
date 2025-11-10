import { Router } from "express"; 
// Importo Router de Express para poder crear rutas específicas para el carrito

import {CartModel} from "../models/cart.model.js"; 
// Importo mi modelo de carrito para poder crear, leer, actualizar y borrar carritos en la DB

import {ProductModel} from "../models/product.model.js"; 
// Importo mi modelo de productos para poder buscar productos y agregarlos al carrito

const router = Router(); 
// Creo una instancia de Router para definir las rutas del carrito

// Crea carrito nuevo
router.post("/", async (req, res) => {
  try {
    const newCart = await CartModel.create({ products: [] }); 
    // Creo un carrito nuevo vacío en la base de datos
    res.send({ status: "success", payload: newCart }); 
    // Le envío al cliente la info del carrito creado
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message }); 
    // Si hay un error, se lo envío al cliente
  }
});

// Obtiene un carrito con populate
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params; 
    // Tomo el id del carrito que viene por params
    const cart = await CartModel.findById(cid).populate("products.product").lean(); 
    // Busco el carrito en la DB y completo la info de los productos con populate
    if (!cart) return res.status(404).send({ status: "error", message: "Carrito no encontrado" }); 
    // Si no existe, aviso que no lo encontré
    res.send({ status: "success", payload: cart }); 
    // Si lo encontré, le envío el carrito al cliente
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message }); 
    // En caso de error, lo envío al cliente
  }
});

// ✅ Agrega el producto al carrito
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params; 
    // Tomo el id del carrito y del producto que vienen por params
    const { quantity = 1 } = req.body; 
    // Tomo la cantidad del body, por defecto 1

    const cart = await CartModel.findById(cid); 
    // Busco el carrito en la DB
    if (!cart) return res.status(404).send({ status: "error", message: "Carrito no encontrado" }); 
    // Si no existe, aviso que no lo encontré

    const product = await ProductModel.findById(pid); 
    // Busco el producto en la DB
    if (!product) return res.status(404).send({ status: "error", message: "Producto no encontrado" }); 
    // Si no existe, aviso que no lo encontré

    const existing = cart.products.find(p => p.product.toString() === pid); 
    // Reviso si el producto ya está en el carrito
    if (existing) existing.quantity += quantity; 
    // Si ya está, aumento la cantidad
    else cart.products.push({ product: pid, quantity }); 
    // Si no está, lo agrego al carrito

    await cart.save(); 
    // Guardo los cambios en la DB
    res.send({ status: "success", message: "Producto agregado", payload: cart }); 
    // Le envío la confirmación al cliente con el carrito actualizado
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message }); 
    // En caso de error, lo envío al cliente
  }
});

// Actualiza cantidad
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params; 
    // Tomo el id del carrito y del producto que vienen por params
    const { quantity } = req.body; 
    // Tomo la nueva cantidad del body
    if (!quantity || quantity < 1) return res.status(400).send({ status: "error", message: "Cantidad inválida" }); 
    // Si la cantidad es inválida, retorno error

    const cart = await CartModel.findById(cid); 
    // Busco el carrito en la DB
    if (!cart) return res.status(404).send({ status: "error", message: "Carrito no encontrado" }); 
    // Si no existe, aviso que no lo encontré

    const prod = cart.products.find(p => p.product.toString() === pid); 
    // Busco el producto dentro del carrito
    if (!prod) return res.status(404).send({ status: "error", message: "Producto no está en el carrito" }); 
    // Si no está, aviso que no se encuentra

    prod.quantity = quantity; 
    // Actualizo la cantidad
    await cart.save(); 
    // Guardo los cambios en la DB

    res.send({ status: "success", message: "Cantidad actualizada", payload: cart }); 
    // Le envío al cliente la confirmación y el carrito actualizado
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message }); 
    // En caso de error, lo envío al cliente
  }
});

// ✅ Eliminar producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params; 
    // Tomo el id del carrito y del producto que vienen por params
    const cart = await CartModel.findById(cid); 
    // Busco el carrito en la DB
    if (!cart) return res.status(404).send({ status: "error", message: "Carrito no encontrado" }); 
    // Si no existe, aviso que no lo encontré

    cart.products = cart.products.filter(p => p.product.toString() !== pid); 
    // Quito el producto del carrito
    await cart.save(); 
    // Guardo los cambios en la DB

    res.send({ status: "success", message: "Producto eliminado", payload: cart }); 
    // Le envío al cliente la confirmación con el carrito actualizado
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message }); 
    // En caso de error, lo envío al cliente
  }
});

// ✅ Vaciar carrito
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params; 
    // Tomo el id del carrito que viene por params
    const cart = await CartModel.findById(cid); 
    // Busco el carrito en la DB
    if (!cart) return res.status(404).send({ status: "error", message: "Carrito no encontrado" }); 
    // Si no existe, aviso que no lo encontré

    cart.products = []; 
    // Quito todos los productos del carrito
    await cart.save(); 
    // Guardo los cambios en la DB

    res.send({ status: "success", message: "Carrito vaciado" }); 
    // Le envío al cliente la confirmación
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message }); 
    // En caso de error, lo envío al cliente
  }
});

export default router; 
// Exporto el router para poder usar estas rutas en mi aplicación principal
