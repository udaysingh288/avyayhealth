import { useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Shield } from 'lucide-react';
import AvyayLogo from '../components/shared/AvyayLogo';
import PrimaryButton from '../components/shared/PrimaryButton';
import { usePatientStore } from '../store/patientStore';
import { MOCK_SESSION } from '../utils/mockData';
import AddToHomePrompt from '../components/enrollment/AddToHomePrompt';

type Step = 'welcome' | 'verify' | 'success';

export default function Enroll() {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const setSession = usePatientStore((s) => s.setSession);
  const [step, setStep] = useState<Step>('welcome');
  const [firstName, setFirstName] = useState('');
  const [dob, setDob] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInstall, setShowInstall] = useState(false);

  const hospitalName = code ? 'Riverside Community Medical Center' : 'Your Hospital';

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !dob) {
      setError('Please enter your name and date of birth.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    // Demo: accept any input
    const session = { ...MOCK_SESSION, first_name: firstName.trim() };
    setSession(session.token, session);
    setLoading(false);
    setStep('success');
  }

  if (showInstall) {
    return <AddToHomePrompt onDone={() => navigate('/')} />;
  }

  return (
    <div className="min-h-dvh bg-warm-oatmeal flex flex-col px-5 py-8 overflow-y-auto"
      style={{ paddingTop: 'max(32px, env(safe-area-inset-top))', paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}>
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <WelcomeStep
            key="welcome"
            hospitalName={hospitalName}
            onNext={() => setStep('verify')}
          />
        )}
        {step === 'verify' && (
          <VerifyStep
            key="verify"
            firstName={firstName}
            dob={dob}
            error={error}
            loading={loading}
            onFirstNameChange={setFirstName}
            onDobChange={setDob}
            onSubmit={handleVerify}
          />
        )}
        {step === 'success' && (
          <SuccessStep
            key="success"
            firstName={firstName || MOCK_SESSION.first_name}
            hospitalName={hospitalName}
            onInstall={() => setShowInstall(true)}
            onSkip={() => navigate('/')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────
// Welcome step
// ─────────────────────────────────────────
function WelcomeStep({ hospitalName, onNext }: { hospitalName: string; onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col flex-1"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center pb-8">
        <AvyayLogo size="lg" showTagline />

        <div className="mt-10 mb-8 space-y-4">
          <h2 className="font-serif text-3xl text-slate-800 leading-snug">
            Welcome to your<br />recovery program
          </h2>
          <p className="font-sans text-slate-500 text-lg leading-relaxed max-w-xs mx-auto">
            {hospitalName} has enrolled you in a 30-day daily health check-in program to help you recover safely at home.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          {[
            { icon: '📱', text: 'Daily check-in questions sent to your phone' },
            { icon: '👩‍⚕️', text: 'Your care team sees your responses right away' },
            { icon: '🆘', text: 'Immediate alert if you need urgent help' },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3 bg-white rounded-2xl p-4 text-left shadow-sm">
              <span className="text-2xl shrink-0" aria-hidden="true">{item.icon}</span>
              <span className="font-sans text-slate-700 text-base leading-snug">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <PrimaryButton onClick={onNext} icon={<ChevronRight size={20} />}>
        Get started
      </PrimaryButton>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Verify identity step
// ─────────────────────────────────────────
interface VerifyStepProps {
  firstName: string;
  dob: string;
  error: string;
  loading: boolean;
  onFirstNameChange: (v: string) => void;
  onDobChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
}

function VerifyStep({ firstName, dob, error, loading, onFirstNameChange, onDobChange, onSubmit }: VerifyStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      className="flex flex-col flex-1"
    >
      <div className="flex-1">
        <div className="flex justify-center mb-8">
          <AvyayLogo size="sm" />
        </div>

        <div className="mb-8">
          <h2 className="font-serif text-2xl text-slate-800 mb-2">Confirm your identity</h2>
          <p className="font-sans text-slate-500 text-base leading-relaxed">
            We need to verify who you are so your health information stays private.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-5">
          <div>
            <label htmlFor="firstName" className="block font-sans font-medium text-slate-700 text-base mb-2">
              Your first name
            </label>
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              inputMode="text"
              value={firstName}
              onChange={(e) => onFirstNameChange(e.target.value)}
              placeholder="e.g. Maria"
              className="w-full px-4 py-4 text-lg font-sans border-2 border-slate-200 rounded-xl
                bg-white text-slate-800 placeholder-slate-300
                focus:outline-none focus:border-primary transition"
            />
          </div>

          <div>
            <label htmlFor="dob" className="block font-sans font-medium text-slate-700 text-base mb-2">
              Date of birth
            </label>
            <input
              id="dob"
              type="date"
              autoComplete="bday"
              value={dob}
              onChange={(e) => onDobChange(e.target.value)}
              min="1920-01-01"
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-4 text-lg font-sans border-2 border-slate-200 rounded-xl
                bg-white text-slate-800
                focus:outline-none focus:border-primary transition"
            />
          </div>

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 font-sans text-base">
              {error}
            </div>
          )}

          <div className="pt-2">
            <PrimaryButton type="submit" loading={loading}>
              {loading ? '' : 'Confirm identity'}
            </PrimaryButton>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2 justify-center mt-6 text-slate-400">
        <Shield size={14} aria-hidden="true" />
        <span className="font-sans text-sm">Your information is private and secure</span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Success step
// ─────────────────────────────────────────
function SuccessStep({ firstName, hospitalName, onInstall, onSkip }: { firstName: string; hospitalName: string; onInstall: () => void; onSkip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col flex-1 items-center justify-center text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 bg-primary-pale rounded-full flex items-center justify-center mb-6"
      >
        <span className="text-5xl" aria-hidden="true">✓</span>
      </motion.div>

      <h2 className="font-serif text-3xl text-slate-800 mb-3">
        You're all set, {firstName}!
      </h2>
      <p className="font-sans text-slate-500 text-lg leading-relaxed max-w-xs mb-10">
        Your first check-in is ready. Your care team at {hospitalName} is here for you.
      </p>

      <div className="w-full space-y-3">
        <PrimaryButton onClick={onInstall}>
          Add to Home Screen
        </PrimaryButton>
        <button
          onClick={onSkip}
          className="w-full py-4 font-sans font-medium text-slate-500 text-base
            focus:outline-none focus:ring-2 focus:ring-primary rounded-xl"
        >
          Skip for now
        </button>
      </div>
    </motion.div>
  );
}
