import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Clock, XCircle } from 'lucide-react';
import TopBar from '../components/shared/TopBar';
import { usePatientStore } from '../store/patientStore';
import { MOCK_HISTORY } from '../utils/mockData';
import type { DayHistory, CheckInStatus, RiskLevel } from '../types';
import { fullDate } from '../utils/dateUtils';
import { parse, addDays } from 'date-fns';

function riskColor(risk: RiskLevel | null, status: CheckInStatus): string {
  if (status === 'missed') return 'bg-slate-200 text-slate-400';
  if (status === 'pending') return 'bg-slate-100 text-slate-300';
  if (risk === 'red') return 'bg-red-500 text-white';
  if (risk === 'yellow') return 'bg-yellow-400 text-white';
  return 'bg-green-500 text-white';
}

function statusIcon(status: CheckInStatus, risk: RiskLevel | null) {
  if (status === 'pending') return null;
  if (status === 'missed') return <XCircle size={14} />;
  if (risk === 'red') return <AlertTriangle size={12} />;
  if (status === 'completed') return <CheckCircle size={12} />;
  return null;
}

export default function Timeline() {
  const session = usePatientStore((s) => s.session);
  const history = MOCK_HISTORY;
  const [selected, setSelected] = useState<DayHistory | null>(null);
  const daysInProgram = session?.days_in_program ?? 3;

  // Build discharge date for day labels
  const dischargeDate = session?.discharge_date
    ? parse(session.discharge_date.slice(0, 10), 'yyyy-MM-dd', new Date())
    : new Date();

  return (
    <div className="flex flex-col h-full bg-warm-oatmeal">
      <TopBar title="Recovery Timeline" />

      <div className="flex-1 overflow-y-auto px-5 py-5">
        {/* Summary row */}
        <div className="flex gap-3 mb-6">
          {[
            { label: 'Completed', count: history.filter(d => d.status === 'completed').length, color: 'bg-green-100 text-green-700' },
            { label: 'Day streak', count: daysInProgram, color: 'bg-primary-pale text-primary' },
            { label: 'Days left', count: 30 - daysInProgram, color: 'bg-slate-100 text-slate-600' },
          ].map((item) => (
            <div key={item.label} className={`flex-1 rounded-2xl px-3 py-3 text-center ${item.color}`}>
              <div className="font-sans font-bold text-xl">{item.count}</div>
              <div className="font-sans text-xs font-medium mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-5 flex-wrap">
          {[
            { color: 'bg-green-500', label: 'Stable' },
            { color: 'bg-yellow-400', label: 'Watched' },
            { color: 'bg-red-500', label: 'Alerted' },
            { color: 'bg-slate-200', label: 'Missed' },
            { color: 'bg-slate-100', label: 'Upcoming' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${item.color}`} aria-hidden="true" />
              <span className="font-sans text-xs text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid — 5 weeks × 6 days */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
          <div className="grid grid-cols-6 gap-2">
            {history.map((day) => {
              const dayDate = addDays(dischargeDate, day.day_number - 1);
              const isPast = day.day_number <= daysInProgram;
              const isToday = day.day_number === daysInProgram;

              return (
                <button
                  key={day.day_number}
                  onClick={() => isPast ? setSelected(day) : undefined}
                  disabled={!isPast && day.status !== 'pending'}
                  className={`relative flex flex-col items-center gap-1 p-2 rounded-xl transition
                    ${isPast ? 'active:scale-95 cursor-pointer' : 'cursor-default'}
                    ${isToday ? 'ring-2 ring-primary ring-offset-1' : ''}
                    focus:outline-none focus:ring-2 focus:ring-primary`}
                  aria-label={`Day ${day.day_number}: ${day.status}${day.risk_level ? `, ${day.risk_level} risk` : ''}`}
                >
                  <span className="font-sans text-xs text-slate-400 font-medium">{day.day_number}</span>
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                      ${riskColor(day.risk_level, day.status)}`}
                  >
                    {statusIcon(day.status, day.risk_level)}
                  </span>
                  {isToday && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Completed days list */}
        <div className="mt-6 space-y-3">
          <h2 className="font-sans font-semibold text-slate-700 text-sm uppercase tracking-wide">
            Recent check-ins
          </h2>
          {history
            .filter((d) => d.status === 'completed')
            .reverse()
            .map((day) => (
              <button
                key={day.day_number}
                onClick={() => setSelected(day)}
                className="w-full text-left bg-white rounded-2xl border border-slate-100 p-4 shadow-sm
                  active:bg-slate-50 transition focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-sans font-semibold text-slate-700">Day {day.day_number}</span>
                  <RiskPill risk={day.risk_level} />
                </div>
                <p className="font-sans text-slate-500 text-sm leading-relaxed">
                  {day.summary ?? 'Check-in completed.'}
                </p>
                <div className="text-xs font-sans text-slate-400 mt-1">
                  {fullDate(day.date)}
                </div>
              </button>
            ))}
        </div>
      </div>

      {/* Day detail bottom sheet */}
      <AnimatePresence>
        {selected && (
          <DayDetailSheet day={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function RiskPill({ risk }: { risk: RiskLevel | null }) {
  if (!risk) return null;
  const styles = {
    red: 'bg-red-100 text-red-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    green: 'bg-green-50 text-green-700',
  };
  const labels = { red: 'Alert', yellow: 'Watched', green: 'Stable' };
  return (
    <span className={`text-xs font-sans font-semibold px-2.5 py-1 rounded-full ${styles[risk]}`}>
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
        className="fixed inset-0 bg-black/30 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl"
        style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}
        role="dialog"
        aria-label={`Day ${day.day_number} details`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-serif text-xl text-slate-800">Day {day.day_number}</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100
              active:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Close"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center
            ${day.risk_level === 'red' ? 'bg-red-100' : day.risk_level === 'yellow' ? 'bg-yellow-50' : 'bg-green-50'}`}>
            {day.status === 'completed'
              ? <CheckCircle size={20} className={day.risk_level === 'red' ? 'text-red-600' : day.risk_level === 'yellow' ? 'text-yellow-600' : 'text-green-600'} />
              : <Clock size={20} className="text-slate-400" />
            }
          </div>
          <div>
            <div className="font-sans font-semibold text-slate-800">{fullDate(day.date)}</div>
            <RiskPill risk={day.risk_level} />
          </div>
        </div>

        {day.summary ? (
          <div className="bg-slate-50 rounded-2xl p-4">
            <p className="font-sans text-slate-700 text-base leading-relaxed">{day.summary}</p>
          </div>
        ) : (
          <p className="font-sans text-slate-400 text-base">No summary available for this day.</p>
        )}
      </motion.div>
    </>
  );
}
