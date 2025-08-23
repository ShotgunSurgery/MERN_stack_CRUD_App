// controllers/allProducts.js
import db from "../config/db.js";

export const allProducts = async (req, res) => {
  try {
    console.log("Attempting to fetch products from database...");
    
    // Test database connection first
    const [testResult] = await db.query("SELECT 1");
    console.log("Database connection test successful:", testResult);
    
    const [rows] = await db.query("SELECT * FROM products"); 
    console.log("Products query result:", rows);
    console.log("Number of products found:", rows.length);
    
    // Ensure we're sending an array
    if (!Array.isArray(rows)) {
      console.error("Database query did not return an array:", typeof rows, rows);
      return res.status(500).json({ error: "Database returned invalid data format" });
    }
    
    res.json(rows); 
  } catch (err) {
    console.error("Error fetching products:", err);
    console.error("Error details:", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      sqlState: err.sqlState,
      sqlMessage: err.sqlMessage
    });
    
    // Send more detailed error information
    res.status(500).json({ 
      error: "Failed to fetch products",
      details: err.message,
      code: err.code
    });
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