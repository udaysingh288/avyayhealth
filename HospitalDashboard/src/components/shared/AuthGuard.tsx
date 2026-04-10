import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useInactivityTimer } from '../../hooks/useInactivityTimer';
import SessionWarningModal from './SessionWarningModal';

export default function AuthGuard() {
  const token = useAuthStore((s) => s.token);
  const { showWarning, extendSession } = useInactivityTimer();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Outlet />
      {showWarning && <SessionWarningModal onExtend={extendSession} />}
    </>
  );
}
