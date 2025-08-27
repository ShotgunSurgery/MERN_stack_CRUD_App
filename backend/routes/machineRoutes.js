import { Router } from "express";
import { addMachines, deleteMachine, getMachinesByProduct } from "../controllers/machineController.js";

const router = Router();

// POST /api/machines
router.post("/", addMachines);

// DELETE /api/machines
router.delete("/", deleteMachine);

// GET /api/machines/by-product/:productName
router.get("/by-product/:productName", getMachinesByProduct);

export default router;
