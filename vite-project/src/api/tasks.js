import api from "./client";

// Get all tasks with optional filters
export async function getTasks(filters = {}) {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.isCompleted !== undefined) params.append("isCompleted", filters.isCompleted);
    if (filters.priority) params.append("priority", filters.priority);

    const query = params.toString();
    const res = await api.get(`/tasks${query ? `?${query}` : ""}`);
    return res.data;
}

// Get task stats
export async function getTaskStats() {
    const res = await api.get("/tasks/stats");
    return res.data;
}

// Get single task
export async function getTask(id) {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
}

// Create new task
export async function createTask(data) {
    const res = await api.post("/tasks", data);
    return res.data;
}

// Update task
export async function updateTask(id, data) {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data;
}

// Toggle task complete status
export async function toggleTaskComplete(id) {
    const res = await api.patch(`/tasks/${id}/toggle`);
    return res.data;
}

// Delete task
export async function deleteTask(id) {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
}
