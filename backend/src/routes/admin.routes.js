import { Router } from "express";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllTasksMonitoring,
    getAdminStats
} from "../controller/user.controller.js";
import { authMiddleware, adminOnly } from "../middleware/auth.middleware.js";

const router = Router();

// All routes require authentication AND admin role
router.use(authMiddleware);
router.use(adminOnly);

// Admin Stats
router.get("/stats", getAdminStats);

// User Management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Task Monitoring (read-only)
router.get("/monitoring/tasks", getAllTasksMonitoring);

export default router;
