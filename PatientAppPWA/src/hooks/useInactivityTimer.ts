import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientStore } from '../store/patientStore';

const TIMEOUT_MS = Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES ?? 30) * 60 * 1000;
const WARNING_MS = 60 * 1000;

export function useInactivityTimer() {
  const clearSession = usePatientStore((s) => s.clearSession);
  const token = usePatientStore((s) => s.token);
  const navigate = useNavigate();
  const [showWarning, setShowWarning] = useState(false);
  const logoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function reset() {
    setShowWarning(false);
    if (logoutRef.current) clearTimeout(logoutRef.current);
    if (warnRef.current) clearTimeout(warnRef.current);
    if (!token) return;
    warnRef.current = setTimeout(() => setShowWarning(true), TIMEOUT_MS - WARNING_MS);
    logoutRef.current = setTimeout(() => { clearSession(); navigate('/enroll'); }, TIMEOUT_MS);
  }

  useEffect(() => {
    if (!token) return;
    reset();
    const events = ['touchstart', 'mousedown', 'keydown', 'scroll'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      if (logoutRef.current) clearTimeout(logoutRef.current);
      if (warnRef.current) clearTimeout(warnRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return { showWarning, extendSession: reset };
}
