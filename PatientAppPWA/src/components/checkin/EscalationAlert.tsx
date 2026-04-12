import { motion } from 'framer-motion';
import { haptic } from '../../utils/haptics';

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
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex flex-col bg-warm-oatmeal overflow-y-auto scroll-y"
      style={{
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
      }}
      role="alertdialog"
      aria-modal="true"
      aria-label="Urgent health alert"
    >
      {/* Red glow backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 15%, rgba(220, 38, 38, 0.14), transparent 60%)',
        }}
      />

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-full max-w-md mx-auto flex flex-col items-center">
          {/* Pulsing warning ring */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 16 }}
            className="relative mb-8"
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-[#DC2626]/15"
              animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-[#DC2626]/10"
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
            />
            <div className="relative w-24 h-24 rounded-full bg-[#DC2626] flex items-center justify-center shadow-ios-xl">
              <span
                className="material-symbols-outlined text-white"
                style={{
                  fontVariationSettings: "'FILL' 1, 'wght' 700",
                  fontSize: '52px',
                }}
              >
                priority_high
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-[30px] font-extrabold text-forest-slate tracking-[-0.02em] leading-[1.1] mb-3">
              Let's get that<br />checked right away
            </h1>
            <p className="text-[16px] text-forest-secondary leading-relaxed max-w-[320px] mx-auto">
              Your answers suggest you should speak with a care team member now.
            </p>
          </motion.div>

          {/* Next steps */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="w-full card-ios-lg p-5 mb-6"
          >
            <p className="text-[11px] uppercase tracking-wide text-sage-muted font-bold mb-4">
              What to do next
            </p>
            <ul className="space-y-3.5">
              {[
                'Sit or lie down in a comfortable position.',
                'Do not take extra medication until a nurse reviews your symptoms.',
                'Call 911 now, or tap the button below.',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                    <span className="text-[13px] font-bold text-[#DC2626]">{i + 1}</span>
                  </div>
                  <span className="text-[15px] text-forest-slate leading-relaxed flex-1">
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="w-full space-y-3"
          >
            <a
              href="tel:911"
              onClick={() => haptic('heavy')}
              className="w-full h-[58px] bg-[#DC2626] text-white rounded-full font-bold text-[17px] shadow-ios-lg flex items-center justify-center gap-2 tap-scale active:bg-[#B91C1C] transition-colors tracking-[-0.01em]"
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontVariationSettings: "'FILL' 1, 'wght' 700",
                  fontSize: '22px',
                }}
              >
                call
              </span>
              Call 911
            </a>
            <button
              onClick={() => {
                haptic('light');
                onDismiss();
              }}
              className="w-full h-[54px] font-semibold text-sage-muted text-[15px] rounded-full active:bg-black/[0.03] transition-colors"
            >
              I'm okay — continue check-in
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-[12px] text-sage-muted mt-6 flex items-center gap-1.5"
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: "'FILL' 1",
                fontSize: '14px',
              }}
            >
              notifications_active
            </span>
            {hospitalName} care team notified
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
}
