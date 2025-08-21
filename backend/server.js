import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./config/db.js";
import productRoutes from "../backend/routes/productRoutes.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

// Mount product routes -> the below is the base route
app.use("/api/products", productRoutes); 

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
