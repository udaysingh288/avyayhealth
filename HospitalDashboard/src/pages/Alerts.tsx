import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import RiskBadge from '../components/shared/RiskBadge';
import type { Alert } from '../types';
import { relativeTime, timeStamp } from '../utils/dateUtils';
import { useAuthStore } from '../store/authStore';
import { useDashboardData } from '../hooks/useDashboardData';

type ActionType = 'called' | 'escalated' | 'other';

interface AckState {
  alertId: string;
  actionType: ActionType;
  actionNote: string;
}

export default function Alerts() {
  const profile = useAuthStore((s) => s.profile);
  const { alerts: liveAlerts } = useDashboardData();
  const [alerts, setAlerts] = useState<Alert[]>(liveAlerts);
  const [ackState, setAckState] = useState<AckState | null>(null);
  const [activeTab, setActiveTab] = useState<'unacknowledged' | 'all'>('unacknowledged');

  // Sync when live data refreshes (new escalations from DB)
  useEffect(() => {
    setAlerts(liveAlerts);
  }, [liveAlerts]);

  const unack = alerts.filter((a) => !a.acknowledged);
  const acked = alerts.filter((a) => a.acknowledged);
  const displayed = activeTab === 'unacknowledged' ? unack : alerts;

  function startAck(alertId: string) {
    setAckState({ alertId, actionType: 'called', actionNote: '' });
  }

  function confirmAck() {
    if (!ackState) return;
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === ackState.alertId
          ? {
              ...a,
              acknowledged: true,
              acknowledged_at: new Date().toISOString(),
              acknowledged_by: profile?.display_name ?? 'Coordinator',
              action_taken: buildActionText(ackState),
            }
          : a
      )
    );
    setAckState(null);
  }

  function buildActionText(state: AckState): string {
    const prefix =
      state.actionType === 'called'
        ? 'Called patient.'
        : state.actionType === 'escalated'
        ? 'Escalated to physician.'
        : 'Action taken.';
    return state.actionNote ? `${prefix} ${state.actionNote}` : prefix;
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Alerts" />

      {/* Ack modal */}
      {ackState && (
        <AcknowledgeModal
          ackState={ackState}
          alert={alerts.find((a) => a.id === ackState.alertId)!}
          onChange={setAckState}
          onConfirm={confirmAck}
          onCancel={() => setAckState(null)}
        />
      )}

      <div className="flex-1 p-6 overflow-auto">
        {/* Summary bar */}
        <div className="flex gap-4 mb-6">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm font-sans
            ${unack.length > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            {unack.length > 0
              ? <AlertTriangle size={18} className="text-red-600 shrink-0" aria-hidden="true" />
              : <CheckCircle size={18} className="text-green-600 shrink-0" aria-hidden="true" />
            }
            <div>
              <div className={`font-semibold ${unack.length > 0 ? 'text-red-700' : 'text-green-700'}`}>
                {unack.length > 0
                  ? `${unack.length} unacknowledged alert${unack.length !== 1 ? 's' : ''}`
                  : 'All alerts acknowledged'}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {unack.length > 0 ? 'Patients need immediate coordinator follow-up' : 'No outstanding urgent flags'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-slate-200 bg-white text-sm font-sans">
            <Clock size={18} className="text-slate-400 shrink-0" aria-hidden="true" />
            <div>
              <div className="font-semibold text-slate-700">{acked.length} resolved today</div>
              <div className="text-xs text-slate-400 mt-0.5">Acknowledged by care team</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-slate-200 mb-5">
          {(['unacknowledged', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2.5 text-sm font-sans font-medium capitalize transition border-b-2
                focus:outline-none
                ${activeTab === tab
                  ? 'border-forest text-forest'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab === 'unacknowledged' ? 'Needs action' : 'All alerts'}
              <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                {tab === 'unacknowledged' ? unack.length : alerts.length}
              </span>
            </button>
          ))}
        </div>

        {/* Alert cards */}
        {displayed.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle size={40} className="text-green-400 mx-auto mb-3" aria-hidden="true" />
            <p className="text-slate-500 font-sans">No urgent alerts right now. All patients are stable or being monitored.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={() => startAck(alert.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Alert card
// ──────────────────────────────────────────────
interface AlertCardProps {
  alert: Alert;
  onAcknowledge: () => void;
}

function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  return (
    <div
      className={`rounded-lg border p-5 transition
        ${alert.acknowledged
          ? 'bg-white border-slate-200'
          : 'bg-red-50 border-red-200 shadow-sm'
        }`}
      role="article"
      aria-label={`Alert for ${alert.patient_name}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`mt-0.5 shrink-0 ${alert.acknowledged ? 'text-slate-300' : 'text-red-500'}`}>
            {alert.acknowledged
              ? <CheckCircle size={18} aria-hidden="true" />
              : <AlertTriangle size={18} aria-hidden="true" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1">
              <span className="font-semibold text-slate-800 font-sans text-sm">
                {alert.patient_name}
              </span>
              <RiskBadge risk={alert.risk_level} size="sm" />
            </div>
            <p className="text-sm text-slate-700 font-sans leading-relaxed mb-2">
              {alert.reason}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-sans">
              <span className="flex items-center gap-1">
                <Clock size={11} aria-hidden="true" />
                {relativeTime(alert.created_at)}
              </span>
              {alert.acknowledged && alert.acknowledged_by && (
                <span className="flex items-center gap-1">
                  <User size={11} aria-hidden="true" />
                  Resolved by {alert.acknowledged_by} · {timeStamp(alert.acknowledged_at!)}
                </span>
              )}
            </div>

            {alert.action_taken && (
              <div className="mt-2.5 bg-white border border-slate-200 rounded-md px-3 py-2 text-xs text-slate-600 font-sans">
                <span className="font-medium text-slate-700">Action: </span>
                {alert.action_taken}
              </div>
            )}
          </div>
        </div>

        {!alert.acknowledged && (
          <button
            onClick={onAcknowledge}
            className="shrink-0 text-xs font-semibold font-sans px-3.5 py-2 rounded-md
              bg-white text-red-700 border border-red-300 hover:bg-red-50 transition
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Acknowledge modal
// ──────────────────────────────────────────────
interface AcknowledgeModalProps {
  ackState: AckState;
  alert: Alert;
  onChange: (s: AckState) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

function AcknowledgeModal({ ackState, alert, onChange, onConfirm, onCancel }: AcknowledgeModalProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onCancel} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Acknowledge alert"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
          bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-6"
      >
        <h2 className="font-semibold text-slate-800 font-sans text-base mb-1">
          Acknowledge alert
        </h2>
        <p className="text-sm text-slate-500 font-sans mb-4">
          {alert.patient_name} — {alert.reason}
        </p>

        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-600 font-sans mb-2">Action taken:</p>
          <div className="space-y-2">
            {[
              { value: 'called', label: "I've called the patient" },
              { value: 'escalated', label: 'Escalated to physician' },
              { value: 'other', label: 'Other action' },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  type="radio"
                  name="action-type"
                  value={opt.value}
                  checked={ackState.actionType === opt.value}
                  onChange={() => onChange({ ...ackState, actionType: opt.value as ActionType })}
                  className="accent-forest"
                />
                <span className="text-sm font-sans text-slate-700">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="action-note" className="block text-xs font-semibold text-slate-600 font-sans mb-1.5">
            Notes (optional)
          </label>
          <textarea
            id="action-note"
            value={ackState.actionNote}
            onChange={(e) => onChange({ ...ackState, actionNote: e.target.value })}
            placeholder="What did you do? What did the patient say?"
            rows={3}
            className="w-full text-sm font-sans border border-slate-200 rounded-lg px-3.5 py-2.5
              focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest transition
              resize-none placeholder-slate-400"
          />
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-sans font-medium text-slate-600
              border border-slate-200 rounded-lg hover:bg-slate-50 transition
              focus:outline-none focus:ring-2 focus:ring-forest"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-sans font-semibold bg-forest text-white rounded-lg
              hover:bg-forest-light transition
              focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1"
          >
            Confirm &amp; resolve
          </button>
        </div>
      </div>
    </>
  );
}
