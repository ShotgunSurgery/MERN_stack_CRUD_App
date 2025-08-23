import express from "express";
import { createProduct, updateProduct, deleteProduct } from "../controllers/productController.js";
import {
  getProductWithParameters,
  saveProductValues,
  getProductValues,
} from "../controllers/parameterController.js";
import { allProducts } from "../controllers/allProducts.js";
import { getAllProductsWithDetails } from "../controllers/detailedProducts.js";

const router = express.Router();

router.get("/allProducts", allProducts);

router.get("/all-with-details", getAllProductsWithDetails);

router.post("/", createProduct);

// PUT route for updating products
router.put("/:productId", updateProduct);

// DELETE route for deleting products
router.delete("/:productId", deleteProduct);

// GET product with parameters
router.get("/:productId", getProductWithParameters);

// GET existing parameter values
router.get("/:productId/values", getProductValues);

// POST save parameter values
router.post("/:productId/values", saveProductValues);

export default router;