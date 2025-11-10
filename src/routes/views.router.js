import { Router } from "express"; 
// Importo Router de Express para crear rutas específicas de productos

import { ProductModel } from "../models/product.model.js"; 
// Importo mi modelo de productos para consultar la base de datos

const router = Router(); 
// Creo una instancia de Router para definir las rutas

// ✅ Renderiza la vista de productos con paginación
router.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query; 
    // Tomo los parámetros de query: límite, página, orden y filtro

    const filter = query
      ? { $or: [
          { category: query }, 
          // Si el query coincide con una categoría, filtro por categoría
          { status: query === "available" ? true : query === "unavailable" ? false : undefined } 
          // Si query es "available" o "unavailable", filtro por estado
        ].filter(Boolean) } 
      : {}; 
      // Si no hay query, no aplico filtros

    const sortOption = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {}; 
    // Defino cómo ordenar los productos por precio

    const result = await ProductModel.paginate(filter, {
      limit,
      page,
      sort: sortOption,
      lean: true
    }); 
    // Hago la consulta paginada a la DB y obtengo los productos

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`; 
    // Construyo la URL base para los links de paginación
    const buildLink = (p) => `${baseUrl}/products?limit=${limit}&page=${p}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`; 
    // Función que construye los links de página anterior y siguiente

    res.render("products", {
      products: result.docs, 
      // Paso los productos a la vista
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null, 
      // Si hay página anterior, le paso el link
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null 
      // Si hay página siguiente, le paso el link
    }); 
    // Renderizo la vista de productos con la info paginada
  } catch (err) {
    res.status(500).send(err.message); 
    // En caso de error, envío el mensaje de error
  }
});

// 🔹 Renderiza detalle de producto
router.get("/products/:pid", async (req, res) => {
  try {
    const { pid } = req.params; 
    // Tomo el id del producto que viene por params
    const product = await ProductModel.findById(pid).lean(); 
    // Busco el producto en la DB
    if (!product) return res.status(404).send("Producto no encontrado"); 
    // Si no existe, aviso que no lo encontré

    res.render("productDetail", { product }); 
    // Renderizo la vista del detalle del producto
  } catch (err) {
    res.status(500).send(err.message); 
    // En caso de error, envío el mensaje de error
  }
});

export default router; 
// Exporto el router para poder usar estas rutas en mi aplicación principal
