import bcrypt from "bcrypt";
import User from "../models/user.js";
import Task from "../models/task.js";

// GET semua users (Admin only)
export async function getAllUsers(req, res) {
    try {
        const users = await User.find()
            .select("-passwordHash")
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// GET single user by ID (Admin only)
export async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id).select("-passwordHash");
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// CREATE new user (Admin only)
export async function createUser(req, res) {
    try {
        const { name, username, password, role } = req.body;

        if (!name || !username || !password) {
            return res.status(400).json({ message: "Nama, username, dan password wajib diisi" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password minimal 6 karakter" });
        }

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username sudah digunakan" });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            username,
            passwordHash,
            role: role || "USER"
        });

        await user.save();

        // Return user without passwordHash
        const userResponse = user.toObject();
        delete userResponse.passwordHash;

        res.status(201).json(userResponse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// UPDATE user (Admin only)
export async function updateUser(req, res) {
    try {
        const { name, username, password, role } = req.body;

        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Check username uniqueness if changed
        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) {
                return res.status(400).json({ message: "Username sudah digunakan" });
            }
            user.username = username;
        }

        if (name) user.name = name;
        if (role) user.role = role;
        if (password && password.length >= 6) {
            user.passwordHash = await bcrypt.hash(password, 10);
        }

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.passwordHash;

        res.json(userResponse);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// DELETE user (Admin only)
export async function deleteUser(req, res) {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User tidak ditemukan" });
        }

        // Prevent deleting self
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ message: "Tidak dapat menghapus akun sendiri" });
        }

        await User.findByIdAndDelete(req.params.id);

        res.json({ message: "User berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// GET all tasks from all users (Admin monitoring - read only)
export async function getAllTasksMonitoring(req, res) {
    try {
        const tasks = await Task.find()
            .populate("createdBy", "name username")
            .populate("category", "name color")
            .sort({ createdAt: -1 });
        res.json(tasks);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// GET stats for admin dashboard
export async function getAdminStats(req, res) {
    try {
        const [totalUsers, totalTasks, completedTasks, totalCategories] = await Promise.all([
            User.countDocuments(),
            Task.countDocuments(),
            Task.countDocuments({ isCompleted: true }),
            (await import("../models/category.js")).default.countDocuments()
        ]);

        res.json({
            totalUsers,
            totalTasks,
            completedTasks,
            pendingTasks: totalTasks - completedTasks,
            totalCategories,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}
