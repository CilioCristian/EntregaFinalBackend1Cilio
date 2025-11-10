import { Router } from "express";
// Importo Router de Express para definir rutas modulares

import { ProductModel } from "../models/product.model.js";
// Importo el modelo de productos para hacer consultas a la base de datos

const router = Router();
// Creo una instancia del router

//  GET con paginación, filtros por categoría y orden
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, category } = req.query;
    // Extraigo los parámetros de query: límite de productos, página, orden y categoría
    // Si no se pasan, pongo valores por defecto

    const filter = {};
    if (category) filter.category = category; 
    // Si se especifica category, agrego un filtro para MongoDB

    const sortOption = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};
    // Defino la opción de ordenamiento: ascendente o descendente por precio

    const result = await ProductModel.paginate(filter, {
      limit,
      page,
      sort: sortOption,
      lean: true
    });
    // Hago la consulta paginada usando mongoose-paginate-v2 y devuelvo objetos planos con lean: true

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    // Construyo la URL base para los links de paginación

    const buildLink = (p) =>
      `${baseUrl}?limit=${limit}&page=${p}${sort ? `&sort=${sort}` : ""}${category ? `&category=${category}` : ""}`;
    // Función para construir los links de página anterior y siguiente

    const response = {
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null,
    };
    // Armo el objeto de respuesta con toda la información de paginación y los productos

    // Renderizo la vista si es navegador
    if (req.headers.accept?.includes("text/html")) {
      return res.render("products", {
        products: response.payload,
        hasPrevPage: response.hasPrevPage,
        hasNextPage: response.hasNextPage,
        prevLink: response.prevLink,
        nextLink: response.nextLink,
        page: response.page,
        totalPages: response.totalPages,
        selectedCategory: category || "" // Para mantener la categoría seleccionada en la vista
      });
      // Si el cliente acepta HTML, renderizo la vista 'products' pasando los datos necesarios
    }

    // Si es API, devuelvo JSON
    res.send(response);
    // En caso de que sea una petición tipo API, devuelvo los datos en formato JSON
  } catch (err) {
    res.status(500).send({ status: "error", error: err.message });
    // Capturo cualquier error y devuelvo estado 500 con el mensaje de error
  }
});

export default router;
// Exporto el router para usarlo en app.js
