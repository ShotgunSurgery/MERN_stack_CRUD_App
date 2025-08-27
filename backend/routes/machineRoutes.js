import { Router } from "express";
import { addMachines, deleteMachine } from "../controllers/machineController.js";

const router = Router();

// POST /api/machines
router.post("/", addMachines);

// DELETE /api/machines
router.delete("/", deleteMachine);

export default router;
