// controller reads data from the frontend, runs sql query to save it in db, sends back response

// manager to talking to MySQL
import pool from "../config/db.js";

// under the hood express automatically forwards the incomming request
export const createProduct = async (req, res) => {
  const { name, parameters } = req.body;

  const conn = await pool.getConnection(); // opens a new connection for each request
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      "INSERT INTO products (name) VALUES (?)", // this is a protected statement which protects from SQL injection under the hood
      [name]
    );
    const productId = result.insertId;

    // Insert parameters
    for (const param of parameters) {
      await conn.query(
        `INSERT INTO parameters 
   (product_id, parameterName, max_value, min_value, unit, evaluation, sample_size, compulsory, status) 
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
        [
          productId,
          param.parameterName,
          param.max === '' ? null : param.max,
          param.min === '' ? null : param.min,
          param.unit,
          param.evaluation,
          param.sampleSize === '' ? null : param.sampleSize,
          param.compulsory ? 1 : 0,
          param.status || 'Pending',
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ message: "Product created successfully", productId: productId });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to create product" });
  } finally {
    conn.release();
  }
};

export const updateProduct = async (req, res) => {
  const { productId } = req.params;
  const { name, parameters } = req.body;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Update product name
    await conn.query(
      "UPDATE products SET name = ? WHERE id = ?",
      [name, productId]
    );

    // Delete existing parameters
    await conn.query("DELETE FROM parameters WHERE product_id = ?", [productId]);

    // Insert new parameters
    for (const param of parameters) {
      await conn.query(
        `INSERT INTO parameters 
         (product_id, parameterName, max_value, min_value, unit, evaluation, sample_size, compulsory, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          productId,
          param.parameterName,
          param.max === '' ? null : param.max,
          param.min === '' ? null : param.min,
          param.unit,
          param.evaluation,
          param.sampleSize === '' ? null : param.sampleSize,
          param.compulsory ? 1 : 0,
          param.status || 'Pending',
        ]
      );
    }

    await conn.commit();
    res.status(200).json({ message: "Product updated successfully" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to update product" });
  } finally {
    conn.release();
  }
};

export const deleteProduct = async (req, res) => {
  const { productId } = req.params;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Check if product exists
    const [productRows] = await conn.query(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete the product (parameters and values will be deleted automatically due to CASCADE)
    await conn.query("DELETE FROM products WHERE id = ?", [productId]);

    await conn.commit();
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    await conn.rollback();
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  } finally {
    conn.release();
  }
};

export const reorderProducts = async (req, res) => {
  const { productIds } = req.body; // Expects an array of product IDs in the desired order

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    for (let i = 0; i < productIds.length; i++) {
      const productId = productIds[i];
      const displayOrder = i; // Assign order based on array index

      await conn.query(
        "UPDATE products SET display_order = ? WHERE id = ?",
        [displayOrder, productId]
      );
    }

    await conn.commit();
    res.status(200).json({ message: "Products reordered successfully" });
  } catch (error) {
    await conn.rollback();
    console.error("Error reordering products:", error);
    res.status(500).json({ error: "Failed to reorder products", details: error.message });
  } finally {
    conn.release();
  }
};