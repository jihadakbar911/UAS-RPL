import request from "supertest";
import bcrypt from "bcrypt";
import app from "../src/app.js";
import User from "../src/models/user.js";
import { setupTestDB, teardownTestDB, clearTestDB } from "./setup.js";

// Set environment variables for testing
process.env.JWT_SECRET = "test-secret-key";

describe("Auth API", () => {
    beforeAll(async () => {
        await setupTestDB();
    });

    afterAll(async () => {
        await teardownTestDB();
    });

    beforeEach(async () => {
        await clearTestDB();
    });

    describe("POST /api/auth/register", () => {
        it("should register a new user successfully", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Test User",
                    username: "testuser",
                    password: "password123"
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty("token");
            expect(res.body).toHaveProperty("role", "USER");
            expect(res.body.user).toHaveProperty("name", "Test User");
            expect(res.body.user).toHaveProperty("username", "testuser");
        });

        it("should fail if required fields are missing", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Test User"
                });

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty("message");
        });

        it("should fail if password is too short", async () => {
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Test User",
                    username: "testuser",
                    password: "123"
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain("6 karakter");
        });

        it("should fail if username already exists", async () => {
            // Create first user
            await request(app)
                .post("/api/auth/register")
                .send({
                    name: "First User",
                    username: "sameuser",
                    password: "password123"
                });

            // Try to create second user with same username
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Second User",
                    username: "sameuser",
                    password: "password456"
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain("sudah digunakan");
        });
    });

    describe("POST /api/auth/login", () => {
        beforeEach(async () => {
            // Create a test user before each login test
            const passwordHash = await bcrypt.hash("password123", 10);
            await User.create({
                name: "Test User",
                username: "testuser",
                passwordHash,
                role: "USER"
            });
        });

        it("should login successfully with correct credentials", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    username: "testuser",
                    password: "password123"
                });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("token");
            expect(res.body).toHaveProperty("role", "USER");
            expect(res.body.user).toHaveProperty("username", "testuser");
        });

        it("should fail with wrong password", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    username: "testuser",
                    password: "wrongpassword"
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toContain("gagal");
        });

        it("should fail with non-existent username", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    username: "nonexistent",
                    password: "password123"
                });

            expect(res.status).toBe(401);
        });

        it("should fail if username or password is missing", async () => {
            const res = await request(app)
                .post("/api/auth/login")
                .send({
                    username: "testuser"
                });

            expect(res.status).toBe(400);
        });
    });

    describe("GET /api/auth/me", () => {
        let token;

        beforeEach(async () => {
            // Register and get token
            const res = await request(app)
                .post("/api/auth/register")
                .send({
                    name: "Test User",
                    username: "testuser",
                    password: "password123"
                });
            token = res.body.token;
        });

        it("should get current user with valid token", async () => {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("name", "Test User");
            expect(res.body).toHaveProperty("username", "testuser");
            expect(res.body).not.toHaveProperty("passwordHash");
        });

        it("should fail without token", async () => {
            const res = await request(app)
                .get("/api/auth/me");

            expect(res.status).toBe(401);
        });

        it("should fail with invalid token", async () => {
            const res = await request(app)
                .get("/api/auth/me")
                .set("Authorization", "Bearer invalid-token");

            expect(res.status).toBe(401);
        });
    });
});
