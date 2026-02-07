import request from "supertest";
import app from "../src/app.js";
import User from "../src/models/user.js";
import Category from "../src/models/category.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";

process.env.JWT_SECRET = "test-secret-key";

describe("Category API", () => {
    let token;
    let userId;

    beforeAll(async () => {
        await setupTestDB();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();

        // Create a test user and get token
        const res = await request(app)
            .post("/api/auth/register")
            .send({
                name: "Test User",
                username: "testuser",
                password: "password123"
            });
        token = res.body.token;
        userId = res.body.user.id;
    });

    describe("POST /api/categories", () => {
        it("should create a new category", async () => {
            const res = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Work",
                    description: "Work related tasks",
                    color: "#FF5733"
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("name", "Work");
            expect(res.body).toHaveProperty("description", "Work related tasks");
            expect(res.body).toHaveProperty("color", "#FF5733");
        });

        it("should fail without auth token", async () => {
            const res = await request(app)
                .post("/api/categories")
                .send({
                    name: "Work"
                });

            expect(res.status).toBe(401);
        });

        it("should fail if name is missing", async () => {
            const res = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${token}`)
                .send({
                    description: "Some description"
                });

            expect(res.status).toBe(400);
        });

        it("should fail for duplicate category name", async () => {
            // Create first category
            await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Work" });

            // Try to create duplicate
            const res = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Work" });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain("sudah ada");
        });
    });

    describe("GET /api/categories", () => {
        beforeEach(async () => {
            // Create some categories
            await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Work", color: "#FF5733" });

            await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Personal", color: "#33FF57" });
        });

        it("should get all categories for the user", async () => {
            const res = await request(app)
                .get("/api/categories")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBe(2);
        });

        it("should not get categories from other users", async () => {
            // Create another user
            const otherUserRes = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Other User",
                    username: "otheruser",
                    password: "password123"
                });

            const otherToken = otherUserRes.body.token;

            // Get categories for other user (should be empty)
            const res = await request(app)
                .get("/api/categories")
                .set("Authorization", `Bearer ${otherToken}`);

            expect(res.status).toBe(200);
            expect(res.body.length).toBe(0);
        });
    });

    describe("GET /api/categories/:id", () => {
        let categoryId;

        beforeEach(async () => {
            const res = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Work" });
            categoryId = res.body._id;
        });

        it("should get a category by id", async () => {
            const res = await request(app)
                .get(`/api/categories/${categoryId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("name", "Work");
        });

        it("should return 404 for non-existent category", async () => {
            const res = await request(app)
                .get("/api/categories/507f1f77bcf86cd799439011")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(404);
        });
    });

    describe("PUT /api/categories/:id", () => {
        let categoryId;

        beforeEach(async () => {
            const res = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Work", color: "#FF5733" });
            categoryId = res.body._id;
        });

        it("should update a category", async () => {
            const res = await request(app)
                .put(`/api/categories/${categoryId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({
                    name: "Work Updated",
                    color: "#00FF00"
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("name", "Work Updated");
            expect(res.body).toHaveProperty("color", "#00FF00");
        });
    });

    describe("DELETE /api/categories/:id", () => {
        let categoryId;

        beforeEach(async () => {
            const res = await request(app)
                .post("/api/categories")
                .set("Authorization", `Bearer ${token}`)
                .send({ name: "Work" });
            categoryId = res.body._id;
        });

        it("should delete a category", async () => {
            const res = await request(app)
                .delete(`/api/categories/${categoryId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.message).toContain("berhasil");

            // Verify it's deleted
            const getRes = await request(app)
                .get(`/api/categories/${categoryId}`)
                .set("Authorization", `Bearer ${token}`);

            expect(getRes.status).toBe(404);
        });
    });
});
