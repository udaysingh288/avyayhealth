import { motion } from 'framer-motion';

interface EscalationAlertProps {
  hospitalName: string;
  onDismiss: () => void;
}

export default function EscalationAlert({ hospitalName, onDismiss }: EscalationAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
      style={{
        backgroundColor: 'rgba(229, 139, 136, 0.15)',
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
      role="alertdialog"
      aria-modal="true"
      aria-label="Urgent health alert"
    >
      <div className="w-full max-w-md mx-auto flex flex-col items-center space-y-8">
        {/* Animated icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="w-32 h-32 rounded-full bg-white shadow-soft flex items-center justify-center text-triage-red relative"
        >
          <div className="absolute inset-0 rounded-full border-4 border-triage-red opacity-20 scale-110" />
          <span
            className="material-symbols-outlined text-triage-red"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: '64px' }}
          >
            warning
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-2"
        >
          <h1 className="font-display font-bold text-[28px] leading-tight text-forest-slate">
            Let's get that checked out.
          </h1>
          <p className="text-sage-muted text-base px-4">
            Your answers suggest we should have a care team member review your symptoms.
          </p>
        </motion.div>

        {/* Next steps */}
        <div className="w-full bg-white rounded-2xl shadow-soft p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-forest-slate border-b border-gray-100 pb-3">
            Next Steps
          </h2>
          <ul className="space-y-4 text-base text-forest-slate">
            {[
              'Rest comfortably in a seated position if possible.',
              'Do not take any additional pain medication until you speak with the team.',
              'Call the triage line using the button below.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-triage-red-light flex items-center justify-center text-triage-red">
                  <span className="text-sm font-bold">{i + 1}</span>
                </div>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <a
            href="tel:911"
            className="w-full h-14 bg-triage-red text-white rounded-full font-display font-bold text-lg shadow-soft flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              call
            </span>
            Call 911
          </a>
          <button
            onClick={onDismiss}
            className="w-full py-3 text-sm text-sage-muted font-medium underline hover:text-forest-slate transition-colors"
          >
            I'm okay — continue check-in
          </button>
        </div>

        <p className="text-center text-xs text-sage-muted">
          {hospitalName} care team has been notified.
        </p>
      </div>
    </motion.div>
  );
}
