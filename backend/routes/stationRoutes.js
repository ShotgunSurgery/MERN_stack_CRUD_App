import express from "express";
import { 
  createStation, 
  getStations, 
  getStationsByProduct, 
  updateStation, 
  updateStationOrder,
  addParameterToStation,
  removeParameterFromStation,
  getStationParameters,
  getParameters 
} from "../controllers/stationController.js";

const router = express.Router();

// POST - create a new station
router.post("/", createStation);

// GET - fetch all stations
router.get("/", getStations);

// GET - fetch stations by product name
router.get("/by-product/:productName", getStationsByProduct);

// GET - fetch all parameters
router.get("/parameters", getParameters);

// PUT - update a station
router.put("/:id", updateStation);

// PUT - update station order
router.put("/order", updateStationOrder);

// POST - add parameter to station
router.post("/:stationId/parameters/:parameterId", addParameterToStation);

// DELETE - remove parameter from station
router.delete("/:stationId/parameters/:parameterId", removeParameterFromStation);

// GET - get parameters for a specific station
router.get("/:stationId/parameters", getStationParameters);

export default router;
