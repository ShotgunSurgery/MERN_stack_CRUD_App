import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import productRoutes from "./routes/productRoutes.js";
import stationRoutes from "./routes/stationRoutes.js";
import machineRoutes from "./routes/machineRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

// Machines routes
app.use("/api/machines", machineRoutes);

// Ensure required tables exist (especially machines)
(async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS machines (
        id INT PRIMARY KEY AUTO_INCREMENT,
        product_id INT NOT NULL,
        machine_name VARCHAR(255) NOT NULL,
        cycle_time INT NOT NULL DEFAULT 0,
        daily_count INT NOT NULL DEFAULT 0,
        products_per_hour INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_machines_product FOREIGN KEY (product_id)
          REFERENCES products(id) ON DELETE CASCADE
      )
    `);
    console.log("Ensured machines table exists");
  } catch (err) {
    console.error("Failed creating/ensuring machines table:", err);
  }
})();

app.get("/api/health", (req, res) => {
  res.json({ message: "Server is running" });
});

app.get("/api/db-check", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 + 1 AS result");
    res.json({ db_status: "Connected", result: rows[0].result });
  } catch (err) {
    res.status(500).json({ db_status: "Error", error: err.message });
  }
});

// Database connection test endpoint
app.get("/api/db-test", async (req, res) => {
  try {
    // Test basic connection
    const [testResult] = await db.query("SELECT 1 AS test");
    console.log("Basic connection test:", testResult);
    
    // Test if database exists
    const [dbResult] = await db.query("SELECT DATABASE() AS current_db");
    console.log("Current database:", dbResult);
    
    // Test if products table exists
    const [tableResult] = await db.query("SHOW TABLES LIKE 'products'");
    console.log("Products table check:", tableResult);
    
    // Test products table structure
    const [descResult] = await db.query("DESCRIBE products");
    console.log("Products table structure:", descResult);
    
    // Test products count
    const [countResult] = await db.query("SELECT COUNT(*) AS product_count FROM products");
    console.log("Products count:", countResult);
    
    res.json({
      status: "success",
      connection: "OK",
      database: dbResult[0]?.current_db || "Not connected",
      products_table_exists: tableResult.length > 0,
      table_structure: descResult,
      product_count: countResult[0]?.product_count || 0
    });
  } catch (err) {
    console.error("Database test error:", err);
    res.status(500).json({
      status: "error",
      error: err.message,
      code: err.code,
      errno: err.errno
    });
  }
});

// Mount product routes -> the below is the base route
app.use("/api/products", productRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/users", userRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log("Environment variables:");
  console.log("DB_HOST:", process.env.DB_HOST || "NOT SET");
  console.log("DB_USER:", process.env.DB_USER || "NOT SET");
  console.log("DB_NAME:", process.env.DB_NAME || "NOT SET");
  console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "SET" : "NOT SET");
});
