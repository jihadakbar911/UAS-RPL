import { Router } from "express";
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controller/category.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = Router();

// Semua route memerlukan autentikasi
router.use(authMiddleware);

router.get("/", getAllCategories);
router.get("/:id", getCategoryById);
router.post("/", createCategory);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);

export default router;
