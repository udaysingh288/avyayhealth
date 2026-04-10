import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';

interface EscalationAlertProps {
  hospitalName: string;
  onDismiss: () => void;
}

export default function EscalationAlert({ hospitalName, onDismiss }: EscalationAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-red-50 flex flex-col px-5 py-8 justify-between"
      style={{
        paddingTop: 'max(48px, env(safe-area-inset-top))',
        paddingBottom: 'max(32px, env(safe-area-inset-bottom))',
      }}
      role="alertdialog"
      aria-modal="true"
      aria-label="Urgent health alert"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6"
        >
          <span className="text-5xl" aria-hidden="true">⚠️</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="font-serif text-3xl text-red-800 mb-4 leading-tight">
            This sounds urgent.
          </h1>
          <p className="font-sans text-red-700 text-xl leading-relaxed mb-3">
            Please call <strong>911</strong> or go to your nearest emergency room right away.
          </p>
          <p className="font-sans text-red-600 text-base leading-relaxed">
            Your care team at {hospitalName} has also been notified.
          </p>
        </motion.div>
      </div>

      <div className="space-y-3">
        <a
          href="tel:911"
          className="flex items-center justify-center gap-3 w-full min-h-[64px] bg-red-600 text-white
            font-sans font-semibold text-xl rounded-2xl shadow-lg
            active:bg-red-700 transition focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          <Phone size={24} aria-hidden="true" />
          Call 911
        </a>
        <button
          onClick={onDismiss}
          className="w-full py-4 font-sans font-medium text-red-600 text-lg
            border-2 border-red-200 rounded-2xl bg-white
            active:bg-red-50 transition focus:outline-none focus:ring-2 focus:ring-red-300"
        >
          I'm okay — continue check-in
        </button>
      </div>
    </motion.div>
  );
}
