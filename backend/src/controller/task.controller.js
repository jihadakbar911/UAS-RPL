import Task from "../models/task.js";

// GET semua task milik user (dengan filter opsional)
export async function getAllTasks(req, res) {
    try {
        const { category, isCompleted, priority } = req.query;

        const filter = { createdBy: req.user.id };

        if (category) filter.category = category;
        if (isCompleted !== undefined) filter.isCompleted = isCompleted === "true";
        if (priority) filter.priority = priority;

        const tasks = await Task.find(filter)
            .populate("category", "name color")
            .sort({ createdAt: -1 });

        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// GET satu task by ID
export async function getTaskById(req, res) {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        }).populate("category", "name color");

        if (!task) {
            return res.status(404).json({ message: "Task tidak ditemukan" });
        }

        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// CREATE task baru
export async function createTask(req, res) {
    try {
        const { title, description, priority, dueDate, category } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: "Judul task wajib diisi" });
        }

        const task = new Task({
            title: title.trim(),
            description: description || "",
            priority: priority || "MEDIUM",
            dueDate: dueDate || null,
            category: category || null,
            createdBy: req.user.id,
        });

        await task.save();

        // Populate category sebelum return
        await task.populate("category", "name color");

        res.status(201).json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// UPDATE task
export async function updateTask(req, res) {
    try {
        const { title, description, priority, dueDate, category, isCompleted } = req.body;

        const updateData = {};
        if (title) updateData.title = title.trim();
        if (description !== undefined) updateData.description = description;
        if (priority) updateData.priority = priority;
        if (dueDate !== undefined) updateData.dueDate = dueDate;
        if (category !== undefined) updateData.category = category;
        if (isCompleted !== undefined) updateData.isCompleted = isCompleted;

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id },
            updateData,
            { new: true, runValidators: true }
        ).populate("category", "name color");

        if (!task) {
            return res.status(404).json({ message: "Task tidak ditemukan" });
        }

        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// TOGGLE status selesai task
export async function toggleTaskComplete(req, res) {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!task) {
            return res.status(404).json({ message: "Task tidak ditemukan" });
        }

        task.isCompleted = !task.isCompleted;
        await task.save();
        await task.populate("category", "name color");

        res.json(task);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// DELETE task
export async function deleteTask(req, res) {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!task) {
            return res.status(404).json({ message: "Task tidak ditemukan" });
        }

        res.json({ message: "Task berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// GET statistik task
export async function getTaskStats(req, res) {
    try {
        const userId = req.user.id;

        const [total, completed, pending, highPriority] = await Promise.all([
            Task.countDocuments({ createdBy: userId }),
            Task.countDocuments({ createdBy: userId, isCompleted: true }),
            Task.countDocuments({ createdBy: userId, isCompleted: false }),
            Task.countDocuments({ createdBy: userId, priority: "HIGH", isCompleted: false }),
        ]);

        res.json({
            total,
            completed,
            pending,
            highPriority,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}
