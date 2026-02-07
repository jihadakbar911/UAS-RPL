import request from "supertest";
import bcrypt from "bcrypt";
import app from "../src/app.js";
import User from "../src/models/user.js";
import Task from "../src/models/task.js";
import Category from "../src/models/category.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";

process.env.JWT_SECRET = "test-secret-key";

describe("Admin API", () => {
    let adminToken;
    let userToken;
    let adminId;
    let userId;

    beforeAll(async () => {
        await setupTestDB();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();

        // Create admin user
        const adminPasswordHash = await bcrypt.hash("admin123", 10);
        const admin = await User.create({
            name: "Admin User",
            username: "admin",
            passwordHash: adminPasswordHash,
            role: "ADMIN"
        });
        adminId = admin._id;

        // Login as admin
        const adminRes = await request(app)
            .post("/api/auth/login")
            .send({ username: "admin", password: "admin123" });
        adminToken = adminRes.body.token;

        // Create regular user
        const userRes = await request(app)
            .post("/api/auth/register")
            .send({ name: "Regular User", username: "user", password: "user123" });
        userToken = userRes.body.token;
        userId = userRes.body.user.id;
    });

    describe("GET /api/admin/stats", () => {
        it("should get admin statistics", async () => {
            const res = await request(app)
                .get("/api/admin/stats")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("totalUsers");
            expect(res.body).toHaveProperty("totalTasks");
            expect(res.body).toHaveProperty("completedTasks");
            expect(res.body).toHaveProperty("totalCategories");
        });

        it("should fail for non-admin user", async () => {
            const res = await request(app)
                .get("/api/admin/stats")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });
    });

    describe("GET /api/admin/users", () => {
        it("should get all users as admin", async () => {
            const res = await request(app)
                .get("/api/admin/users")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2); // admin + user
            expect(res.body[0]).not.toHaveProperty("passwordHash");
        });

        it("should fail for non-admin user", async () => {
            const res = await request(app)
                .get("/api/admin/users")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });
    });

    describe("POST /api/admin/users", () => {
        it("should create a new user as admin", async () => {
            const res = await request(app)
                .post("/api/admin/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "New User",
                    username: "newuser",
                    password: "password123",
                    role: "USER"
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("name", "New User");
            expect(res.body).toHaveProperty("role", "USER");
            expect(res.body).not.toHaveProperty("passwordHash");
        });

        it("should fail with duplicate username", async () => {
            const res = await request(app)
                .post("/api/admin/users")
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Another User",
                    username: "user", // duplicate
                    password: "password123"
                });

            expect(res.status).toBe(400);
        });
    });

    describe("PUT /api/admin/users/:id", () => {
        it("should update user as admin", async () => {
            const res = await request(app)
                .put(`/api/admin/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({
                    name: "Updated Name",
                    role: "ADMIN"
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("name", "Updated Name");
            expect(res.body).toHaveProperty("role", "ADMIN");
        });
    });

    describe("DELETE /api/admin/users/:id", () => {
        it("should delete user as admin", async () => {
            const res = await request(app)
                .delete(`/api/admin/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toContain("berhasil");

            // Verify user is deleted
            const checkRes = await request(app)
                .get(`/api/admin/users/${userId}`)
                .set("Authorization", `Bearer ${adminToken}`);
            expect(checkRes.status).toBe(404);
        });

        it("should not allow admin to delete self", async () => {
            const res = await request(app)
                .delete(`/api/admin/users/${adminId}`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(400);
        });
    });

    describe("GET /api/admin/monitoring/tasks", () => {
        beforeEach(async () => {
            // Create category and task for user
            const catRes = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${userToken}`)
                .send({ name: "Work", color: "#FF5733" });

            await request(app)
                .post("/api/tasks")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    title: "User Task",
                    priority: "HIGH",
                    category: catRes.body._id
                });
        });

        it("should get all tasks from all users as admin", async () => {
            const res = await request(app)
                .get("/api/admin/monitoring/tasks")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty("createdBy");
        });

        it("should fail for non-admin user", async () => {
            const res = await request(app)
                .get("/api/admin/monitoring/tasks")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.status).toBe(403);
        });
    });
});
