import jwt from "jsonwebtoken";

export function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Token tidak ditemukan" });
        }

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role,
        };

        next();
    } catch (err) {
        return res.status(401).json({ message: "Token tidak valid" });
    }
}

// Middleware untuk cek role admin
export function adminOnly(req, res, next) {
    if (req.user.role !== "ADMIN") {
        return res.status(403).json({ message: "Akses ditolak. Hanya admin yang diizinkan." });
    }
    next();
}
