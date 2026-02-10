import dotenv from "dotenv";
// Load .env paling pertama supaya process.env terbaca
dotenv.config();

import app from "./src/app.js";
import { connectDB } from "./src/config/db.js"; // Pastikan path ini benar sesuai folder kamu

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// Fungsi async untuk memastikan DB connect DULUAN, baru server nyala
const startServer = async () => {
  try {
    // 1. Cek apakah URI MongoDB ada
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI variable is not defined in .env");
    }

    // 2. Connect ke Database
    console.log("⏳ Connecting to Database...");
    await connectDB(MONGODB_URI);
    console.log("✅ Database connected successfully");

    // 3. Jalankan Server
    // PENTING: Host "0.0.0.0" wajib untuk Railway/Docker
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Local: http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1); // Matikan proses jika DB gagal connect
  }
};

startServer();