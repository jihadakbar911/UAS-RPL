import api from "./client";

export async function login(username, password) {
    const res = await api.post("/auth/login", { username, password });
    return res.data; // { token, role, user }
}

export async function register(name, username, password) {
    const res = await api.post("/auth/register", { name, username, password });
    return res.data; // { message, token, role, user }
}

export async function getMe() {
    const res = await api.get("/auth/me");
    return res.data; // user object
}