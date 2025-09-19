import express from "express";
import { ensureWorkerAllocationsTable, getAllocations, saveAllocations } from "../controllers/workerAllocationController.js";

const router = express.Router();

// Ensure table exists once when router is imported
ensureWorkerAllocationsTable().catch((e) => {
  console.error("Failed ensuring worker_allocations table:", e);
});

// GET /api/worker-allocations?date=YYYY-MM-DD&product=ProductName
router.get("/", getAllocations);

// POST /api/worker-allocations
// body: { date, product, allocations: { [stationId]: number[] } }
router.post("/", saveAllocations);

export default router;
