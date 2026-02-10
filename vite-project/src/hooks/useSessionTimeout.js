import { useEffect, useCallback, useRef, useState } from "react";

// Default timeout: 15 minutes (in milliseconds)
const DEFAULT_TIMEOUT = 1 * 60 * 1000;
// Warning before logout: 1 minute before timeout
const WARNING_BEFORE = 60 * 1000;

export function useSessionTimeout(options = {}) {
    const {
        timeout = DEFAULT_TIMEOUT,
        onTimeout,
        onWarning,
        warningBefore = WARNING_BEFORE
    } = options;

    const [showWarning, setShowWarning] = useState(false);
    const [remainingTime, setRemainingTime] = useState(warningBefore / 1000);
    const timeoutRef = useRef(null);
    const warningRef = useRef(null);
    const countdownRef = useRef(null);

    const clearTimers = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (warningRef.current) clearTimeout(warningRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
    }, []);

    const handleTimeout = useCallback(() => {
        clearTimers();
        setShowWarning(false);
        if (onTimeout) {
            onTimeout();
        } else {
            // Default: logout
            sessionStorage.removeItem("token");
            sessionStorage.removeItem("role");
            sessionStorage.removeItem("user");
            window.location.href = "/login?expired=true";
        }
    }, [onTimeout, clearTimers]);

    const startCountdown = useCallback(() => {
        setRemainingTime(warningBefore / 1000);
        setShowWarning(true);
        if (onWarning) onWarning();

        countdownRef.current = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [warningBefore, onWarning]);

    const resetTimer = useCallback(() => {
        clearTimers();
        setShowWarning(false);

        // Set warning timer
        warningRef.current = setTimeout(() => {
            startCountdown();
        }, timeout - warningBefore);

        // Set timeout timer
        timeoutRef.current = setTimeout(() => {
            handleTimeout();
        }, timeout);
    }, [timeout, warningBefore, clearTimers, startCountdown, handleTimeout]);

    const extendSession = useCallback(() => {
        resetTimer();
    }, [resetTimer]);

    useEffect(() => {
        // Check if user is logged in
        const token = sessionStorage.getItem("token");
        if (!token) return;

        // Events that indicate user activity
        const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart", "click"];

        const handleActivity = () => {
            if (!showWarning) {
                resetTimer();
            }
        };

        // Add event listeners
        events.forEach(event => {
            document.addEventListener(event, handleActivity);
        });

        // Start initial timer
        resetTimer();

        // Cleanup
        return () => {
            clearTimers();
            events.forEach(event => {
                document.removeEventListener(event, handleActivity);
            });
        };
    }, [resetTimer, clearTimers, showWarning]);

    return {
        showWarning,
        remainingTime,
        extendSession,
        logout: handleTimeout
    };
}
