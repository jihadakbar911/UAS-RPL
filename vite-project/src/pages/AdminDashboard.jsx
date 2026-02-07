import { useState, useEffect } from "react";
import { getAdminStats, getUsers, createUser, updateUser, deleteUser, getAllTasksMonitoring } from "../api/admin";
import { getCategories, createCategory, deleteCategory } from "../api/categories";
import "./AdminDashboard.css";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("overview");
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showUserModal, setShowUserModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Form states
    const [userForm, setUserForm] = useState({
        name: "",
        username: "",
        password: "",
        role: "USER"
    });
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        description: "",
        color: "#3B82F6"
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [statsData, usersData, tasksData, categoriesData] = await Promise.all([
                getAdminStats(),
                getUsers(),
                getAllTasksMonitoring(),
                getCategories()
            ]);
            setStats(statsData);
            setUsers(usersData);
            setTasks(tasksData);
            setCategories(categoriesData);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }

    // User handlers
    async function handleCreateUser(e) {
        e.preventDefault();
        try {
            await createUser(userForm);
            setShowUserModal(false);
            resetUserForm();
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal membuat user");
        }
    }

    async function handleUpdateUser(e) {
        e.preventDefault();
        try {
            const updateData = { ...userForm };
            if (!updateData.password) delete updateData.password;
            await updateUser(editingUser._id, updateData);
            setShowUserModal(false);
            setEditingUser(null);
            resetUserForm();
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal mengupdate user");
        }
    }

    async function handleDeleteUser(id) {
        if (!confirm("Yakin ingin menghapus user ini?")) return;
        try {
            await deleteUser(id);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menghapus user");
        }
    }

    function openEditUser(user) {
        setEditingUser(user);
        setUserForm({
            name: user.name,
            username: user.username,
            password: "",
            role: user.role
        });
        setShowUserModal(true);
    }

    function resetUserForm() {
        setUserForm({ name: "", username: "", password: "", role: "USER" });
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
            alert(err.response?.data?.message || "Gagal membuat kategori");
        }
    }

    async function handleDeleteCategory(id) {
        if (!confirm("Yakin ingin menghapus kategori ini?")) return;
        try {
            await deleteCategory(id);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || "Gagal menghapus kategori");
        }
    }

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="admin-header">
                <h1>🛠️ Admin Panel</h1>
                <button className="btn btn-logout" onClick={handleLogout}>Logout</button>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card users">
                    <span className="stat-icon">👥</span>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalUsers}</span>
                        <span className="stat-label">Total Users</span>
                    </div>
                </div>
                <div className="stat-card tasks">
                    <span className="stat-icon">📋</span>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalTasks}</span>
                        <span className="stat-label">Total Tasks</span>
                    </div>
                </div>
                <div className="stat-card completed">
                    <span className="stat-icon">✅</span>
                    <div className="stat-info">
                        <span className="stat-number">{stats.completedTasks}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                </div>
                <div className="stat-card categories">
                    <span className="stat-icon">📁</span>
                    <div className="stat-info">
                        <span className="stat-number">{stats.totalCategories}</span>
                        <span className="stat-label">Categories</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={activeTab === "overview" ? "active" : ""}
                    onClick={() => setActiveTab("overview")}
                >
                    📊 Overview
                </button>
                <button
                    className={activeTab === "users" ? "active" : ""}
                    onClick={() => setActiveTab("users")}
                >
                    👥 Kelola Users
                </button>
                <button
                    className={activeTab === "categories" ? "active" : ""}
                    onClick={() => setActiveTab("categories")}
                >
                    📁 Kelola Kategori
                </button>
                <button
                    className={activeTab === "monitoring" ? "active" : ""}
                    onClick={() => setActiveTab("monitoring")}
                >
                    📋 Monitoring Tugas
                </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {/* Overview Tab */}
                {activeTab === "overview" && (
                    <div className="overview-section">
                        <h2>Dashboard Overview</h2>
                        <div className="overview-grid">
                            <div className="overview-card">
                                <h3>Completion Rate</h3>
                                <div className="progress-ring">
                                    <span className="progress-value">{stats.completionRate}%</span>
                                </div>
                            </div>
                            <div className="overview-card">
                                <h3>Recent Users</h3>
                                <ul className="recent-list">
                                    {users.slice(0, 5).map(user => (
                                        <li key={user._id}>
                                            <span className="user-avatar">{user.name.charAt(0)}</span>
                                            <span>{user.name}</span>
                                            <span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === "users" && (
                    <div className="users-section">
                        <div className="section-header">
                            <h2>Kelola Users</h2>
                            <button className="btn btn-primary" onClick={() => { setEditingUser(null); resetUserForm(); setShowUserModal(true); }}>
                                + Tambah User
                            </button>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nama</th>
                                    <th>Username</th>
                                    <th>Role</th>
                                    <th>Dibuat</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.username}</td>
                                        <td><span className={`role-badge ${user.role.toLowerCase()}`}>{user.role}</span></td>
                                        <td>{new Date(user.createdAt).toLocaleDateString("id-ID")}</td>
                                        <td>
                                            <button className="btn-icon" onClick={() => openEditUser(user)}>✏️</button>
                                            <button className="btn-icon delete" onClick={() => handleDeleteUser(user._id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Categories Tab */}
                {activeTab === "categories" && (
                    <div className="categories-section">
                        <div className="section-header">
                            <h2>Kelola Kategori</h2>
                            <button className="btn btn-primary" onClick={() => setShowCategoryModal(true)}>
                                + Tambah Kategori
                            </button>
                        </div>
                        <div className="categories-grid">
                            {categories.map(cat => (
                                <div key={cat._id} className="category-card">
                                    <div className="category-color" style={{ background: cat.color }}></div>
                                    <div className="category-info">
                                        <h3>{cat.name}</h3>
                                        <p>{cat.description || "Tidak ada deskripsi"}</p>
                                    </div>
                                    <button className="btn-delete" onClick={() => handleDeleteCategory(cat._id)}>🗑️</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Monitoring Tab */}
                {activeTab === "monitoring" && (
                    <div className="monitoring-section">
                        <div className="section-header">
                            <h2>Monitoring Tugas Seluruh User</h2>
                            <span className="total-badge">{tasks.length} tugas</span>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Judul</th>
                                    <th>User</th>
                                    <th>Kategori</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Dibuat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task._id} className={task.isCompleted ? "completed" : ""}>
                                        <td>{task.title}</td>
                                        <td>{task.createdBy?.name || "Unknown"}</td>
                                        <td>
                                            {task.category ? (
                                                <span className="category-tag" style={{ borderColor: task.category.color }}>
                                                    {task.category.name}
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td><span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span></td>
                                        <td>
                                            <span className={`status ${task.isCompleted ? "done" : "pending"}`}>
                                                {task.isCompleted ? "Selesai" : "Pending"}
                                            </span>
                                        </td>
                                        <td>{new Date(task.createdAt).toLocaleDateString("id-ID")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* User Modal */}
            {showUserModal && (
                <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingUser ? "Edit User" : "Tambah User Baru"}</h2>
                        <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                            <div className="form-group">
                                <label>Nama *</label>
                                <input
                                    type="text"
                                    value={userForm.name}
                                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    value={userForm.username}
                                    onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>{editingUser ? "Password (kosongkan jika tidak diubah)" : "Password *"}</label>
                                <input
                                    type="password"
                                    value={userForm.password}
                                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                    required={!editingUser}
                                    minLength={6}
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    value={userForm.role}
                                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                                >
                                    <option value="USER">User</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>
                                    Batal
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingUser ? "Update" : "Simpan"}
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
