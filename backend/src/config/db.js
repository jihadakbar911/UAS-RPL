import mongoose from "mongoose";

export async function connectDB(uri) {
    try {
        await mongoose.connect(uri);
        console.log("✅ DB connected");
    } catch (err) {
        console.error("❌ DB connection error:", err.message);
        process.exit(1);
    }
}