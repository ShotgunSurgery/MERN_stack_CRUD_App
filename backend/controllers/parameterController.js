import pool from "../config/db.js";

// GET product + parameters
export const getProductWithParameters = async (req, res) => {
  const { productId } = req.params;
  try {
    // Fetch product name
    const [productRows] = await pool.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );
    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Fetch parameters of the product
    const [paramRows] = await pool.query(
      "SELECT * FROM parameters WHERE product_id = ?",
      [productId]
    );

    res.json({
      id: productRows[0].id,
      name: productRows[0].name,
      parameters: paramRows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// SAVE parameter values
export const saveProductValues = async (req, res) => {
  const { productId } = req.params;
  const { parameters } = req.body;

  try {
    // Loop over parameters and insert/update values
    for (const param of parameters) {
      await pool.query(
        `INSERT INTO parameters (product_id, parameterName, value)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE value = VALUES(value)`,
        [productId, param.parameterName, param.value]
      );
    }

    res.json({ message: "Values saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
