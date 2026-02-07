import { Router } from "express";
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    toggleTaskComplete,
    deleteTask,
    getTaskStats,
} from "../controller/task.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Semua route memerlukan autentikasi
router.use(authMiddleware);

router.get("/", getAllTasks);
router.get("/stats", getTaskStats);
router.get("/:id", getTaskById);
router.post("/", createTask);
router.put("/:id", updateTask);
router.patch("/:id/toggle", toggleTaskComplete);
router.delete("/:id", deleteTask);

export default router;
