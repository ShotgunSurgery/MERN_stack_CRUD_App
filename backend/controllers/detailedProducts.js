import db from "../config/db.js";

export const getAllProductsWithDetails = async (req, res) => {
  try {
    const [products] = await db.query("SELECT * FROM products");

    for (const product of products) {
      const [parameters] = await db.query(
        "SELECT * FROM parameters WHERE product_id = ?",
        [product.id]
      );
      const [parameterValues] = await db.query(
        "SELECT * FROM parameter_values WHERE product_id = ?",
        [product.id]
      );
      product.parameters = parameters;
      product.parameterValues = parameterValues;
    }

    res.json(products);
  } catch (err) {
    console.error("Error fetching products with details:", err);
    res.status(500).json({ error: "Failed to fetch products with details" });
  }
};
