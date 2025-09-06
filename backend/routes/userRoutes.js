import express from "express";
import { createUser } from "../controllers/userController.js";

const router = express.Router();

// POST route for user registration
router.post("/register", createUser);

export default router;
