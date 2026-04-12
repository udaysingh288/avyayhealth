import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Clock } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import MetricCard from '../components/metrics/MetricCard';
import EngagementChart from '../components/metrics/EngagementChart';
import AlertBanner from '../components/alerts/AlertBanner';
import RiskBadge from '../components/shared/RiskBadge';
import SDOHIcons from '../components/patients/SDOHIcons';
import PatientDetailPanel from '../components/patients/PatientDetailPanel';
import { useDashboardData } from '../hooks/useDashboardData';
import { riskSortOrder, conditionLabel, actionLabel } from '../utils/riskUtils';
import { relativeTime, dayOfProgram } from '../utils/dateUtils';
import type { Patient, RiskLevel, Condition } from '../types';

type RiskFilter = RiskLevel | 'all';
type ConditionFilter = Condition | 'all';

function actionButtonClass(risk: RiskLevel) {
  if (risk === 'red')
    return 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100';
  if (risk === 'yellow')
    return 'bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100';
  return 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100';
}

export default function Dashboard() {
  const { patients: allPatients, metrics, checkinsMap, loading, isMock, refetch } = useDashboardData();
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const patients = useMemo(() => {
    let list = [...allPatients];

    if (riskFilter !== 'all') {
      list = list.filter((p) => p.risk_level === riskFilter);
    }
    if (conditionFilter !== 'all') {
      list = list.filter((p) => p.condition === conditionFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.first_name.toLowerCase().includes(q) ||
          p.last_name.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const riskDiff = riskSortOrder(a.risk_level) - riskSortOrder(b.risk_level);
      if (riskDiff !== 0) return riskDiff;
      const aTime = a.last_checkin_at ? new Date(a.last_checkin_at).getTime() : 0;
      const bTime = b.last_checkin_at ? new Date(b.last_checkin_at).getTime() : 0;
      return bTime - aTime;
    });

    return list;
  }, [allPatients, riskFilter, conditionFilter, search]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <TopBar title="Patient Overview" lastUpdated="loading…" onRefresh={() => {}} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-500 font-sans text-sm">Loading dashboard…</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Patient Overview"
        lastUpdated="just now"
        onRefresh={refetch}
      />

      <AlertBanner count={metrics.unacknowledged_alerts} />

      {isMock && (
        <div className="mx-6 mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-700 font-sans">
          Showing demo data — sign in with Supabase credentials to see live patients.
        </div>
      )}

      <div className="flex-1 p-4 sm:p-6 overflow-auto">
        {/* Metrics row — scrollable on mobile, wraps on tablet+ */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 sm:pb-0 sm:flex-wrap sm:overflow-visible">
          <MetricCard
            label="Active patients"
            value={metrics.total_active_patients}
            onClick={() => setRiskFilter('all')}
            active={riskFilter === 'all'}
          />
          <MetricCard
            label="Red alerts"
            value={metrics.red_count}
            subLabel="Need immediate call"
            variant="red"
            onClick={() => setRiskFilter('red')}
            active={riskFilter === 'red'}
          />
          <MetricCard
            label="Yellow — watch"
            value={metrics.yellow_count}
            subLabel="Follow up today"
            variant="yellow"
            onClick={() => setRiskFilter('yellow')}
            active={riskFilter === 'yellow'}
          />
          <MetricCard
            label="Green — stable"
            value={metrics.green_count}
            variant="green"
            onClick={() => setRiskFilter('green')}
            active={riskFilter === 'green'}
          />
          <MetricCard
            label="Engagement rate"
            value={`${Math.round(metrics.daily_response_rate * 100)}%`}
            subLabel="Today"
            variant="blue"
          />
        </div>

        {/* Table + chart grid — stacked on mobile, side-by-side on xl */}
        <div className="flex flex-col xl:flex-row gap-5 items-start">
          {/* Patient table */}
          <div className="w-full xl:flex-1 xl:min-w-0 bg-white rounded-lg border border-slate-200">
            {/* Table toolbar */}
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1 min-w-0 sm:min-w-48">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  placeholder="Search by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm font-sans border border-slate-200 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-forest focus:border-forest transition"
                  aria-label="Search patients"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <SlidersHorizontal size={13} className="text-slate-400" aria-hidden="true" />
                <span className="text-xs text-slate-500 font-sans">Condition:</span>
                {(['all', 'chf', 'copd'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setConditionFilter(c as ConditionFilter)}
                    className={`text-xs font-sans px-2 py-1 rounded transition
                      ${conditionFilter === c
                        ? 'bg-forest text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {c === 'all' ? 'All' : c === 'chf' ? 'Heart Failure' : 'COPD'}
                  </button>
                ))}
              </div>

              <span className="text-xs text-slate-400 font-sans ml-auto">
                {patients.length} patient{patients.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans" aria-label="Patient list">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Patient</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Condition</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Risk</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Program</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">Last check-in</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Last reply</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">SDOH</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400 font-sans">
                        {allPatients.length === 0
                          ? 'No patients enrolled yet. Patients will appear here once enrolled at discharge.'
                          : 'No patients match the current filters.'}
                      </td>
                    </tr>
                  ) : (
                    patients.map((patient) => (
                      <PatientRow
                        key={patient.id}
                        patient={patient}
                        isSelected={selectedPatient?.id === patient.id}
                        onSelect={() =>
                          setSelectedPatient(
                            selectedPatient?.id === patient.id ? null : patient
                          )
                        }
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-1.5">
              <Clock size={12} className="text-slate-400" aria-hidden="true" />
              <span className="text-xs text-slate-400 font-sans">
                Auto-refreshes every 2 minutes
              </span>
            </div>
          </div>

          {/* Right column — full width on mobile, fixed width on xl */}
          <div className="w-full xl:w-72 xl:shrink-0 space-y-4">
            <EngagementChart />
            <SDOHSummaryCard patients={allPatients} />
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selectedPatient && (
        <PatientDetailPanel
          patient={selectedPatient}
          checkinsMap={checkinsMap}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Patient row component
// ──────────────────────────────────────────────
interface PatientRowProps {
  patient: Patient;
  isSelected: boolean;
  onSelect: () => void;
}

function PatientRow({ patient, isSelected, onSelect }: PatientRowProps) {
  const summary = patient.last_reply_summary
    ? patient.last_reply_summary.length > 58
      ? patient.last_reply_summary.slice(0, 58) + '…'
      : patient.last_reply_summary
    : '—';

  return (
    <tr
      className={`border-b border-slate-50 cursor-pointer transition
        ${isSelected ? 'bg-forest-50' : 'hover:bg-slate-50'}
        ${patient.risk_level === 'red' ? 'hover:bg-red-50/30' : ''}
      `}
      onClick={onSelect}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-selected={isSelected}
      aria-label={`${patient.last_name || patient.first_name} — ${patient.risk_level} risk`}
    >
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="font-medium text-slate-800">
          {patient.last_name ? `${patient.last_name}, ${patient.first_name}` : patient.first_name}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {patient.age > 0 ? `${patient.age}` : ''}
          {patient.sex !== 'Other' ? patient.sex : ''}
          {patient.channel ? ` · ${patient.channel.toUpperCase()}` : ''}
        </div>
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
        {conditionLabel(patient.condition)}
      </td>
      <td className="px-4 py-3.5">
        <RiskBadge risk={patient.risk_level} size="sm" />
      </td>
      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
        {dayOfProgram(patient.days_in_program)}
      </td>
      <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">
        {relativeTime(patient.last_checkin_at)}
      </td>
      <td className="px-4 py-3.5 text-slate-600 text-xs max-w-[200px]">
        <span title={patient.last_reply_summary ?? undefined}>{summary}</span>
      </td>
      <td className="px-4 py-3.5">
        <SDOHIcons flags={patient.sdoh_flags} compact />
      </td>
      <td className="px-4 py-3.5 whitespace-nowrap">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
          className={`text-xs font-medium px-2.5 py-1.5 rounded transition font-sans
            focus:outline-none focus:ring-2 focus:ring-forest
            ${actionButtonClass(patient.risk_level)}`}
        >
          {actionLabel(patient.risk_level)}
        </button>
      </td>
    </tr>
  );
}

// ──────────────────────────────────────────────
// SDOH summary card
// ──────────────────────────────────────────────
function SDOHSummaryCard({ patients }: { patients: Patient[] }) {
  const counts: Partial<Record<string, number>> = {};
  patients.forEach((p) => {
    p.sdoh_flags.forEach((f) => {
      counts[f] = (counts[f] ?? 0) + 1;
    });
  });

  const total = Object.values(counts).reduce((a, b) => (a ?? 0) + (b ?? 0), 0) ?? 0;

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 font-sans mb-3">
        SDOH Flags
      </h3>
      <div className="text-2xl font-bold text-amber-600 font-sans mb-1">{total}</div>
      <p className="text-xs text-slate-400 font-sans mb-3">active flags across all patients</p>
      <div className="space-y-1.5">
        {Object.entries(counts).map(([domain, count]) => (
          <div key={domain} className="flex justify-between text-xs font-sans">
            <span className="text-slate-600 capitalize">{domain.replace('_', ' ')}</span>
            <span className="font-semibold text-slate-700">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
