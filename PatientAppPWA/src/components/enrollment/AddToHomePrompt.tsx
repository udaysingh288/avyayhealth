import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PrimaryButton from '../shared/PrimaryButton';

interface AddToHomePromptProps {
  onDone: () => void;
}

type DeviceType = 'ios' | 'android' | 'other';

function detectDevice(): DeviceType {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'other';
}

export default function AddToHomePrompt({ onDone }: AddToHomePromptProps) {
  const [device] = useState<DeviceType>(detectDevice);
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (deferredPrompt) {
      (deferredPrompt as unknown as { prompt: () => void }).prompt();
    }
    onDone();
  }

  return (
    <div className="min-h-screen bg-off-white flex flex-col px-5 py-8 justify-end"
      style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 shadow-xl"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-forest-pale rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl" aria-hidden="true">📱</span>
          </div>
          <h2 className="font-serif text-2xl text-slate-800 mb-2">Add to your home screen</h2>
          <p className="font-sans text-slate-500 text-base leading-relaxed">
            Save Avyay Health to your home screen for easy access every morning.
          </p>
        </div>

        {device === 'ios' ? (
          <div className="bg-forest-pale rounded-2xl p-4 mb-6 space-y-3">
            {[
              { step: '1', text: 'Tap the Share button', icon: '⬆️', sub: 'at the bottom of Safari' },
              { step: '2', text: 'Tap "Add to Home Screen"', icon: '➕', sub: 'scroll down if needed' },
              { step: '3', text: 'Tap "Add"', icon: '✓', sub: "top right corner" },
            ].map((item) => (
              <div key={item.step} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-forest text-white rounded-full flex items-center justify-center font-sans font-bold text-sm shrink-0">
                  {item.step}
                </div>
                <div>
                  <div className="font-sans font-medium text-slate-800 text-base flex items-center gap-1.5">
                    <span aria-hidden="true">{item.icon}</span> {item.text}
                  </div>
                  <div className="font-sans text-slate-400 text-sm">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-forest-pale rounded-2xl p-4 mb-6 text-center">
            <p className="font-sans text-slate-700 text-base">
              Tap "Install" when your browser asks, or use the menu to "Add to Home Screen."
            </p>
          </div>
        )}

        <div className="space-y-3">
          {device !== 'ios' && deferredPrompt && (
            <PrimaryButton onClick={handleInstall}>
              Install now
            </PrimaryButton>
          )}
          <button
            onClick={onDone}
            className="w-full py-4 font-sans font-medium text-slate-500 text-base
              focus:outline-none focus:ring-2 focus:ring-forest rounded-xl"
          >
            {device === 'ios' ? "I'll do it later" : "Skip for now"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
