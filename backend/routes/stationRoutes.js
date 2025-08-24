import express from "express";
import { createStation, getStations } from "../controllers/stationController.js";

const router = express.Router();

// POST - create a new station
router.post("/", createStation);

// GET - fetch all stations
router.get("/", getStations);

export default router;
