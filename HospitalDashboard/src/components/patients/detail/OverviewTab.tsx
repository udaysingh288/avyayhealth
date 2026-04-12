import { AlertTriangle } from 'lucide-react';
import RiskBadge from '../../shared/RiskBadge';
import SDOHIcons, { domainConfig } from '../SDOHIcons';
import type { Patient } from '../../../types';
import { relativeTime } from '../../../utils/dateUtils';

export default function OverviewTab({ patient }: { patient: Patient }) {
  const completionPct = Math.round(patient.checkin_completion_rate * 100);

  const bars = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    responded: i < patient.days_in_program
      ? Math.random() < patient.checkin_completion_rate
      : null,
  }));

  return (
    <div className="p-5 space-y-5">
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 font-sans">Current status</h3>
        <div className="flex items-start gap-3">
          <RiskBadge risk={patient.risk_level} size="lg" />
          {patient.last_reply_summary && (
            <p className="text-sm text-slate-700 font-sans leading-snug flex-1">
              "{patient.last_reply_summary}"
            </p>
          )}
        </div>
        <p className="text-xs text-slate-400 font-sans mt-1.5">
          Last check-in: {relativeTime(patient.last_checkin_at)}
        </p>
      </section>

      {patient.sdoh_flags.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 font-sans">SDOH flags</h3>
          <div className="space-y-2">
            {patient.sdoh_flags.map((domain) => {
              const { label } = domainConfig[domain];
              const isSafety = domain === 'interpersonal_safety';
              return (
                <div key={domain} className={`flex items-start gap-2.5 rounded-lg p-3 text-sm ${isSafety ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                  {isSafety
                    ? <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
                    : <SDOHIcons flags={[domain]} compact={false} />}
                  <div>
                    <div className={`font-medium font-sans text-xs ${isSafety ? 'text-red-700' : 'text-amber-700'}`}>
                      {isSafety ? 'Safety concern flagged' : label}
                    </div>
                    <div className="text-xs font-sans text-slate-500 mt-0.5">
                      {isSafety ? 'Coordinator follow-up required. Details are restricted.' : 'Referred to community resources · Pending'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {patient.adi_national_rank !== null && (
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 font-sans">Neighborhood disadvantage</h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div className="h-2 rounded-full bg-amber-400 transition-all" style={{ width: `${patient.adi_national_rank}%` }} role="progressbar" aria-valuenow={patient.adi_national_rank} aria-valuemin={0} aria-valuemax={100} />
            </div>
            <span className="text-sm font-medium text-slate-700 font-sans whitespace-nowrap">
              {patient.adi_national_rank >= 80 ? 'High' : patient.adi_national_rank >= 50 ? 'Moderate' : 'Low'} (Rank {patient.adi_national_rank}/100)
            </span>
          </div>
        </section>
      )}

      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 font-sans">30-day check-in pattern</h3>
        <div className="flex items-end gap-0.5 h-10" aria-label={`${completionPct}% check-in completion over 30 days`}>
          {bars.map((b) => (
            <div key={b.day} className={`flex-1 rounded-sm transition ${b.responded === null ? 'bg-slate-100 h-3' : b.responded ? 'bg-forest h-8' : 'bg-red-200 h-4'}`} title={b.responded === null ? `Day ${b.day}: pending` : b.responded ? `Day ${b.day}: responded` : `Day ${b.day}: no reply`} />
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 font-sans mt-1.5">
          <span>Day 1</span>
          <span className="font-medium text-slate-600">{completionPct}% completion</span>
          <span>Day 30</span>
        </div>
      </section>
    </div>
  );
}
