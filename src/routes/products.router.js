import { Router } from "express";
import { ProductModel } from "../models/product.model.js";

const router = Router();

// ✅ GET con paginación, filtros y orden
router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filter = query
      ? { $or: [
          { category: query },
          { status: query === "available" ? true : query === "unavailable" ? false : undefined }
        ].filter(Boolean) }
      : {};

    const sortOption = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

    const result = await ProductModel.paginate(filter, {
      limit,
      page,
      sort: sortOption,
      lean: true
    });

    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const buildLink = (p) => `${baseUrl}?limit=${limit}&page=${p}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`;

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

    // Si el navegador lo visita, renderiza la vista
    if (req.headers.accept?.includes("text/html")) {
      return res.render("products", {
        products: response.payload,
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

  } catch (err) {
    res.status(500).send({ status: "error", error: err.message });
  }
});

export default router;
