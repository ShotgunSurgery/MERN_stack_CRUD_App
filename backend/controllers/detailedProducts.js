import db from "../config/db.js";

export const getAllProductsWithDetails = async (req, res) => {
  try {
    const { search } = req.query;
    let query = "SELECT * FROM products";
    const queryParams = [];

    if (search) {
      query += " WHERE name LIKE ?";
      queryParams.push(`%${search}%`);
    }

    query += " ORDER BY display_order ASC";

    const [products] = await db.query(query, queryParams);

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
    res.status(500).json({ error: "Failed to fetch products with details", details: err.message });
  }
};
