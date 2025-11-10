import { Router } from "express"; 
// Importo Router de Express para poder crear rutas específicas para los productos

import { ProductModel } from "../models/product.model.js"; 
// Importo mi modelo de productos para poder hacer consultas a la DB

const router = Router(); 
// Creo una instancia de Router para definir las rutas de productos

// ✅ GET con paginación, filtros y orden
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query; 
    // Tomo los parámetros de query: límite de items, página, orden y filtro

    const filter = query
      ? { $or: [
          { category: query }, 
          // Si query coincide con categoría, lo filtro por categoría
          { status: query === "available" ? true : query === "unavailable" ? false : undefined } 
          // Si query es "available" o "unavailable", filtro por estado
        ].filter(Boolean) } 
      : {}; 
      // Si no hay query, no aplico filtros

    const sortOption = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {}; 
    // Defino cómo ordenar los productos: ascendente o descendente por precio

    const result = await ProductModel.paginate(filter, {
      limit,
      page,
      sort: sortOption,
      lean: true
    }); 
    // Hago la consulta paginada a la DB con filtros, límite y orden, y obtengo resultados planos

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`; 
    // Construyo la base de la URL para los links de paginación
    const buildLink = (p) => `${baseUrl}?limit=${limit}&page=${p}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`; 
    // Creo una función que genera los links de página anterior y siguiente

    const response = {
      status: "success",
      payload: result.docs, 
      // Guardo los productos obtenidos
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null, 
      // Si hay página anterior, construyo el link
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null, 
      // Si hay página siguiente, construyo el link
    };

    // Si el navegador lo visita, renderizo la vista
    if (req.headers.accept?.includes("text/html")) {
      return res.render("products", {
        products: response.payload, 
        // Paso los productos para renderizar
        hasPrevPage: response.hasPrevPage,
        hasNextPage: response.hasNextPage,
        prevLink: response.prevLink,
        nextLink: response.nextLink,
        page: response.page,
        totalPages: response.totalPages
      });
    }

    // Si es Postman o API, devuelvo JSON
    res.send(response); 
    // Le envío la respuesta con los productos y la info de paginación

  } catch (err) {
    res.status(500).send({ status: "error", error: err.message }); 
    // Si hay error, se lo envío al cliente
  }
});

export default router; 
// Exporto el router para poder usar estas rutas en mi aplicación principal
