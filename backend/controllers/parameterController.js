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
  const { rows } = req.body; // Changed from 'parameters' to 'rows'

  try {
    // First, delete existing values for this product (optional - you might want to keep them)
    await pool.query("DELETE FROM parameter_values WHERE product_id = ?", [productId]);

    // Insert new values for each row
    for (const row of rows) {
      const recordName = row.name || 'Unnamed Record';
      
      // Insert values for each parameter in this row
      for (const paramName in row) {
        if (paramName !== 'name' && row[paramName] !== '') {
          await pool.query(
            `INSERT INTO parameter_values (product_id, record_name, parameter_name, value)
             VALUES (?, ?, ?, ?)`,
            [productId, recordName, paramName, row[paramName]]
          );
        }
      }
    }

    res.json({ message: "Values saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET parameter values (new function to retrieve saved values)
export const getProductValues = async (req, res) => {
  const { productId } = req.params;
  
  try {
    const [valueRows] = await pool.query(
      `SELECT record_name, parameter_name, value 
       FROM parameter_values 
       WHERE product_id = ? 
       ORDER BY record_name, parameter_name`,
      [productId]
    );

    // Group by record_name
    const groupedValues = {};
    valueRows.forEach(row => {
      if (!groupedValues[row.record_name]) {
        groupedValues[row.record_name] = { name: row.record_name };
      }
      groupedValues[row.record_name][row.parameter_name] = row.value;
    });

    res.json(Object.values(groupedValues));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
