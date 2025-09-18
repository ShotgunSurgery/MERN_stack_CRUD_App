import express from "express";
import { listUsers, createUser, updateUser, deleteUser, registerUser, getUserPermissions, updateUserPermissions } from "../controllers/userController.js";

const router = express.Router();

// CRUD for users listing page
router.get("/", listUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Registration-specific endpoint (if used by a separate registration form)
router.post("/register", registerUser);

// Permissions
router.get("/:id/permissions", getUserPermissions);
router.put("/:id/permissions", updateUserPermissions);

export default router;
