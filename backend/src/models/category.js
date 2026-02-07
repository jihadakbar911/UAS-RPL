import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        color: { type: String, default: "#3B82F6" }, // Warna untuk UI
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

// Index untuk memastikan nama kategori unik per user
categorySchema.index({ name: 1, createdBy: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);
