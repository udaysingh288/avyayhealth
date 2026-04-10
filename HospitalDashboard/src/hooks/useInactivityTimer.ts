import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const TIMEOUT_MS = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES ?? 15) * 60 * 1000;
const WARNING_MS = 60 * 1000; // show warning 60s before logout

export function useInactivityTimer() {
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function reset() {
    setShowWarning(false);
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);

    if (!token) return;

    warnTimerRef.current = setTimeout(() => {
      setShowWarning(true);
    }, TIMEOUT_MS - WARNING_MS);

    logoutTimerRef.current = setTimeout(() => {
      clearAuth();
      navigate('/login');
    }, TIMEOUT_MS);
  }

  useEffect(() => {
    if (!token) return;

    reset();

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
      if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { showWarning, extendSession: reset };
}
