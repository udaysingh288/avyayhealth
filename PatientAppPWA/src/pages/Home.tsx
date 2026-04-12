import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePatientStore } from '../store/patientStore';
import { haptic } from '../utils/haptics';
import { PLAN_ITEMS } from '../data/carePlanDefaults';
import type { PlanItem } from '../data/carePlanDefaults';
import type { TodayCheckin } from '../types';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getTimeIcon(): string {
  const h = new Date().getHours();
  if (h < 12) return 'wb_sunny';
  if (h < 17) return 'partly_cloudy_day';
  return 'nights_stay';
}

function formattedToday(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function Home() {
  const navigate = useNavigate();
  const session = usePatientStore((s) => s.session);
  const storeCheckin = usePatientStore((s) => s.checkin);

  if (!session) return null;

  const checkin: TodayCheckin = storeCheckin ?? {
    checkin_id: `ci-day${session.days_in_program}`,
    day_number: session.days_in_program,
    status: 'pending',
    question: '',
    conversation: [],
    completed_at: null,
  };

  const dayNumber = checkin.day_number;
  const totalDays = session.total_days;
  const progressPct = Math.round((dayNumber / totalDays) * 100);
  const daysLeft = totalDays - dayNumber;
  const isCompleted = checkin.status === 'completed';

  return (
    <div className="flex flex-col h-full bg-warm-oatmeal overflow-hidden">
      {/* Scrollable content */}
      <main
        className="flex-1 overflow-y-auto scroll-y hide-scrollbar px-5 pb-8"
        style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
      >
        {/* Header: avatar + settings */}
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="flex justify-between items-center mb-6 pt-2"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shadow-ios-sm">
              <span className="text-white font-bold text-[17px]">
                {session.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-sage-muted font-semibold">
                {formattedToday()}
              </p>
              <p className="text-[15px] text-forest-slate font-semibold leading-tight">
                Day {dayNumber} of {totalDays}
              </p>
            </div>
          </div>
          <button
            onClick={() => haptic('light')}
            className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-sage-muted shadow-ios-sm tap-scale active:bg-gray-50"
            aria-label="Notifications"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: '22px', fontVariationSettings: "'FILL' 0" }}
            >
              notifications
            </span>
          </button>
        </motion.header>

        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.32, 0.72, 0, 1] }}
          className="mb-5"
        >
          <div className="flex items-center gap-2 mb-1">
            <span
              className="material-symbols-outlined text-[#D97706]"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '22px' }}
            >
              {getTimeIcon()}
            </span>
            <p className="text-[15px] font-semibold text-forest-secondary">
              {getGreeting()}
            </p>
          </div>
          <h1 className="text-[32px] font-extrabold text-forest-slate tracking-[-0.02em] leading-[1.05]">
            {session.first_name}.
          </h1>
        </motion.div>

        {/* Primary Check-in Card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          className="relative card-ios-lg p-6 mb-6 overflow-hidden"
        >
          {/* Decorative gradient */}
          <div
            className="absolute inset-0 pointer-events-none opacity-90"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(120% 80% at 100% 0%, rgba(5,48,39,0.05) 0%, transparent 55%)',
            }}
          />
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center">
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}
                  >
                    favorite
                  </span>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-primary/70 font-bold">
                    Daily Check-in
                  </p>
                  <h2 className="text-[17px] font-bold text-forest-slate leading-tight">
                    {isCompleted ? 'Completed for today' : 'Ready for you'}
                  </h2>
                </div>
              </div>
              {!isCompleted && (
                <span className="flex items-center gap-1 bg-[#FEF2F2] text-[#DC2626] px-2.5 py-1 rounded-full text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
                  Pending
                </span>
              )}
            </div>

            <p className="text-[15px] text-forest-secondary leading-[1.5] mb-5">
              {isCompleted
                ? "You've shared how you're feeling today. Your care team has been updated."
                : "A two-minute conversation with your care team. We'll ask about any symptoms and flag anything concerning."}
            </p>

            <button
              onClick={() => {
                haptic('medium');
                navigate('/checkin');
              }}
              className={`w-full h-[54px] rounded-full font-semibold text-[17px] tracking-[-0.01em]
                flex items-center justify-center gap-2 tap-scale transition-colors
                ${
                  isCompleted
                    ? 'bg-primary-pale text-primary active:bg-primary-soft'
                    : 'bg-primary text-white active:bg-primary-light shadow-ios'
                }`}
            >
              {isCompleted ? (
                <>
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '20px', fontVariationSettings: "'FILL' 1" }}
                  >
                    check_circle
                  </span>
                  View today's check-in
                </>
              ) : (
                <>
                  Start check-in
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: '20px' }}
                  >
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </motion.section>

        {/* Recovery Progress card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
          className="card-ios p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-sage-muted font-bold mb-0.5">
                Recovery Progress
              </p>
              <h3 className="text-[20px] font-bold text-forest-slate tracking-tight">
                {progressPct}% complete
              </h3>
            </div>
            <ProgressRing percent={progressPct} />
          </div>
          <div className="h-1.5 bg-primary-soft rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="h-full bg-primary rounded-full"
            />
          </div>
          <div className="flex justify-between mt-2 text-[12px] text-sage-muted font-medium">
            <span>Day {dayNumber}</span>
            <span>{daysLeft} days to go</span>
          </div>
        </motion.section>

        {/* Today's Plan — iOS-style grouped list */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="mb-4"
        >
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[17px] font-bold text-forest-slate tracking-tight">
              Today's plan
            </h3>
            <button
              onClick={() => navigate('/care-plan')}
              className="text-[14px] font-semibold text-primary active:opacity-70 transition-opacity"
            >
              See all
            </button>
          </div>
          <div className="card-ios overflow-hidden">
            {PLAN_ITEMS.map((item, i) => (
              <PlanRow key={item.id} item={item} isLast={i === PLAN_ITEMS.length - 1} />
            ))}
          </div>
        </motion.section>
      </main>
    </div>
  );
}

// ─── Progress Ring ───────────────────────────
function ProgressRing({ percent }: { percent: number }) {
  const size = 54;
  const stroke = 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (percent / 100) * c;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#E6EEEC"
          strokeWidth={stroke}
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#053027"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[13px] font-bold text-primary">{percent}%</span>
      </div>
    </div>
  );
}

// ─── Plan Row ───────────────────────────
function PlanRow({ item, isLast }: { item: PlanItem; isLast: boolean }) {
  return (
    <button
      onClick={() => haptic('light')}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 text-left tap-scale-sm active:bg-black/[0.02] transition-colors ${
        !isLast ? 'hairline-b' : ''
      }`}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: item.iconBg }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontVariationSettings: "'FILL' 1",
            fontSize: '20px',
            color: item.iconTint,
          }}
        >
          {item.icon}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-[15px] font-semibold text-forest-slate leading-tight ${
            item.done ? 'line-through opacity-50' : ''
          }`}
        >
          {item.label}
        </p>
        <p className="text-[13px] text-sage-muted mt-0.5">
          {item.sub} {item.dueTime && `· ${item.dueTime}`}
        </p>
      </div>

      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
          item.done
            ? 'bg-primary'
            : 'border-[1.5px] border-sage-muted/40 bg-transparent'
        }`}
      >
        {item.done && (
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: '15px', fontVariationSettings: "'FILL' 1, 'wght' 700" }}
          >
            check
          </span>
        )}
      </div>
    </button>
  );
}
