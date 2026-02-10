import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { login } from "../api/auth";
import "./Auth.css";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [sessionExpired, setSessionExpired] = useState(false);
    const token = sessionStorage.getItem("token");

    // CAPTCHA state
    const [captchaNum1, setCaptchaNum1] = useState(0);
    const [captchaNum2, setCaptchaNum2] = useState(0);
    const [captchaAnswer, setCaptchaAnswer] = useState("");

    // Generate new CAPTCHA
    const generateCaptcha = useCallback(() => {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        setCaptchaNum1(num1);
        setCaptchaNum2(num2);
        setCaptchaAnswer("");
    }, []);

    useEffect(() => {
        generateCaptcha();
        // Check if session expired
        if (searchParams.get("expired") === "true") {
            setSessionExpired(true);
        }
    }, [generateCaptcha, searchParams]);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        // Validate CAPTCHA
        const correctAnswer = captchaNum1 + captchaNum2;
        if (parseInt(captchaAnswer) !== correctAnswer) {
            setError("Jawaban CAPTCHA salah. Silakan coba lagi.");
            generateCaptcha();
            return;
        }

        setLoading(true);

        try {
            const data = await login(username, password);

            sessionStorage.setItem("token", data.token);
            sessionStorage.setItem("role", data.role);
            sessionStorage.setItem("user", JSON.stringify(data.user));

            // Redirect based on role
            if (data.role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/user");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login gagal. Cek username/password.");
            generateCaptcha();
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            <div className="auth-card">
                <div className="auth-header">
                    <div className="auth-logo">📋</div>
                    <h1>Task Manager</h1>
                    <p>Kelola tugas Anda dengan mudah</p>
                </div>

                {sessionExpired && (
                    <div className="auth-info">
                        ⏰ Sesi Anda telah berakhir. Silakan login kembali.
                    </div>
                )}

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <div className="input-wrapper">
                            <input
                                id="username"
                                type="text"
                                placeholder="Masukkan username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-wrapper">
                            <input
                                id="password"
                                type="password"
                                placeholder="Masukkan password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group captcha-group">
                        <label>Verifikasi CAPTCHA</label>
                        <div className="captcha-container">
                            <div className="captcha-question">
                                <span className="captcha-text">{captchaNum1} + {captchaNum2} = ?</span>
                                <button
                                    type="button"
                                    className="captcha-refresh"
                                    onClick={generateCaptcha}
                                    title="Generate ulang CAPTCHA"
                                >
                                    🔄
                                </button>
                            </div>
                            <div className="input-wrapper">
                                <input
                                    id="captcha"
                                    type="text"
                                    placeholder="Jawaban"
                                    value={captchaAnswer}
                                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                                    required
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            "Masuk"
                        )}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Belum punya akun? <Link to="/register">Daftar sekarang</Link></p>
                </div>
            </div>
        </div>
    );
}