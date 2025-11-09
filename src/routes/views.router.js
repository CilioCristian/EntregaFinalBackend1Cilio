import { Router } from "express";
import {ProductModel} from "../models/product.model.js";

const router = Router();

// ✅ Renderiza la vista de productos con paginación
router.get("/products", async (req, res) => {
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
    const buildLink = (p) => `${baseUrl}/products?limit=${limit}&page=${p}${sort ? `&sort=${sort}` : ""}${query ? `&query=${query}` : ""}`;

    res.render("products", {
      products: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

export default router;
