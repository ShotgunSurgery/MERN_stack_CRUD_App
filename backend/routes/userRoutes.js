import express from "express";
import { createUser, getAllUsers } from "../controllers/userController.js";

const router = express.Router();

// GET route for fetching all users
router.get("/", getAllUsers);

// POST route for user registration
router.post("/register", createUser);

export default router;
