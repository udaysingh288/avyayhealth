import { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  CheckCheck,
  AlertTriangle,
  MessageSquare,
  Calendar,
  Smartphone,
  MapPin,
} from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';
import SDOHIcons, { domainConfig } from './SDOHIcons';
import type { Patient, CoordinatorNote, CheckIn } from '../../types';
import { MOCK_CHECKINS, MOCK_NOTES } from '../../utils/mockData';
import { conditionLabel } from '../../utils/riskUtils';
import { dayOfProgram } from '../../utils/dateUtils';
import { timeStamp, shortDate, relativeTime } from '../../utils/dateUtils';
import { useAuthStore } from '../../store/authStore';

interface PatientDetailPanelProps {
  patient: Patient;
  onClose: () => void;
}

export default function PatientDetailPanel({ patient, onClose }: PatientDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'conversation' | 'notes'>('overview');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<CoordinatorNote[]>(MOCK_NOTES[patient.id] ?? []);
  const coordinator = useAuthStore((s) => s.coordinator);
  const panelRef = useRef<HTMLDivElement>(null);

  // Focus trap on open
  useEffect(() => {
    const el = panelRef.current;
    if (el) el.focus();
  }, []);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const checkins = MOCK_CHECKINS[patient.id] ?? [];

  function submitNote() {
    if (!noteText.trim()) return;
    const newNote: CoordinatorNote = {
      id: `n-${Date.now()}`,
      patient_id: patient.id,
      coordinator_id: coordinator?.id ?? 'c-001',
      coordinator_name: coordinator?.display_name ?? 'Coordinator',
      note: noteText.trim(),
      created_at: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setNoteText('');
  }

  const completionPct = Math.round(patient.checkin_completion_rate * 100);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Patient detail: ${patient.last_name}, ${patient.first_name}`}
        className="fixed right-0 top-0 h-full w-[480px] bg-white shadow-2xl z-50 flex flex-col
          outline-none overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <h2 className="text-base font-semibold text-slate-800 font-sans">
                {patient.last_name}, {patient.first_name}
              </h2>
              <RiskBadge risk={patient.risk_level} size="sm" />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-sans">
              <span>{patient.age} yrs · {patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : 'Other'}</span>
              <span>{conditionLabel(patient.condition)}</span>
              <span>{dayOfProgram(patient.days_in_program)}</span>
              <span className="flex items-center gap-1">
                <Calendar size={11} aria-hidden="true" />
                Discharged {shortDate(patient.discharge_date)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-1.5 rounded-md hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-forest shrink-0"
            aria-label="Close detail panel"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick info bar */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex gap-5 text-xs font-sans shrink-0">
          <div>
            <span className="text-slate-400 block">Channel</span>
            <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
              <Smartphone size={11} aria-hidden="true" />
              {patient.channel.toUpperCase()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block">Phone</span>
            <span className="font-mono font-medium text-slate-700 mt-0.5">***-***-{patient.phone_last_four}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Completion</span>
            <span className="font-medium text-slate-700 mt-0.5">{completionPct}%</span>
          </div>
          {patient.adi_national_rank !== null && (
            <div>
              <span className="text-slate-400 block">ADI rank</span>
              <span className="font-medium text-slate-700 flex items-center gap-1 mt-0.5">
                <MapPin size={11} aria-hidden="true" />
                {patient.adi_national_rank}/100
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-5 py-3 border-b border-slate-100 flex gap-2 shrink-0">
          <button
            className="flex items-center gap-1.5 text-xs font-medium font-sans px-3 py-2 rounded-md
              bg-forest text-white hover:bg-forest-light transition
              focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1"
          >
            <Phone size={13} aria-hidden="true" />
            Log a call
          </button>
          <button
            className="flex items-center gap-1.5 text-xs font-medium font-sans px-3 py-2 rounded-md
              bg-slate-100 text-slate-700 hover:bg-slate-200 transition
              focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1"
          >
            <CheckCheck size={13} aria-hidden="true" />
            Mark reviewed
          </button>
          <button
            className="flex items-center gap-1.5 text-xs font-medium font-sans px-3 py-2 rounded-md
              bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition
              focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            <AlertTriangle size={13} aria-hidden="true" />
            Escalate
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 border-b border-slate-100 flex gap-4 shrink-0">
          {(['overview', 'conversation', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 text-sm font-sans font-medium capitalize transition border-b-2
                focus:outline-none
                ${activeTab === tab
                  ? 'border-forest text-forest'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab}
              {tab === 'conversation' && checkins.length > 0 && (
                <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                  {checkins.length}
                </span>
              )}
              {tab === 'notes' && notes.length > 0 && (
                <span className="ml-1.5 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                  {notes.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'overview' && (
            <OverviewTab patient={patient} />
          )}
          {activeTab === 'conversation' && (
            <ConversationTab patientId={patient.id} />
          )}
          {activeTab === 'notes' && (
            <NotesTab
              notes={notes}
              noteText={noteText}
              onNoteChange={setNoteText}
              onSubmit={submitNote}
            />
          )}
        </div>
      </div>
    </>
  );
}

// ──────────────────────────────────────────────
// Overview tab
// ──────────────────────────────────────────────
function OverviewTab({ patient }: { patient: Patient }) {
  const completionPct = Math.round(patient.checkin_completion_rate * 100);

  // Build bar chart data (mock 30-day pattern)
  const bars = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    responded: i < patient.days_in_program
      ? Math.random() < patient.checkin_completion_rate
      : null,
  }));

  return (
    <div className="p-5 space-y-5">
      {/* Current risk */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 font-sans">
          Current status
        </h3>
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

      {/* SDOH flags */}
      {patient.sdoh_flags.length > 0 && (
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 font-sans">
            SDOH flags
          </h3>
          <div className="space-y-2">
            {patient.sdoh_flags.map((domain) => {
              const { label } = domainConfig[domain];
              const isSafety = domain === 'interpersonal_safety';
              return (
                <div
                  key={domain}
                  className={`flex items-start gap-2.5 rounded-lg p-3 text-sm
                    ${isSafety
                      ? 'bg-red-50 border border-red-200'
                      : 'bg-amber-50 border border-amber-200'
                    }`}
                >
                  {isSafety
                    ? <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" aria-hidden="true" />
                    : <SDOHIcons flags={[domain]} compact={false} />
                  }
                  <div>
                    <div className={`font-medium font-sans text-xs ${isSafety ? 'text-red-700' : 'text-amber-700'}`}>
                      {isSafety ? 'Safety concern flagged' : label}
                    </div>
                    <div className="text-xs font-sans text-slate-500 mt-0.5">
                      {isSafety
                        ? 'Coordinator follow-up required. Details are restricted.'
                        : 'Referred to community resources · Pending'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ADI */}
      {patient.adi_national_rank !== null && (
        <section>
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 font-sans">
            Neighborhood disadvantage
          </h3>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-amber-400 transition-all"
                style={{ width: `${patient.adi_national_rank}%` }}
                role="progressbar"
                aria-valuenow={patient.adi_national_rank}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <span className="text-sm font-medium text-slate-700 font-sans whitespace-nowrap">
              {patient.adi_national_rank >= 80
                ? 'High'
                : patient.adi_national_rank >= 50
                ? 'Moderate'
                : 'Low'} (Rank {patient.adi_national_rank}/100)
            </span>
          </div>
          <p className="text-xs text-slate-400 font-sans mt-1">
            Higher score = greater area deprivation
          </p>
        </section>
      )}

      {/* Check-in completion */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 font-sans">
          30-day check-in pattern
        </h3>
        <div className="flex items-end gap-0.5 h-10" aria-label={`${completionPct}% check-in completion over 30 days`}>
          {bars.map((b) => (
            <div
              key={b.day}
              className={`flex-1 rounded-sm transition
                ${b.responded === null
                  ? 'bg-slate-100 h-3'
                  : b.responded
                  ? 'bg-forest h-8'
                  : 'bg-red-200 h-4'
                }`}
              title={
                b.responded === null
                  ? `Day ${b.day}: pending`
                  : b.responded
                  ? `Day ${b.day}: responded`
                  : `Day ${b.day}: no reply`
              }
            />
          ))}
        </div>
        <div className="flex justify-between text-xs text-slate-400 font-sans mt-1.5">
          <span>Day 1</span>
          <span className="font-medium text-slate-600">{completionPct}% completion</span>
          <span>Day 30</span>
        </div>
      </section>

      {/* CMS codes */}
      <section>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 font-sans">
          CMS reimbursement codes
        </h3>
        <div className="bg-slate-50 rounded-lg border border-slate-200 divide-y divide-slate-100">
          {[
            { code: '99454', desc: 'RPM device supply', amount: '$52.11/mo' },
            { code: '99457', desc: 'RPM management 20 min', amount: '$51.77/mo' },
            { code: '99458', desc: 'RPM add-on', amount: '$41.42/mo' },
            { code: '99490', desc: 'CCM first 20 min', amount: '$66.13/mo' },
            { code: '99496', desc: 'TCM high complexity', amount: '$298 /discharge' },
          ].map((item) => (
            <div key={item.code} className="flex items-center justify-between px-3 py-2 text-xs font-sans">
              <div>
                <span className="font-mono font-medium text-slate-700">{item.code}</span>
                <span className="text-slate-500 ml-2">{item.desc}</span>
              </div>
              <span className="font-medium text-forest">{item.amount}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ──────────────────────────────────────────────
// Conversation tab
// ──────────────────────────────────────────────
function ConversationTab({ patientId }: { patientId: string }) {
  const checkins = MOCK_CHECKINS[patientId] ?? [];

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
          {/* Date separator */}
          <div className="text-center">
            <span className="text-xs text-slate-400 font-sans bg-white px-2 border-b border-slate-100">
              {timeStamp(ci.sent_at)}
            </span>
          </div>

          {/* AI message (left) */}
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-forest flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold font-sans">A</span>
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-500 font-sans mb-1">Avyay Health · AI check-in</div>
              <div className="bg-slate-800 text-white text-sm font-mono rounded-lg rounded-tl-none px-3.5 py-2.5 leading-relaxed max-w-[340px]">
                {ci.sdoh_domain_screened
                  ? sdohPrompt(ci.sdoh_domain_screened)
                  : defaultPrompt(ci)}
              </div>
            </div>
          </div>

          {/* Patient reply (right) */}
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

          {/* Escalation badge */}
          {ci.escalated && (
            <div className="ml-9 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertTriangle size={13} className="text-red-600 shrink-0" aria-hidden="true" />
              <div>
                <span className="text-xs font-semibold text-red-700 font-sans block">Escalated to RED</span>
                <span className="text-xs text-red-600 font-sans">{ci.escalation_reason}</span>
              </div>
            </div>
          )}

          {/* SDOH flag */}
          {ci.sdoh_domain_screened && ci.sdoh_response && !ci.sdoh_domain_screened.includes('safety') && (
            <div className="ml-9 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <span className="text-xs font-semibold text-amber-700 font-sans">SDOH flag: {ci.sdoh_domain_screened.replace('_', ' ')}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function defaultPrompt(ci: CheckIn): string {
  return `Hi, it's your day ${ci.id.includes('1') ? '1' : ci.id.includes('2') ? '2' : '3'} check-in from Avyay Health. How are you feeling today? Any pain, shortness of breath, or swelling?`;
}

function sdohPrompt(domain: string): string {
  const prompts: Record<string, string> = {
    transportation: 'One quick question — are you able to get to your follow-up appointment next week? Do you have transportation?',
    food_insecurity: 'Are you able to get regular meals each day? Is accessing food a concern right now?',
    housing_instability: 'Are you currently in a stable living situation? Do you have any concerns about housing?',
    utility_difficulty: 'Do you have reliable electricity and heat at home right now?',
    interpersonal_safety: 'Do you feel safe at home? Is there anything you\'d like to share with your care team?',
  };
  return prompts[domain] ?? 'We have a few questions about your social needs. Can you take a moment to answer?';
}

// ──────────────────────────────────────────────
// Notes tab
// ──────────────────────────────────────────────
interface NotesTabProps {
  notes: CoordinatorNote[];
  noteText: string;
  onNoteChange: (v: string) => void;
  onSubmit: () => void;
}

function NotesTab({ notes, noteText, onNoteChange, onSubmit }: NotesTabProps) {
  return (
    <div className="p-5 space-y-4">
      {/* Add note */}
      <div>
        <label htmlFor="note-input" className="block text-xs font-semibold text-slate-600 font-sans mb-1.5">
          Add coordinator note
        </label>
        <textarea
          id="note-input"
          value={noteText}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Document your action, observation, or follow-up…"
          rows={3}
          className="w-full text-sm font-sans border border-slate-200 rounded-lg px-3.5 py-2.5
            focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest transition
            resize-none placeholder-slate-400 text-slate-800"
        />
        <button
          onClick={onSubmit}
          disabled={!noteText.trim()}
          className="mt-2 text-xs font-medium font-sans px-3.5 py-2 rounded-md
            bg-forest text-white hover:bg-forest-light transition
            disabled:opacity-40 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1"
        >
          Save note
        </button>
      </div>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="text-sm text-slate-400 font-sans text-center py-6">
          No notes yet. Add one above.
        </p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700 font-sans">{note.coordinator_name}</span>
                <span className="text-xs text-slate-400 font-sans">{timeStamp(note.created_at)}</span>
              </div>
              <p className="text-sm text-slate-700 font-sans leading-relaxed">{note.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
