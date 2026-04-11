import { useNavigate } from 'react-router-dom';
import { usePatientStore } from '../store/patientStore';
import { MOCK_CHECKIN_PENDING } from '../utils/mockData';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function getSunIcon(): string {
  const h = new Date().getHours();
  if (h < 12) return 'wb_sunny';
  if (h < 17) return 'partly_cloudy_day';
  return 'nights_stay';
}

const PLAN_ITEMS = [
  { id: 'med', label: 'Morning Medication', sub: '8:00 AM · With food', done: true },
  { id: 'rest', label: 'Rest & Hydrate', sub: 'Drink 2 glasses of water', done: false, highlight: true },
  { id: 'walk', label: 'Afternoon Walk', sub: '2:00 PM · 5 minutes indoors', done: false },
];

export default function Home() {
  const navigate = useNavigate();
  const session = usePatientStore((s) => s.session);
  if (!session) return null; // AuthGuard will redirect
  const checkin = MOCK_CHECKIN_PENDING;

  const dayNumber = checkin.day_number;
  const totalDays = session.total_days;
  const progressPct = Math.round((dayNumber / totalDays) * 100);
  const isCompleted = checkin.status === 'completed';

  const greeting = getGreeting();
  const sunIcon = getSunIcon();

  return (
    <div className="flex flex-col h-full bg-warm-oatmeal">
      {/* Header */}
      <header
        className="flex justify-between items-center px-6 pb-4 shrink-0"
        style={{ paddingTop: 'max(48px, env(safe-area-inset-top))' }}
      >
        <div className="w-10 h-10 rounded-full bg-primary-pale flex items-center justify-center text-primary border border-primary/10 overflow-hidden">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
            person
          </span>
        </div>
        <button
          onClick={() => alert('Settings coming soon')}
          className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sage-muted shadow-clinical hover:bg-gray-50 transition-colors"
          aria-label="Settings"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0" }}>
            settings
          </span>
        </button>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar px-6 pb-28">
        {/* Greeting */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="material-symbols-outlined text-yellow-500 text-3xl"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '30px' }}
            >
              {sunIcon}
            </span>
            <h1 className="text-3xl font-extrabold text-forest-slate tracking-tight">
              Good {greeting},
            </h1>
          </div>
          <h1 className="text-3xl font-extrabold text-forest-slate tracking-tight">
            {session.first_name}
          </h1>
        </div>

        {/* Primary Check-in Card */}
        <div className="bg-surface rounded-2xl p-6 shadow-soft mb-8 border border-gray-50 relative overflow-hidden">
          {/* Decorative background blob */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-pale rounded-full opacity-60 blur-xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary-pale flex items-center justify-center text-primary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  favorite
                </span>
              </div>
              <h2 className="text-xl font-bold text-forest-slate">Daily Check-in</h2>
            </div>

            {isCompleted ? (
              <>
                <p className="text-sage-muted text-base mb-6 leading-relaxed">
                  You've completed today's check-in. Great work staying on top of your recovery!
                </p>
                <button
                  onClick={() => navigate('/checkin')}
                  className="w-full bg-primary-pale text-primary font-bold py-4 px-6 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 text-base"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span>View Today's Check-in</span>
                </button>
              </>
            ) : (
              <>
                <p className="text-sage-muted text-base mb-6 leading-relaxed">
                  It's time for your quick health update. Let's see how you're recovering today.
                </p>
                <button
                  onClick={() => navigate('/checkin')}
                  className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 px-6 rounded-full transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 text-lg"
                >
                  <span>Start Check-in</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recovery Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-3">
            <h3 className="text-lg font-bold text-forest-slate">Recovery Progress</h3>
            <span className="text-sm font-semibold text-primary bg-primary-pale px-3 py-1 rounded-full">
              Day {dayNumber}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-sage-muted mt-2 text-right">
            {progressPct}% complete · Keep it up!
          </p>
        </div>

        {/* Today's Plan */}
        <div>
          <h3 className="text-lg font-bold text-forest-slate mb-4">Today's Plan</h3>
          <div className="space-y-3">
            {PLAN_ITEMS.map((item) => (
              <PlanItem key={item.id} {...item} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function PlanItem({
  label,
  sub,
  done,
  highlight,
}: {
  label: string;
  sub: string;
  done: boolean;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-xl p-4 flex items-center gap-4 relative overflow-hidden
        ${done ? 'opacity-60' : ''}
        ${highlight ? 'border border-primary/20 shadow-sm' : ''}
      `}
    >
      {/* Left accent bar for highlighted item */}
      {highlight && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-xl" />
      )}

      {done ? (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white shrink-0 ml-0">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1", fontSize: '16px' }}>
            check
          </span>
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full border-2 border-sage-muted flex items-center justify-center shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <h4 className={`text-base font-semibold text-forest-slate ${done ? 'line-through' : ''}`}>
          {label}
        </h4>
        <p className={`text-sm ${highlight ? 'text-primary font-medium' : 'text-sage-muted'}`}>
          {sub}
        </p>
      </div>
    </div>
  );
}
