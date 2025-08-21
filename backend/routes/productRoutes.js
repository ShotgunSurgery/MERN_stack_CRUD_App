import express from "express";
import { createProduct } from "../controllers/productController.js";

const router = express.Router();

// this is postfixed on the base route which is defined on server.js
router.post("/", createProduct);

export default router;