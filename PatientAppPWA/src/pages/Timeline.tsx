import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, Clock, XCircle } from 'lucide-react';
import TopBar from '../components/shared/TopBar';
import { usePatientStore } from '../store/patientStore';
import { MOCK_HISTORY } from '../utils/mockData';
import type { DayHistory, CheckInStatus, RiskLevel } from '../types';
import { fullDate } from '../utils/dateUtils';
import { parse, addDays, format } from 'date-fns';
import { haptic } from '../utils/haptics';

function riskStyle(
  risk: RiskLevel | null,
  status: CheckInStatus,
  isToday: boolean,
): { bg: string; fg: string; ring?: string } {
  if (status === 'pending') {
    return isToday
      ? { bg: 'bg-white', fg: 'text-primary', ring: 'ring-2 ring-primary' }
      : { bg: 'bg-transparent', fg: 'text-sage-muted/40' };
  }
  if (status === 'missed') return { bg: 'bg-slate-200', fg: 'text-slate-500' };
  if (risk === 'red') return { bg: 'bg-[#DC2626]', fg: 'text-white' };
  if (risk === 'yellow') return { bg: 'bg-[#D97706]', fg: 'text-white' };
  return { bg: 'bg-primary', fg: 'text-white' };
}

function statusIconNode(status: CheckInStatus, risk: RiskLevel | null) {
  if (status === 'pending') return null;
  if (status === 'missed') return <XCircle size={13} />;
  if (risk === 'red') return <AlertTriangle size={12} />;
  if (status === 'completed') return <CheckCircle2 size={13} />;
  return null;
}

