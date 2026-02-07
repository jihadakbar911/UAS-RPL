import request from "supertest";
import app from "../src/app.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";

process.env.JWT_SECRET = "test-secret-key";

describe("Task API", () => {
    let token;
    let categoryId;

    beforeAll(async () => {
        await setupTestDB();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();

        // Create a test user and get token
        const userRes = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                username: "testuser",
                password: "password123"
            });
        token = userRes.body.token;

        // Create a test category
        const catRes = await request(app)
            .post("/api/categories")
            .set("Authorization", `Bearer ${token}`)
            .send({ name: "Work", color: "#FF5733" });
        categoryId = catRes.body._id;
    });

    describe("POST /api/tasks", () => {
        it("should create a new task", async () => {
            const res = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Test Task",
                    description: "Test description",
                    priority: "HIGH",
                    category: categoryId
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("title", "Test Task");
            expect(res.body).toHaveProperty("priority", "HIGH");
            expect(res.body).toHaveProperty("isCompleted", false);
        });

        it("should create task without category", async () => {
            const res = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Task without category",
                    priority: "LOW"
                });

            expect(res.status).toBe(201);
            expect(res.body.category).toBeNull();
        });

        it("should fail without title", async () => {
            const res = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    description: "No title task"
                });

            expect(res.status).toBe(400);
        });

        it("should fail without auth token", async () => {
            const res = await request(app)
                .post("/api/tasks")
                .send({ title: "Test Task" });

            expect(res.status).toBe(401);
        });
    });

    describe("GET /api/tasks", () => {
        beforeEach(async () => {
            // Create some tasks
            await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Task 1", priority: "HIGH", category: categoryId });

            await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Task 2", priority: "LOW" });
        });

        it("should get all tasks for the user", async () => {
            const res = await request(app)
                .get("/api/tasks")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
        });

        it("should filter tasks by category", async () => {
            const res = await request(app)
                .get(`/api/tasks?category=${categoryId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].title).toBe("Task 1");
        });

        it("should filter tasks by priority", async () => {
            const res = await request(app)
                .get("/api/tasks?priority=HIGH")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(1);
            expect(res.body[0].priority).toBe("HIGH");
        });
    });

    describe("GET /api/tasks/stats", () => {
        beforeEach(async () => {
            // Create tasks with different completion statuses
            const task1 = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Task 1", priority: "HIGH" });

            await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Task 2", priority: "MEDIUM" });

            // Mark one as complete
            await request(app)
                .patch(`/api/tasks/${task1.body._id}/toggle`)
                .set("Authorization", `Bearer ${token}`);
        });

        it("should get task statistics", async () => {
            const res = await request(app)
                .get("/api/tasks/stats")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("total", 2);
            expect(res.body).toHaveProperty("completed", 1);
            expect(res.body).toHaveProperty("pending", 1);
            expect(res.body).toHaveProperty("completionRate", 50);
        });
    });

    describe("PUT /api/tasks/:id", () => {
        let taskId;

        beforeEach(async () => {
            const res = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Original Title", priority: "MEDIUM" });
            taskId = res.body._id;
        });

        it("should update a task", async () => {
            const res = await request(app)
                .put(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    title: "Updated Title",
                    priority: "HIGH",
                    description: "Added description"
                });

            expect(res.status).toBe(200);
            expect(res.body.title).toBe("Updated Title");
            expect(res.body.priority).toBe("HIGH");
            expect(res.body.description).toBe("Added description");
        });

        it("should return 404 for non-existent task", async () => {
            const res = await request(app)
                .put("/api/tasks/507f1f77bcf86cd799439011")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Updated" });

            expect(res.status).toBe(404);
        });
    });

    describe("PATCH /api/tasks/:id/toggle", () => {
        let taskId;

        beforeEach(async () => {
            const res = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Task to toggle" });
            taskId = res.body._id;
        });

        it("should toggle task completion status", async () => {
            // First toggle: false -> true
            let res = await request(app)
                .patch(`/api/tasks/${taskId}/toggle`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.isCompleted).toBe(true);

            // Second toggle: true -> false
            res = await request(app)
                .patch(`/api/tasks/${taskId}/toggle`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.isCompleted).toBe(false);
        });
    });

    describe("DELETE /api/tasks/:id", () => {
        let taskId;

        beforeEach(async () => {
            const res = await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${token}`)
                .send({ title: "Task to delete" });
            taskId = res.body._id;
        });

        it("should delete a task", async () => {
            const res = await request(app)
                .delete(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toContain("berhasil");

            // Verify it's deleted
            const getRes = await request(app)
                .get(`/api/tasks/${taskId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(getRes.status).toBe(404);
        });

        it("should return 404 for non-existent task", async () => {
            const res = await request(app)
                .delete("/api/tasks/507f1f77bcf86cd799439011")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(404);
        });
    });
});
