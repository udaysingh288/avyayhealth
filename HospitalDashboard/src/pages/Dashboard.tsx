import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Clock } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import MetricCard from '../components/metrics/MetricCard';
import EngagementChart from '../components/metrics/EngagementChart';
import AlertBanner from '../components/alerts/AlertBanner';
import RiskBadge from '../components/shared/RiskBadge';
import SDOHIcons from '../components/patients/SDOHIcons';
import PatientDetailPanel from '../components/patients/PatientDetailPanel';
import { MOCK_PATIENTS, MOCK_METRICS } from '../utils/mockData';
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
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [conditionFilter, setConditionFilter] = useState<ConditionFilter>('all');
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const patients = useMemo(() => {
    let list = [...MOCK_PATIENTS];

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
      // Within same risk: sort by last check-in recency
      const aTime = a.last_checkin_at ? new Date(a.last_checkin_at).getTime() : 0;
      const bTime = b.last_checkin_at ? new Date(b.last_checkin_at).getTime() : 0;
      return bTime - aTime;
    });

    return list;
  }, [riskFilter, conditionFilter, search]);

  const unacknowledgedCount = MOCK_METRICS.unacknowledged_alerts;

  return (
    <div className="flex flex-col h-full">
      <TopBar
        title="Patient Overview"
        lastUpdated="just now"
        onRefresh={() => {}}
      />

      <AlertBanner count={unacknowledgedCount} />

      <div className="flex-1 p-6 overflow-auto">
        {/* Metrics row */}
        <div className="flex gap-3 mb-6">
          <MetricCard
            label="Active patients"
            value={MOCK_METRICS.total_active_patients}
            onClick={() => setRiskFilter('all')}
            active={riskFilter === 'all'}
          />
          <MetricCard
            label="Red alerts"
            value={MOCK_METRICS.red_count}
            subLabel="Need immediate call"
            variant="red"
            onClick={() => setRiskFilter('red')}
            active={riskFilter === 'red'}
          />
          <MetricCard
            label="Yellow — watch"
            value={MOCK_METRICS.yellow_count}
            subLabel="Follow up today"
            variant="yellow"
            onClick={() => setRiskFilter('yellow')}
            active={riskFilter === 'yellow'}
          />
          <MetricCard
            label="Green — stable"
            value={MOCK_METRICS.green_count}
            variant="green"
            onClick={() => setRiskFilter('green')}
            active={riskFilter === 'green'}
          />
          <MetricCard
            label="Engagement rate"
            value={`${Math.round(MOCK_METRICS.daily_response_rate * 100)}%`}
            subLabel="Today"
            variant="blue"
          />
        </div>

        {/* Table + chart grid */}
        <div className="flex gap-5 items-start">
          {/* Patient table */}
          <div className="flex-1 min-w-0 bg-white rounded-lg border border-slate-200">
            {/* Table toolbar */}
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-48">
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

              {/* Condition filter */}
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
                    <th className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Condition
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Risk
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Program
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                      Last check-in
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Last reply
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      SDOH
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {patients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-12 text-center text-sm text-slate-400 font-sans">
                        No patients match the current filters.
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

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-1.5">
              <Clock size={12} className="text-slate-400" aria-hidden="true" />
              <span className="text-xs text-slate-400 font-sans">
                Auto-refreshes every 2 minutes
              </span>
            </div>
          </div>

          {/* Right column — chart + SDOH summary */}
          <div className="w-72 shrink-0 space-y-4">
            <EngagementChart />
            <SDOHSummaryCard />
            <CMSSummaryCard />
          </div>
        </div>
      </div>

      {/* Detail panel */}
      {selectedPatient && (
        <PatientDetailPanel
          patient={selectedPatient}
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
      aria-label={`${patient.last_name}, ${patient.first_name} — ${patient.risk_level} risk`}
    >
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className="font-medium text-slate-800">
          {patient.last_name}, {patient.first_name}
        </div>
        <div className="text-xs text-slate-400 mt-0.5">
          {patient.age}{patient.sex === 'Other' ? '' : patient.sex} · {patient.channel.toUpperCase()}
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
function SDOHSummaryCard() {
  const counts: Partial<Record<string, number>> = {};
  MOCK_PATIENTS.forEach((p) => {
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

// ──────────────────────────────────────────────
// CMS reimbursement summary
// ──────────────────────────────────────────────
function CMSSummaryCard() {
  return (
    <div className="bg-forest rounded-lg p-5 text-white">
      <h3 className="text-sm font-semibold font-sans mb-1">CMS Revenue Potential</h3>
      <p className="text-xs font-sans opacity-70 mb-3">Based on 47 active patients</p>
      <div className="text-2xl font-bold font-sans mb-0.5">$148,608</div>
      <p className="text-xs font-sans opacity-70">estimated annual reimbursement</p>
      <div className="mt-3 pt-3 border-t border-white/20 space-y-1">
        <div className="flex justify-between text-xs font-sans">
          <span className="opacity-70">RPM codes (99454–99458)</span>
          <span>$145/mo</span>
        </div>
        <div className="flex justify-between text-xs font-sans">
          <span className="opacity-70">CCM (99490)</span>
          <span>$66/mo</span>
        </div>
        <div className="flex justify-between text-xs font-sans">
          <span className="opacity-70">TCM per discharge (99496)</span>
          <span>$298</span>
        </div>
      </div>
    </div>
  );
}
