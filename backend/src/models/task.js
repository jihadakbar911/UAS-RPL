import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        isCompleted: { type: Boolean, default: false },
        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "MEDIUM"
        },
        dueDate: { type: Date, default: null },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default: null
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
    },
    { timestamps: true }
);

// Index untuk query yang sering digunakan
taskSchema.index({ createdBy: 1, isCompleted: 1 });
taskSchema.index({ createdBy: 1, category: 1 });
taskSchema.index({ createdBy: 1, dueDate: 1 });

export default mongoose.model("Task", taskSchema);