export default function Timeline() {
  const session = usePatientStore((s) => s.session);
  const history = MOCK_HISTORY;
  const [selected, setSelected] = useState<DayHistory | null>(null);
  const daysInProgram = session?.days_in_program ?? 3;

  const dischargeDate = session?.discharge_date
    ? parse(session.discharge_date.slice(0, 10), 'yyyy-MM-dd', new Date())
    : new Date();

  const completedCount = history.filter((d) => d.status === 'completed').length;
  const stableCount = history.filter(
    (d) => d.status === 'completed' && d.risk_level === 'green',
  ).length;

  return (
    <div className="flex flex-col h-full bg-warm-oatmeal overflow-hidden">
      <TopBar title="Timeline" subtitle="30-day recovery" />

      <div className="flex-1 overflow-y-auto scroll-y hide-scrollbar px-5 pt-4 pb-10">
        {/* Summary stats */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {[
            {
              label: 'Completed',
              value: completedCount,
              sub: 'days',
              color: 'text-primary',
            },
            {
              label: 'Stable',
              value: stableCount,
              sub: 'days',
              color: 'text-[#16A34A]',
            },
            {
              label: 'Remaining',
              value: 30 - daysInProgram,
              sub: 'days',
              color: 'text-forest-slate',
            },
          ].map((item) => (
            <div key={item.label} className="card-ios p-3 text-center">
              <div className={`text-[26px] font-bold tracking-tight ${item.color}`}>
                {item.value}
              </div>
              <div className="text-[11px] text-sage-muted font-semibold uppercase tracking-wide">
                {item.label}
              </div>
              <div className="text-[10px] text-sage-muted/70">{item.sub}</div>
            </div>
          ))}
        </motion.section>

        {/* Calendar card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.08, ease: [0.32, 0.72, 0, 1] }}
          className="card-ios p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-sage-muted font-bold mb-0.5">
                Recovery Calendar
              </p>
              <h2 className="text-[18px] font-bold text-forest-slate tracking-tight">
                {format(dischargeDate, 'MMMM yyyy')}
              </h2>
            </div>
          </div>

          {/* 6-column grid with day numbers + dots */}
          <div className="grid grid-cols-6 gap-x-2 gap-y-3">
            {history.map((day) => {
              const dayDate = addDays(dischargeDate, day.day_number - 1);
              const isPast = day.day_number <= daysInProgram;
              const isToday = day.day_number === daysInProgram;
              const style = riskStyle(day.risk_level, day.status, isToday);

              return (
                <button
                  key={day.day_number}
                  onClick={() => {
                    if (isPast) {
                      haptic('light');
                      setSelected(day);
                    }
                  }}
                  disabled={!isPast}
                  className={`relative flex flex-col items-center gap-1 py-1 focus:outline-none
                    ${isPast ? 'tap-scale-sm cursor-pointer' : 'cursor-default'}`}
                  aria-label={`Day ${day.day_number}: ${day.status}${day.risk_level ? `, ${day.risk_level}` : ''}`}
                >
                  <span className="text-[10px] text-sage-muted font-semibold uppercase tracking-wide">
                    {format(dayDate, 'EEE')}
                  </span>
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold
                      ${style.bg} ${style.fg} ${style.ring ?? ''}`}
                  >
                    {day.day_number}
                  </span>
                  {statusIconNode(day.status, day.risk_level) && (
                    <span className="text-[10px] text-sage-muted">
                      {statusIconNode(day.status, day.risk_level)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 mt-5 pt-4 hairline-t flex-wrap">
            {[
              { color: 'bg-primary', label: 'Stable' },
              { color: 'bg-[#D97706]', label: 'Watched' },
              { color: 'bg-[#DC2626]', label: 'Alert' },
              { color: 'bg-slate-200', label: 'Missed' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${l.color}`} aria-hidden="true" />
                <span className="text-[11px] font-medium text-sage-muted">
                  {l.label}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Recent check-ins list */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.32, 0.72, 0, 1] }}
        >
          <h3 className="text-[17px] font-bold text-forest-slate tracking-tight mb-3 px-1">
            Recent check-ins
          </h3>
          <div className="card-ios overflow-hidden">
            {history
              .filter((d) => d.status === 'completed')
              .reverse()
              .map((day, i, arr) => (
                <button
                  key={day.day_number}
                  onClick={() => {
                    haptic('light');
                    setSelected(day);
                  }}
                  className={`w-full text-left px-4 py-4 tap-scale-sm active:bg-black/[0.02] transition-colors ${
                    i < arr.length - 1 ? 'hairline-b' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <RiskDot risk={day.risk_level} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[15px] font-bold text-forest-slate">
                          Day {day.day_number}
                        </p>
                        <RiskPill risk={day.risk_level} />
                      </div>
                      <p className="text-[13px] text-forest-secondary leading-snug line-clamp-2">
                        {day.summary ?? 'Check-in completed.'}
                      </p>
                      <p className="text-[11px] text-sage-muted mt-1.5">
                        {fullDate(day.date)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </motion.section>
      </div>

      <AnimatePresence>
        {selected && (
          <DayDetailSheet day={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function RiskDot({ risk }: { risk: RiskLevel | null }) {
  const color =
    risk === 'red'
      ? 'bg-[#DC2626]'
      : risk === 'yellow'
        ? 'bg-[#D97706]'
        : 'bg-primary';
  return <div className={`w-2.5 h-2.5 rounded-full mt-2 ${color}`} aria-hidden="true" />;
}

function RiskPill({ risk }: { risk: RiskLevel | null }) {
  if (!risk) return null;
  const styles = {
    red: 'bg-[#FEF2F2] text-[#DC2626]',
    yellow: 'bg-[#FFFBEB] text-[#D97706]',
    green: 'bg-primary-pale text-primary',
  };
  const labels = { red: 'Alert', yellow: 'Watched', green: 'Stable' };
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${styles[risk]}`}
    >
      {labels[risk]}
    </span>
  );
}

function DayDetailSheet({ day, onClose }: { day: DayHistory; onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 32, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[28px] shadow-ios-xl"
        style={{ paddingBottom: 'max(28px, env(safe-area-inset-bottom))' }}
        role="dialog"
        aria-label={`Day ${day.day_number} details`}
      >
        {/* Grabber */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-sage-muted/30" />
        </div>

        <div className="px-5 pt-2 pb-6">
          <div className="flex items-start justify-between mb-5">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-sage-muted font-bold mb-0.5">
                Day {day.day_number}
              </p>
              <h2 className="text-[22px] font-bold text-forest-slate tracking-tight leading-tight">
                {fullDate(day.date)}
              </h2>
              <div className="mt-2">
                <RiskPill risk={day.risk_level} />
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-pale active:bg-primary-soft tap-scale focus:outline-none"
              aria-label="Close"
            >
              <X size={18} className="text-primary" strokeWidth={2.4} />
            </button>
          </div>

          {day.summary ? (
            <div className="bg-warm-sunken rounded-2xl p-4">
              <p className="text-[11px] uppercase tracking-wide text-sage-muted font-bold mb-1.5">
                Summary
              </p>
              <p className="text-[15px] text-forest-slate leading-[1.5]">
                {day.summary}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sage-muted">
              <Clock size={16} />
              <p className="text-[14px]">No summary for this day.</p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
