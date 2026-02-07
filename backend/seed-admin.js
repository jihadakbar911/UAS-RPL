import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import { connectDB } from "./src/config/db.js";
import User from "./src/models/user.js";

async function seedAdmin() {
    await connectDB(process.env.MONGODB_URI);

    const username = "admin";
    const password = "admin123";

    const existing = await User.findOne({ username });
    if (existing) {
        console.log("Admin sudah ada:", username);
        process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
        name: "Administrator",
        username,
        passwordHash,
        role: "ADMIN",
    });

    console.log("✅ Admin dibuat. username: admin, password: admin123");
    process.exit(0);
}

seedAdmin();