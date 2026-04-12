import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import PrimaryButton from '../shared/PrimaryButton';
import AvyayLogo from '../shared/AvyayLogo';
import { haptic } from '../../utils/haptics';

interface AddToHomePromptProps {
  onDone: () => void;
}

type DeviceType = 'ios' | 'android' | 'other';

function detectDevice(): DeviceType {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  // iPadOS 13+ reports as Mac desktop in Safari
  if (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function AddToHomePrompt({ onDone }: AddToHomePromptProps) {
  const [device] = useState<DeviceType>(detectDevice);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    haptic('medium');
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    }
    onDone();
  }

  const iosSteps = [
    {
      step: 1,
      title: 'Tap the Share button',
      sub: 'At the bottom of Safari',
      icon: 'ios_share',
    },
    {
      step: 2,
      title: 'Tap "Add to Home Screen"',
      sub: 'Scroll down if needed',
      icon: 'add_box',
    },
    {
      step: 3,
      title: 'Tap "Add"',
      sub: 'In the top right corner',
      icon: 'check_circle',
    },
  ];

  return (
    <div
      className="min-h-dvh bg-warm-oatmeal flex flex-col px-6 overflow-y-auto scroll-y"
      style={{
        paddingTop: 'max(28px, env(safe-area-inset-top))',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
        className="flex flex-col flex-1"
      >
        {/* Hero */}
        <div className="text-center pt-6 pb-8">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 180, damping: 16 }}
            className="inline-flex mb-6"
          >
            <AvyayLogo size="md" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-[28px] font-extrabold text-forest-slate tracking-[-0.02em] leading-[1.1] mb-3"
          >
            Add to your<br />home screen
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-[15px] text-forest-secondary leading-relaxed max-w-[300px] mx-auto"
          >
            Save Avyay for quick, one-tap access to your daily check-ins.
          </motion.p>
        </div>

        {/* Instructions card */}
        {device === 'ios' ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="card-ios-lg overflow-hidden"
          >
            {iosSteps.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.08, duration: 0.35 }}
                className={`flex items-center gap-4 px-5 py-4 ${
                  i < iosSteps.length - 1 ? 'hairline-b' : ''
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-primary-pale flex items-center justify-center shrink-0">
                  <span className="text-[14px] font-bold text-primary">{item.step}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-forest-slate leading-tight">
                    {item.title}
                  </p>
                  <p className="text-[13px] text-sage-muted mt-0.5">{item.sub}</p>
                </div>
                <span
                  className="material-symbols-outlined text-primary shrink-0"
                  style={{
                    fontVariationSettings: "'FILL' 1",
                    fontSize: '22px',
                  }}
                >
                  {item.icon}
                </span>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="card-ios-lg p-5"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-pale flex items-center justify-center shrink-0">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{
                    fontVariationSettings: "'FILL' 1",
                    fontSize: '22px',
                  }}
                >
                  install_mobile
                </span>
              </div>
              <div className="flex-1">
                <p className="text-[15px] font-bold text-forest-slate mb-1">
                  One-tap install
                </p>
                <p className="text-[14px] text-forest-secondary leading-relaxed">
                  Tap "Install" below, or open your browser menu and choose "Add to
                  Home Screen."
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 space-y-2.5"
        >
          {[
            'Get push reminders for daily check-ins',
            'Works offline — no hospital Wi-Fi needed',
            'Opens full-screen, just like a real app',
          ].map((benefit) => (
            <div key={benefit} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-primary-pale flex items-center justify-center shrink-0">
                <Check size={12} className="text-primary" strokeWidth={3} />
              </div>
              <span className="text-[13px] text-forest-secondary leading-relaxed">
                {benefit}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="mt-auto pt-8 space-y-2"
        >
          {device !== 'ios' && deferredPrompt && (
            <PrimaryButton onClick={handleInstall}>Install Avyay</PrimaryButton>
          )}
          <button
            onClick={() => {
              haptic('light');
              onDone();
            }}
            className="w-full h-[54px] font-semibold text-sage-muted text-[16px] rounded-full active:bg-black/[0.03] transition-colors"
          >
            {device === 'ios' ? "I'll do it later" : 'Skip for now'}
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
