import { motion } from 'framer-motion';
import type { TodayCheckin } from '../../types';
import { shortTime } from '../../utils/dateUtils';

interface CheckInCompleteProps {
  checkin: TodayCheckin;
  firstName: string;
  totalDays: number;
}

export default function CheckInComplete({ checkin, firstName, totalDays }: CheckInCompleteProps) {
  const daysLeft = totalDays - checkin.day_number;
  const progressPct = Math.round((checkin.day_number / totalDays) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center px-2"
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 180, delay: 0.1 }}
        className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-5"
      >
        <span className="text-4xl" aria-hidden="true">✅</span>
      </motion.div>

      <h2 className="font-serif text-2xl text-slate-800 mb-2">
        Great job today, {firstName}!
      </h2>
      <p className="font-sans text-slate-500 text-base leading-relaxed mb-6">
        {checkin.day_number === 1
          ? 'You completed your very first check-in. Keep it up!'
          : daysLeft > 0
          ? `Day ${checkin.day_number} complete. ${daysLeft} day${daysLeft !== 1 ? 's' : ''} to go.`
          : 'You completed your 30-day recovery program. Well done!'}
      </p>

      {/* Progress bar */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-xs font-sans text-slate-400 mb-1.5">
          <span>Day 1</span>
          <span className="font-medium text-forest">{progressPct}% complete</span>
          <span>Day 30</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-forest rounded-full"
          />
        </div>
      </div>

      {/* Summary of what was reported */}
      {checkin.completed_at && (
        <div className="w-full bg-forest-pale border border-forest/20 rounded-2xl p-4 text-left mb-4">
          <div className="text-xs font-sans font-semibold text-forest/70 uppercase tracking-wide mb-2">
            You reported today at {shortTime(checkin.completed_at)}
          </div>
          {checkin.conversation
            .filter((m) => m.role === 'patient')
            .map((m) => (
              <p key={m.id} className="font-sans text-slate-700 text-sm leading-relaxed mb-1 last:mb-0">
                "{m.content}"
              </p>
            ))}
        </div>
      )}

      <p className="font-sans text-slate-400 text-sm mt-2">
        We'll check in again tomorrow. Rest well.
      </p>
    </motion.div>
  );
}
