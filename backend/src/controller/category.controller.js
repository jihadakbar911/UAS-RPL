import Category from "../models/category.js";

// GET semua kategori (Admin: semua kategori, User: kategori milik sendiri)
export async function getAllCategories(req, res) {
    try {
        let filter = { createdBy: req.user.id };

        // Admin dapat melihat semua kategori
        if (req.user.role === "ADMIN") {
            filter = {};
        }

        const categories = await Category.find(filter)
            .populate("createdBy", "name username")
            .sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// GET satu kategori by ID
export async function getCategoryById(req, res) {
    try {
        const category = await Category.findOne({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!category) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }

        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// CREATE kategori baru
export async function createCategory(req, res) {
    try {
        const { name, description, color } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Nama kategori wajib diisi" });
        }

        const category = new Category({
            name: name.trim(),
            description: description || "",
            color: color || "#3B82F6",
            createdBy: req.user.id,
        });

        await category.save();
        res.status(201).json(category);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Kategori dengan nama tersebut sudah ada" });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// UPDATE kategori
export async function updateCategory(req, res) {
    try {
        const { name, description, color } = req.body;

        const category = await Category.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id },
            {
                ...(name && { name: name.trim() }),
                ...(description !== undefined && { description }),
                ...(color && { color }),
            },
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }

        res.json(category);
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ message: "Kategori dengan nama tersebut sudah ada" });
        }
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}

// DELETE kategori
export async function deleteCategory(req, res) {
    try {
        const category = await Category.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user.id
        });

        if (!category) {
            return res.status(404).json({ message: "Kategori tidak ditemukan" });
        }

        res.json({ message: "Kategori berhasil dihapus" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
}
