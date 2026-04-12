import { Navigate, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePatientStore } from '../../store/patientStore';
import { useInactivityTimer } from '../../hooks/useInactivityTimer';
import BottomNav from './BottomNav';
import PrimaryButton from './PrimaryButton';

export default function AuthGuard() {
  const token = usePatientStore((s) => s.token);
  const { showWarning, extendSession } = useInactivityTimer();

  if (!token) {
    return <Navigate to="/enroll" replace />;
  }

  return (
    <div className="flex flex-col h-dvh bg-warm-oatmeal">
      <div className="flex-1 min-h-0 flex flex-col">
        <Outlet />
      </div>
      <BottomNav />

      {/* Inactivity warning */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <motion.div
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              className="bg-white rounded-t-3xl px-5 pt-5 pb-6 w-full max-w-lg shadow-2xl text-center"
            >
              <div className="text-4xl mb-3" aria-hidden="true">⏱️</div>
              <h2 className="font-serif text-xl text-slate-800 mb-2">Still there?</h2>
              <p className="font-sans text-slate-500 text-base mb-5">
                For your privacy, you'll be signed out in 60 seconds.
              </p>
              <PrimaryButton onClick={extendSession}>
                I'm still here
              </PrimaryButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
