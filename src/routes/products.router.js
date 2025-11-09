import express from "express";
import { ProductModel } from "../models/product.model.js";

const router = express.Router();

// GET /api/products con paginación, filtros y orden
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    let filter = {};
    if (query) {
      filter = {
        $or: [
          { category: query },
          { status: query === "true" }
        ]
      };
    }

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort ? { price: sort === "asc" ? 1 : -1 } : {},
      lean: true
    };

    const result = await ProductModel.paginate(filter, options);

    const response = {
      status: "success",
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}` : null,
      nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}` : null
    };

    // si me lo piden desde postman, devuelvo json
    if (req.headers.accept?.includes("application/json")) {
      return res.json(response);
    }

    // si no, renderizo la vista con handlebars
    res.render("products", {
      products: response.payload,
      hasPrevPage: response.hasPrevPage,
      hasNextPage: response.hasNextPage,
      prevLink: response.prevLink,
      nextLink: response.nextLink,
      page: response.page,
      totalPages: response.totalPages
    });

  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

// GET /api/products/:pid -> me trae un producto puntual por su id
router.get("/:pid", async (req, res) => {
  try {
    const { pid } = req.params;

    // busco el producto en la base por su id
    const product = await ProductModel.findById(pid).lean();

    // si no lo encuentra, devuelvo error
    if (!product) {
      return res.status(404).json({ status: "error", message: "Producto no encontrado" });
    }

    // si la petición viene desde Postman o cliente, devuelvo JSON
    if (req.headers.accept?.includes("application/json")) {
      return res.json({ status: "success", payload: product });
    }

    // si no, lo renderizo con Handlebars en la vista "product"
    res.render("product", { product });

  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
});

export default router;
