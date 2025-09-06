import express from "express";
import { createShift, updateShift } from "../controllers/shiftsController.js";

const router = express.Router();

router.post("/", createShift);
router.put("/:id", updateShift);

export default router;