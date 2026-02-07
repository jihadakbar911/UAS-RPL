import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminHome from "./pages/AdminHome";
import UserHome from "./pages/UserHome";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
    // Determine default redirect based on auth status
    // Read from localStorage directly to get the latest values
    function getDefaultRedirect() {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        if (!token) return "/login";
        return role === "ADMIN" ? "/admin" : "/user";
    }

    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes - Admin */}
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminHome />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Routes - User */}
                <Route
                    path="/user"
                    element={
                        <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                            <UserHome />
                        </ProtectedRoute>
                    }
                />

                {/* Default Redirect */}
                <Route path="*" element={<Navigate to={getDefaultRedirect()} replace />} />
            </Routes>
        </BrowserRouter>
    );
}