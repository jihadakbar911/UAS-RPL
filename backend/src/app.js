import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import taskRoutes from "./routes/task.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ ok: true, message: "API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/admin", adminRoutes);

export default app;