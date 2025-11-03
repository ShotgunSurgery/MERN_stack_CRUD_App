import express from "express";
import {
  ensureProductStationLogsTable,
  getStationCompletions,
  getEmployeeCompletions,
  getProductDetailsFlow,
  getWeeklyCompletions,
} from "../controllers/reportController.js";

const router = express.Router();

// Ensure table exists when routes are initialized
ensureProductStationLogsTable().catch((e) => {
  console.error("Failed to ensure product_station_logs table:", e);
});

router.get("/station-completions", getStationCompletions);
router.get("/employee-completions", getEmployeeCompletions);
router.get("/product-details", getProductDetailsFlow);
router.get("/weekly-completions", getWeeklyCompletions);

export default router;


