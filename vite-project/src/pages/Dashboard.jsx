import { useState, useEffect } from "react";
import { getTasks, createTask, updateTask, deleteTask, toggleTaskComplete, getTaskStats } from "../api/tasks";
import { getCategories, createCategory, deleteCategory } from "../api/categories";
import "./Dashboard.css";

export default function Dashboard() {
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, completionRate: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState({ category: "", isCompleted: "" });

    // Modal states
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    // Form states
    const [taskForm, setTaskForm] = useState({
        title: "",
        description: "",
        priority: "MEDIUM",
        category: "",
        dueDate: ""
    });
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: "",
        color: "#3B82F6"
    });

    useEffect(() => {
        loadData();
    }, [filter]);

    async function loadData() {
        try {
            setLoading(true);
            const [tasksData, categoriesData, statsData] = await Promise.all([
                getTasks(filter),
                getCategories(),
                getTaskStats()
            ]);
            setTasks(tasksData);
            setCategories(categoriesData);
            setStats(statsData);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }

    // Task handlers
    async function handleCreateTask(e) {
        e.preventDefault();
        try {
            await createTask({
                ...taskForm,
                category: taskForm.category || null,
                dueDate: taskForm.dueDate || null
            });
            setShowTaskModal(false);
            resetTaskForm();
            loadData();
        } catch (err) {
            alert("Gagal membuat task");
        }
    }

    async function handleUpdateTask(e) {
        e.preventDefault();
        try {
            await updateTask(editingTask._id, {
                ...taskForm,
                category: taskForm.category || null,
                dueDate: taskForm.dueDate || null
            });
            setShowTaskModal(false);
            setEditingTask(null);
            resetTaskForm();
            loadData();
        } catch (err) {
            alert("Gagal mengupdate task");
        }
    }

    async function handleDeleteTask(id) {
        if (!confirm("Yakin ingin menghapus task ini?")) return;
        try {
            await deleteTask(id);
            loadData();
        } catch (err) {
            alert("Gagal menghapus task");
        }
    }

    async function handleToggleComplete(id) {
        try {
            await toggleTaskComplete(id);
            loadData();
        } catch (err) {
            alert("Gagal mengubah status task");
        }
    }

    function openEditTask(task) {
        setEditingTask(task);
        setTaskForm({
            title: task.title,
            description: task.description || "",
            priority: task.priority,
            category: task.category?._id || "",
            dueDate: task.dueDate ? task.dueDate.split("T")[0] : ""
        });
        setShowTaskModal(true);
    }

    function resetTaskForm() {
        setTaskForm({
            title: "",
            description: "",
            priority: "MEDIUM",
            category: "",
            dueDate: ""
        });
    }

    // Category handlers
    async function handleCreateCategory(e) {
        e.preventDefault();
        try {
            await createCategory(categoryForm);
            setShowCategoryModal(false);
            setCategoryForm({ name: "", description: "", color: "#3B82F6" });
            loadData();
        } catch (err) {
            alert("Gagal membuat kategori");
        }
    }

    async function handleDeleteCategory(id) {
        if (!confirm("Yakin ingin menghapus kategori ini?")) return;
        try {
            await deleteCategory(id);
            loadData();
        } catch (err) {
            alert("Gagal menghapus kategori");
        }
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        window.location.href = "/login";
    }

    function getPriorityClass(priority) {
        switch (priority) {
            case "HIGH": return "priority-high";
            case "MEDIUM": return "priority-medium";
            case "LOW": return "priority-low";
            default: return "";
        }
    }

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <h1>📋 Task Manager</h1>
                <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
            </header>

            {/* Stats Cards */}
            <div className="stats-container">
                <div className="stat-card">
                    <span className="stat-number">{stats.total}</span>
                    <span className="stat-label">Total Tasks</span>
                </div>
                <div className="stat-card completed">
                    <span className="stat-number">{stats.completed}</span>
                    <span className="stat-label">Completed</span>
                </div>
                <div className="stat-card pending">
                    <span className="stat-number">{stats.pending}</span>
                    <span className="stat-label">Pending</span>
                </div>
                <div className="stat-card rate">
                    <span className="stat-number">{stats.completionRate}%</span>
                    <span className="stat-label">Completion</span>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Sidebar - Categories */}
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <h2>Kategori</h2>
                        <button className="btn btn-sm" onClick={() => setShowCategoryModal(true)}>+ Tambah</button>
                    </div>
                    <ul className="category-list">
                        <li
                            className={filter.category === "" ? "active" : ""}
                            onClick={() => setFilter({ ...filter, category: "" })}
                        >
                            <span className="category-color" style={{ background: "#6B7280" }}></span>
                            Semua Kategori
                        </li>
                        {categories.map(cat => (
                            <li
                                key={cat._id}
                                className={filter.category === cat._id ? "active" : ""}
                                onClick={() => setFilter({ ...filter, category: cat._id })}
                            >
                                <span className="category-color" style={{ background: cat.color }}></span>
                                {cat.name}
                                <button
                                    className="btn-delete-cat"
                                    onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat._id); }}
                                >×</button>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Tasks Section */}
                <section className="tasks-section">
                    <div className="tasks-header">
                        <h2>Daftar Tugas</h2>
                        <div className="tasks-actions">
                            <select
                                value={filter.isCompleted}
                                onChange={(e) => setFilter({ ...filter, isCompleted: e.target.value })}
                            >
                                <option value="">Semua Status</option>
                                <option value="false">Belum Selesai</option>
                                <option value="true">Selesai</option>
                            </select>
                            <button className="btn btn-primary" onClick={() => { setEditingTask(null); resetTaskForm(); setShowTaskModal(true); }}>
                                + Tambah Task
                            </button>
                        </div>
                    </div>

                    {tasks.length === 0 ? (
                        <div className="empty-state">
                            <p>Belum ada task. Buat task pertama Anda!</p>
                        </div>
                    ) : (
                        <ul className="task-list">
                            {tasks.map(task => (
                                <li key={task._id} className={`task-item ${task.isCompleted ? "completed" : ""}`}>
                                    <div className="task-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={task.isCompleted}
                                            onChange={() => handleToggleComplete(task._id)}
                                        />
                                    </div>
                                    <div className="task-content">
                                        <h3>{task.title}</h3>
                                        {task.description && <p>{task.description}</p>}
                                        <div className="task-meta">
                                            <span className={`priority ${getPriorityClass(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            {task.category && (
                                                <span className="category-tag" style={{ borderColor: task.category.color }}>
                                                    {task.category.name}
                                                </span>
                                            )}
                                            {task.dueDate && (
                                                <span className="due-date">
                                                    📅 {new Date(task.dueDate).toLocaleDateString("id-ID")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="task-actions">
                                        <button className="btn-edit" onClick={() => openEditTask(task)}>✏️</button>
                                        <button className="btn-delete" onClick={() => handleDeleteTask(task._id)}>🗑️</button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>

            {/* Task Modal */}
            {showTaskModal && (
                <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingTask ? "Edit Task" : "Tambah Task Baru"}</h2>
                        <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask}>
                            <div className="form-group">
                                <label>Judul *</label>
                                <input
                                    type="text"
                                    value={taskForm.title}
                                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    value={taskForm.description}
                                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Prioritas</label>
                                    <select
                                        value={taskForm.priority}
                                        onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Kategori</label>
                                    <select
                                        value={taskForm.category}
                                        onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                                    >
                                        <option value="">Tanpa Kategori</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Due Date</label>
                                <input
                                    type="date"
                                    value={taskForm.dueDate}
                                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingTask ? "Update" : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="modal-overlay" onClick={() => setShowCategoryModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Tambah Kategori Baru</h2>
                        <form onSubmit={handleCreateCategory}>
                            <div className="form-group">
                                <label>Nama Kategori *</label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Deskripsi</label>
                                <textarea
                                    value={categoryForm.description}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    rows={2}
                                />
                            </div>
                            <div className="form-group">
                                <label>Warna</label>
                                <input
                                    type="color"
                                    value={categoryForm.color}
                                    onChange={(e) => setCategoryForm({ ...categoryForm, color: e.target.value })}
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
