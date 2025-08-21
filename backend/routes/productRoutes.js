import express from "express";
import { createProduct, updateProduct } from "../controllers/productController.js";
import {
  getProductWithParameters,
  saveProductValues,
} from "../controllers/parameterController.js";
import { allProducts } from "../controllers/allProducts.js";

const router = express.Router();

router.get("/allProducts", allProducts);

router.post("/", createProduct);

// PUT route for updating products
router.put("/:productId", updateProduct);

// GET product with parameters
router.get("/:productId", getProductWithParameters);

// POST save parameter values
router.post("/:productId/values", saveProductValues);

export default router;
