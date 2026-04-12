import { useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Shield, ArrowLeft } from 'lucide-react';
import AvyayLogo from '../components/shared/AvyayLogo';
import PrimaryButton from '../components/shared/PrimaryButton';
import { usePatientStore } from '../store/patientStore';
import { MOCK_SESSION } from '../utils/mockData';
import AddToHomePrompt from '../components/enrollment/AddToHomePrompt';
import { haptic } from '../utils/haptics';
import { isStandalone } from '../utils/pwa';
import { enrollPatient } from '../api/patients';

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

  const [hospitalName, setHospitalName] = useState(
    code ? 'Riverside Community Medical Center' : 'Your Hospital',
  );

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!firstName.trim() || !dob) {
      setError('Please enter your name and date of birth.');
      haptic('warning');
      return;
    }
    const dobDate = new Date(dob + 'T00:00:00');
    const today = new Date();
    if (dobDate > today) {
      setError('Date of birth cannot be in the future.');
      haptic('warning');
      return;
    }
    const ageDiff = today.getFullYear() - dobDate.getFullYear();
    if (ageDiff > 120) {
      setError('Please enter a valid date of birth.');
      haptic('warning');
      return;
    }
    setLoading(true);
    try {
      const session = await enrollPatient({
        hospitalCode: code ?? 'RIVERSIDE',
        firstName: firstName.trim(),
        dob,
      });
      setHospitalName(session.hospital_name);
      setSession(session.token, session);
      haptic('success');
      setStep('success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'We could not verify you. Please try again.';
      setError(message);
      haptic('warning');
    } finally {
      setLoading(false);
    }
  }

  if (showInstall) {
    return <AddToHomePrompt onDone={() => navigate('/')} />;
  }

  return (
    <div
      className="min-h-dvh bg-warm-oatmeal flex flex-col px-6 overflow-y-auto scroll-y"
      style={{
        paddingTop: 'max(28px, env(safe-area-inset-top))',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
      }}
    >
      <AnimatePresence mode="wait">
        {step === 'welcome' && (
          <WelcomeStep
            key="welcome"
            hospitalName={hospitalName}
            onNext={() => {
              haptic('light');
              setStep('verify');
            }}
          />
        )}
        {step === 'verify' && (
          <VerifyStep
            key="verify"
            firstName={firstName}
            dob={dob}
            error={error}
            loading={loading}
            onBack={() => {
              haptic('light');
              setStep('welcome');
            }}
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
            alreadyInstalled={isStandalone()}
            onInstall={() => {
              haptic('light');
              setShowInstall(true);
            }}
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
function WelcomeStep({
  hospitalName,
  onNext,
}: {
  hospitalName: string;
  onNext: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col flex-1 min-h-full"
    >
      <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
        >
          <AvyayLogo size="lg" showTagline />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mt-10 mb-10 space-y-3"
        >
          <h2 className="text-[28px] font-extrabold text-forest-slate tracking-[-0.02em] leading-[1.1]">
            Welcome to your<br />recovery program
          </h2>
          <p className="text-[16px] text-forest-secondary leading-relaxed max-w-[300px] mx-auto">
            {hospitalName} has enrolled you in a 30-day daily check-in program to help you recover safely at home.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="w-full max-w-sm space-y-2.5"
        >
          {[
            {
              icon: 'chat',
              iconBg: '#EEF2F1',
              iconColor: '#053027',
              title: 'Daily check-ins',
              sub: 'Two-minute conversations each day',
            },
            {
              icon: 'groups',
              iconBg: '#FDF4E7',
              iconColor: '#D97706',
              title: 'Connected care',
              sub: 'Your team sees your responses instantly',
            },
            {
              icon: 'shield_person',
              iconBg: '#FEF2F2',
              iconColor: '#DC2626',
              title: 'Urgent alerts',
              sub: 'Immediate help when you need it most',
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.06, duration: 0.3 }}
              className="card-ios p-4 flex items-center gap-3.5 text-left"
            >
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: item.iconBg }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{
                    fontVariationSettings: "'FILL' 1",
                    fontSize: '22px',
                    color: item.iconColor,
                  }}
                >
                  {item.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-forest-slate leading-tight">
                  {item.title}
                </p>
                <p className="text-[13px] text-sage-muted mt-0.5">{item.sub}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.35 }}
        className="pt-6 pb-2"
      >
        <PrimaryButton onClick={onNext} trailing={<ChevronRight size={20} strokeWidth={2.4} />}>
          Get started
        </PrimaryButton>
      </motion.div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Verify step
// ─────────────────────────────────────────
interface VerifyStepProps {
  firstName: string;
  dob: string;
  error: string;
  loading: boolean;
  onBack: () => void;
  onFirstNameChange: (v: string) => void;
  onDobChange: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
}

function VerifyStep({
  firstName,
  dob,
  error,
  loading,
  onBack,
  onFirstNameChange,
  onDobChange,
  onSubmit,
}: VerifyStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
      className="flex flex-col flex-1 min-h-full"
    >
      <button
        onClick={onBack}
        className="w-11 h-11 -ml-3 rounded-full flex items-center justify-center active:bg-black/5 tap-scale self-start"
        aria-label="Back"
      >
        <ArrowLeft size={22} className="text-forest-slate" strokeWidth={2.4} />
      </button>

      <div className="flex-1 pt-6">
        <div className="mb-8">
          <h2 className="text-[28px] font-extrabold text-forest-slate tracking-[-0.02em] leading-tight mb-2">
            Let's confirm<br />who you are
          </h2>
          <p className="text-[15px] text-forest-secondary leading-relaxed max-w-sm">
            We need to verify your identity so your health information stays private and secure.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-[12px] font-bold text-sage-muted uppercase tracking-wide mb-1.5 ml-1"
            >
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
              className="w-full h-[56px] px-5 text-[17px] border-[1.5px] border-hairline rounded-2xl
                bg-white text-forest-slate placeholder:text-sage-muted/60
                focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="dob"
              className="block text-[12px] font-bold text-sage-muted uppercase tracking-wide mb-1.5 ml-1"
            >
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
              className="w-full h-[56px] px-5 text-[17px] border-[1.5px] border-hairline rounded-2xl
                bg-white text-forest-slate
                focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="alert"
                className="bg-[#FEF2F2] border border-[#FECACA] rounded-2xl px-4 py-3 text-[#DC2626] text-[14px] font-medium"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-3">
            <PrimaryButton type="submit" loading={loading} variant="white">
              Confirm identity
            </PrimaryButton>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2 justify-center pt-6 text-sage-muted">
        <Shield size={14} aria-hidden="true" strokeWidth={2.2} />
        <span className="text-[13px] font-medium">
          Your information is private and secure
        </span>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────
// Success step
// ─────────────────────────────────────────
function SuccessStep({
  firstName,
  hospitalName,
  alreadyInstalled,
  onInstall,
  onSkip,
}: {
  firstName: string;
  hospitalName: string;
  alreadyInstalled: boolean;
  onInstall: () => void;
  onSkip: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col flex-1 min-h-full items-center justify-center text-center"
    >
      {/* Success ring */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, damping: 16, delay: 0.1 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 rounded-full bg-primary/10 scale-110 animate-pulse" />
        <div className="relative w-24 h-24 rounded-full bg-primary flex items-center justify-center shadow-ios-lg">
          <span
            className="material-symbols-outlined text-white"
            style={{
              fontVariationSettings: "'FILL' 1, 'wght' 700",
              fontSize: '52px',
            }}
          >
            check
          </span>
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-[32px] font-extrabold text-forest-slate tracking-[-0.02em] mb-3"
      >
        You're all set, {firstName}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="text-[16px] text-forest-secondary leading-relaxed max-w-[300px] mb-10"
      >
        Your first check-in is ready. Your care team at {hospitalName} is here for you.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full space-y-2"
      >
        {alreadyInstalled ? (
          <PrimaryButton onClick={onSkip}>Open Avyay</PrimaryButton>
        ) : (
          <>
            <PrimaryButton onClick={onInstall}>Add to home screen</PrimaryButton>
            <button
              onClick={onSkip}
              className="w-full h-[54px] font-semibold text-sage-muted text-[16px] rounded-full active:bg-black/[0.03] transition-colors"
            >
              Continue in browser
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
