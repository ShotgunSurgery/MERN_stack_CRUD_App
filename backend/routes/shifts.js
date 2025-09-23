import express from "express";
import { createShift, updateShift, getShifts, deleteShift } from "../controllers/shiftsController.js";

const router = express.Router();

router.get("/", getShifts);
router.post("/", createShift);
router.put("/:id", updateShift);
router.delete("/:id", deleteShift);

export default router;