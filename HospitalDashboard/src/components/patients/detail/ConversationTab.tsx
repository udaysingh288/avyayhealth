import { MessageSquare, AlertTriangle } from 'lucide-react';
import type { CheckIn } from '../../../types';
import { timeStamp, relativeTime } from '../../../utils/dateUtils';

export default function ConversationTab({ checkins }: { checkins: CheckIn[] }) {
  if (checkins.length === 0) {
    return (
      <div className="p-5 text-center">
        <MessageSquare size={32} className="text-slate-300 mx-auto mb-3" aria-hidden="true" />
        <p className="text-sm text-slate-400 font-sans">
          No check-ins yet. First check-in will be sent within 24 hours of discharge.
        </p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {checkins.map((ci) => (
        <div key={ci.id} className="space-y-2">
          <div className="text-center">
            <span className="text-xs text-slate-400 font-sans bg-white px-2 border-b border-slate-100">
              {timeStamp(ci.sent_at)}
            </span>
          </div>

          {/* AI message */}
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-forest flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold font-sans">A</span>
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-500 font-sans mb-1">Avyay Health · AI check-in</div>
              <div className="bg-slate-800 text-white text-sm font-mono rounded-lg rounded-tl-none px-3.5 py-2.5 leading-relaxed max-w-[340px]">
                {ci.ai_summary ?? 'Daily check-in question sent'}
              </div>
            </div>
          </div>

          {/* Patient reply */}
          {ci.patient_message && (
            <div className="flex gap-2 flex-row-reverse">
              <div className="w-7 h-7 rounded-full bg-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-slate-600 text-xs font-bold font-sans">P</span>
              </div>
              <div className="flex-1 flex flex-col items-end">
                <div className="text-xs text-slate-500 font-sans mb-1">
                  Patient · {ci.replied_at ? relativeTime(ci.replied_at) : ''}
                </div>
                <div
                  className="bg-slate-100 text-slate-800 text-sm font-sans rounded-lg rounded-tr-none px-3.5 py-2.5 leading-relaxed max-w-[300px]"
                  style={{ userSelect: 'none' }}
                  onCopy={(e) => {
                    e.preventDefault();
                    alert('Copying patient messages is restricted per privacy policy.');
                  }}
                >
                  {ci.patient_message}
                </div>
              </div>
            </div>
          )}

          {/* Escalation */}
          {ci.escalated && (
            <div className="ml-9 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertTriangle size={13} className="text-red-600 shrink-0" aria-hidden="true" />
              <div>
                <span className="text-xs font-semibold text-red-700 font-sans block">Escalated to RED</span>
                <span className="text-xs text-red-600 font-sans">{ci.escalation_reason}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
