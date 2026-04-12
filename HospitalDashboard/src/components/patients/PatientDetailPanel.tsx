import { useState, useEffect, useRef } from 'react';
import {
  X,
  Phone,
  CheckCheck,
  AlertTriangle,
  Calendar,
  Smartphone,
  MapPin,
} from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';
import type { Patient, CoordinatorNote, CheckIn } from '../../types';
import { MOCK_NOTES } from '../../utils/mockData';
import { conditionLabel } from '../../utils/riskUtils';
import { dayOfProgram, shortDate } from '../../utils/dateUtils';
import { useAuthStore } from '../../store/authStore';
import OverviewTab from './detail/OverviewTab';
import ConversationTab from './detail/ConversationTab';
import NotesTab from './detail/NotesTab';

interface PatientDetailPanelProps {
  patient: Patient;
  checkinsMap: Record<string, CheckIn[]>;
  onClose: () => void;
}

export default function PatientDetailPanel({ patient, checkinsMap, onClose }: PatientDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'conversation' | 'notes'>('overview');
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<CoordinatorNote[]>(MOCK_NOTES[patient.id] ?? []);
  const profile = useAuthStore((s) => s.profile);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = panelRef.current;
    if (el) el.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const checkins = checkinsMap[patient.id] ?? [];

  function submitNote() {
    if (!noteText.trim()) return;
    const newNote: CoordinatorNote = {
      id: `n-${Date.now()}`,
      patient_id: patient.id,
      coordinator_id: profile?.id ?? 'unknown',
      coordinator_name: profile?.display_name ?? 'Coordinator',
      note: noteText.trim(),
      created_at: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setNoteText('');
  }

  const completionPct = Math.round(patient.checkin_completion_rate * 100);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Patient detail: ${patient.last_name || patient.first_name}`}
        className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50 flex flex-col
          outline-none overflow-hidden"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <h2 className="text-base font-semibold text-slate-800 font-sans">
                {patient.last_name ? `${patient.last_name}, ${patient.first_name}` : patient.first_name}
              </h2>
              <RiskBadge risk={patient.risk_level} size="sm" />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 font-sans">
              {patient.age > 0 && <span>{patient.age} yrs · {patient.sex === 'M' ? 'Male' : patient.sex === 'F' ? 'Female' : ''}</span>}
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

        {/* Quick info */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex gap-5 text-xs font-sans shrink-0 overflow-x-auto">
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
        <div className="px-5 py-3 border-b border-slate-100 flex gap-2 shrink-0 overflow-x-auto">
          <button className="flex items-center gap-1.5 text-xs font-medium font-sans px-3 py-2 rounded-md bg-forest text-white hover:bg-forest-light transition focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1 whitespace-nowrap">
            <Phone size={13} aria-hidden="true" />
            Log a call
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium font-sans px-3 py-2 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 transition focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1 whitespace-nowrap">
            <CheckCheck size={13} aria-hidden="true" />
            Mark reviewed
          </button>
          <button className="flex items-center gap-1.5 text-xs font-medium font-sans px-3 py-2 rounded-md bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 whitespace-nowrap">
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
              className={`py-3 text-sm font-sans font-medium capitalize transition border-b-2 focus:outline-none
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
          {activeTab === 'overview' && <OverviewTab patient={patient} />}
          {activeTab === 'conversation' && <ConversationTab checkins={checkins} />}
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
