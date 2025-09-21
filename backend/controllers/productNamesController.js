import db from "../config/db.js";

export const getProductNames = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name FROM products ORDER BY name");
    res.json(rows);
  } catch (err) {
    console.error("Error fetching product names:", err);
    res.status(500).json({ error: 'Failed to fetch product names' });
  }
};