import api from "./client";

// Get admin stats
export async function getAdminStats() {
    const res = await api.get("/admin/stats");
    return res.data;
}

// Get all users
export async function getUsers() {
    const res = await api.get("/admin/users");
    return res.data;
}

// Get single user
export async function getUser(id) {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
}

// Create new user
export async function createUser(data) {
    const res = await api.post("/admin/users", data);
    return res.data;
}

// Update user
export async function updateUser(id, data) {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data;
}

// Delete user
export async function deleteUser(id) {
    const res = await api.delete(`/admin/users/${id}`);
    return res.data;
}

// Get all tasks for monitoring
export async function getAllTasksMonitoring() {
    const res = await api.get("/admin/monitoring/tasks");
    return res.data;
}
