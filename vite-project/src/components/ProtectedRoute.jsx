import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // If not logged in, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If role is specified and user's role is not allowed, redirect
    if (allowedRoles && !allowedRoles.includes(role)) {
        // Redirect admin to admin page, user to user page
        if (role === "ADMIN") {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/user" replace />;
    }

    return children;
}
