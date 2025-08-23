// controllers/allProducts.js
import db from "../config/db.js";

export const allProducts = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products"); 
    res.json(rows); 
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const describeProducts = async (req, res) => {
  try {
    const [rows] = await db.query("DESCRIBE products");
    res.json(rows);
  } catch (err) {
    console.error("Error describing products:", err);
    res.status(500).json({ error: "Failed to describe products" });
  }
};