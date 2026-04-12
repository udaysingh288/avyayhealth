import {
  Users,
  AlertCircle,
  Activity,
  TrendingUp,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import Card from '../components/shared/Card';
import Stat from '../components/shared/Stat';
import { HRRP, CMS_CODES } from '../data/mockData';
import { useHospitalData } from '../hooks/useHospitalData';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function Overview() {
  const { hospital, coordinators, conditions, sdohFlags, loading, isMock } =
    useHospitalData();

  if (loading) {
    return (
      <div className="px-4 sm:px-8 py-5 sm:py-7 max-w-[1280px]">
        <div className="text-slate-500 font-sans text-sm">Loading hospital data…</div>
      </div>
    );
  }

  const totalRed = coordinators.reduce((a, c) => a + c.redAlerts, 0);
  const totalYellow = coordinators.reduce((a, c) => a + c.yellowWatch, 0);
  const avgCompletion =
    coordinators.length > 0
      ? coordinators.reduce((a, c) => a + c.completionRate, 0) / coordinators.length
      : 0;
  const avgSla =
    coordinators.length > 0
      ? coordinators.reduce((a, c) => a + c.slaCompliance, 0) / coordinators.length
      : 0;

  // Annualized CMS potential for active patients: rough stack of monthly codes
  const monthlyPerPatient =
    CMS_CODES.filter((c) => c.cadence === '/month').reduce((a, c) => a + c.amount, 0);
  const annualCmsPotential = monthlyPerPatient * 12 * hospital.activePatients;

  const projectedPenaltySavings = HRRP.currentAnnualPenalty * HRRP.projectedReductionPct;

  const sdohTotal = Object.values(sdohFlags).reduce((a, b) => a + b, 0);

  return (
    <div className="px-4 sm:px-8 py-5 sm:py-7 max-w-[1280px]">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[12px] uppercase tracking-wider text-slate-500 font-sans font-semibold">
            Quality Overview
          </div>
          {isMock && (
            <span className="text-[10px] uppercase tracking-wider bg-warn/10 text-warn font-semibold px-1.5 py-0.5 rounded">
              Demo data
            </span>
          )}
        </div>
        <h1 className="font-serif text-[34px] text-forest leading-tight">
          {hospital.name}
        </h1>
        <p className="text-slate-600 font-sans text-[14px] mt-1">
          {hospital.beds} beds · {hospital.activePatients} patients enrolled in
          post-discharge program · day {hospital.programDays}
        </p>
      </header>

      {/* Top stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <Stat
          label="Active patients"
          value={hospital.activePatients}
          sub={`Across ${coordinators.length} coordinators`}
          icon={<Users size={17} />}
        />
        <Stat
          label="Red alerts today"
          value={totalRed}
          tone="danger"
          sub={`${totalYellow} yellow — watch`}
          icon={<AlertCircle size={17} />}
        />
        <Stat
          label="Check-in completion"
          value={`${Math.round(avgCompletion * 100)}%`}
          tone="forest"
          sub={`${Math.round(avgSla * 100)}% SLA compliance`}
          icon={<Activity size={17} />}
        />
        <Stat
          label="Projected CMS revenue"
          value={formatCurrency(annualCmsPotential)}
          tone="forest"
          sub="annualized, active cohort"
          icon={<DollarSign size={17} />}
        />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <Stat
          label="HRRP penalty exposure"
          value={formatCurrency(HRRP.currentAnnualPenalty)}
          tone="danger"
          sub={`${(HRRP.currentPenaltyRate * 100).toFixed(1)}% of $${(
            HRRP.annualMedicareRevenue / 1_000_000
          ).toFixed(0)}M Medicare revenue`}
          icon={<ShieldAlert size={17} />}
        />
        <Stat
          label="Projected penalty savings"
          value={formatCurrency(projectedPenaltySavings)}
          tone="success"
          sub={`${HRRP.projectedReductionPct * 100}% readmission reduction`}
          icon={<TrendingUp size={17} />}
        />
        <Stat
          label="SDOH flags raised"
          value={sdohTotal}
          tone="warn"
          sub="Across 5 CMS domains"
          icon={<AlertCircle size={17} />}
        />
      </div>

      {/* Condition + coordinator summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        <Card
          title="Condition breakdown"
          subtitle="30-day readmission rate by condition"
        >
          <div className="divide-y divide-slate-100">
            {conditions.map((c) => (
              <div
                key={c.condition}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <div className="font-sans text-[14px] font-semibold text-slate-800">
                    {c.condition}
                  </div>
                  <div className="text-[12px] text-slate-500">
                    {c.patients} patients enrolled
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-sans text-[15px] font-bold ${
                      c.readmissionRate >= 0.2
                        ? 'text-danger'
                        : c.readmissionRate >= 0.17
                          ? 'text-warn'
                          : 'text-success'
                    }`}
                  >
                    {(c.readmissionRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[11px] text-slate-500">readmission</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Coordinator workload"
          subtitle="Active patients per care coordinator"
        >
          <div className="divide-y divide-slate-100">
            {coordinators.map((c) => (
              <div key={c.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <div className="font-sans text-[14px] font-semibold text-slate-800">
                      {c.name}
                    </div>
                    <div className="text-[11px] text-slate-500">{c.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[14px] font-bold text-forest">
                      {c.activePatients}
                    </div>
                    <div className="text-[10px] text-slate-500">patients</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-sans">
                  <span className="text-danger font-semibold">
                    {c.redAlerts} red
                  </span>
                  <span className="text-warn font-semibold">
                    {c.yellowWatch} yellow
                  </span>
                  <span className="text-slate-500">
                    {Math.round(c.completionRate * 100)}% completion
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
