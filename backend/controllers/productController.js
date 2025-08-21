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
          param.max,
          param.min,
          param.unit,
          param.evaluation,
          param.sampleSize,
          param.compulsory ? 1 : 0,
          param.status,
        ]
      );
    }

    await conn.commit();
    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    await conn.rollback();
    console.error(error);
    res.status(500).json({ error: "Failed to create product" });
  } finally {
    conn.release();
  }
};
