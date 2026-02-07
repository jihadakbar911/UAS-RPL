import api from "./client";

// Get all categories
export async function getCategories() {
    const res = await api.get("/categories");
    return res.data;
}

// Get single category
export async function getCategory(id) {
    const res = await api.get(`/categories/${id}`);
    return res.data;
}

// Create new category
export async function createCategory(data) {
    const res = await api.post("/categories", data);
    return res.data;
}

// Update category
export async function updateCategory(id, data) {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
}

// Delete category
export async function deleteCategory(id) {
    const res = await api.delete(`/categories/${id}`);
    return res.data;
}
