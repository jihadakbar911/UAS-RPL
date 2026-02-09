import { useSessionTimeout } from "../hooks/useSessionTimeout";
import "./SessionWarning.css";

export default function SessionWarning() {
    const { showWarning, remainingTime, extendSession, logout } = useSessionTimeout({
        timeout: 15 * 60 * 1000, // 15 menit
        warningBefore: 60 * 1000  // Warning 1 menit sebelum logout
    });

    if (!showWarning) return null;

    return (
        <div className="session-warning-overlay">
            <div className="session-warning-modal">
                <div className="warning-icon">⏰</div>
                <h2>Sesi Akan Berakhir</h2>
                <p>Anda akan otomatis logout dalam</p>
                <div className="countdown">{remainingTime} detik</div>
                <p className="warning-text">Klik "Lanjutkan" untuk tetap login</p>
                <div className="warning-actions">
                    <button className="btn-extend" onClick={extendSession}>
                        ✅ Lanjutkan
                    </button>
                    <button className="btn-logout" onClick={logout}>
                        🚪 Logout Sekarang
                    </button>
                </div>
            </div>
        </div>
    );
}
