import Card from '../components/shared/Card';
import Stat from '../components/shared/Stat';
import { CMS_CODES, HOSPITAL } from '../data/mockData';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

function formatCurrencyExact(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(n);
}

export default function Reimbursement() {
  const monthlyStack = CMS_CODES.filter((c) => c.cadence === '/month');
  const oneTime = CMS_CODES.filter((c) => c.cadence === 'one-time');
  const perDischarge = CMS_CODES.filter((c) => c.cadence === '/discharge');

  const monthlyPerPatient = monthlyStack.reduce((a, c) => a + c.amount, 0);
  const annualPerPatient = monthlyPerPatient * 12;
  const annualCohort = annualPerPatient * HOSPITAL.activePatients;

  return (
    <div className="px-8 py-7 max-w-[1280px]">
      <header className="mb-6">
        <div className="text-[12px] uppercase tracking-wider text-slate-500 font-sans font-semibold mb-1">
          Revenue
        </div>
        <h1 className="font-serif text-[34px] text-forest leading-tight">
          CMS Reimbursement
        </h1>
        <p className="text-slate-600 font-sans text-[14px] mt-1">
          The post-discharge program more than pays for itself through RPM, CCM,
          and TCM codes
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <Stat
          label="Monthly per patient"
          value={formatCurrency(monthlyPerPatient)}
          tone="forest"
          sub="RPM + CCM stack"
        />
        <Stat
          label="Annual per patient"
          value={formatCurrency(annualPerPatient)}
          tone="forest"
          sub="Recurring monthly codes × 12"
        />
        <Stat
          label="Cohort annual potential"
          value={formatCurrency(annualCohort)}
          tone="success"
          sub={`${HOSPITAL.activePatients} patients enrolled`}
        />
      </div>

      <Card
        title="CMS reimbursement stack"
        subtitle="2026 national average rates"
        className="mb-5"
      >
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[13px] font-sans">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <th className="text-left px-5 py-3">Code</th>
                <th className="text-left px-3 py-3">Description</th>
                <th className="text-right px-3 py-3">Amount</th>
                <th className="text-right px-5 py-3">Cadence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {CMS_CODES.map((c) => (
                <tr key={c.code} className="hover:bg-sunken/40">
                  <td className="px-5 py-3.5 font-mono text-[12px] text-forest font-semibold">
                    {c.code}
                  </td>
                  <td className="px-3 py-3.5 text-slate-700">{c.desc}</td>
                  <td className="px-3 py-3.5 text-right font-semibold text-slate-800">
                    {formatCurrencyExact(c.amount)}
                  </td>
                  <td className="px-5 py-3.5 text-right text-slate-500">
                    {c.cadence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card title="One-time setup" subtitle="Per patient enrollment">
          <div className="space-y-2">
            {oneTime.map((c) => (
              <div key={c.code} className="flex justify-between">
                <div className="text-[12px] text-slate-600">
                  <span className="font-mono font-semibold text-forest">
                    {c.code}
                  </span>{' '}
                  {c.desc}
                </div>
                <div className="text-[12px] font-semibold text-slate-800">
                  {formatCurrencyExact(c.amount)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Recurring monthly" subtitle="RPM + CCM stack">
          <div className="space-y-2">
            {monthlyStack.map((c) => (
              <div key={c.code} className="flex justify-between">
                <div className="text-[12px] text-slate-600">
                  <span className="font-mono font-semibold text-forest">
                    {c.code}
                  </span>{' '}
                  {c.desc}
                </div>
                <div className="text-[12px] font-semibold text-slate-800">
                  {formatCurrencyExact(c.amount)}/mo
                </div>
              </div>
            ))}
            <div className="border-t border-slate-200 pt-2 mt-2 flex justify-between">
              <div className="text-[12px] font-semibold text-slate-700">
                Total monthly
              </div>
              <div className="text-[13px] font-bold text-forest">
                {formatCurrencyExact(monthlyPerPatient)}
              </div>
            </div>
          </div>
        </Card>

        <Card title="Transitional care" subtitle="Per qualifying discharge">
          <div className="space-y-2">
            {perDischarge.map((c) => (
              <div key={c.code} className="flex justify-between">
                <div className="text-[12px] text-slate-600">
                  <span className="font-mono font-semibold text-forest">
                    {c.code}
                  </span>{' '}
                  {c.desc}
                </div>
                <div className="text-[12px] font-semibold text-slate-800">
                  {formatCurrencyExact(c.amount)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-5 bg-forest text-white rounded-xl p-6">
        <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold mb-1">
          Bottom line
        </div>
        <div className="font-serif text-[24px] leading-tight mb-2">
          {formatCurrency(annualCohort)} in projected annual reimbursement
        </div>
        <p className="text-[13px] text-white/75 font-sans max-w-2xl">
          Across {HOSPITAL.activePatients} actively enrolled patients, the
          program generates roughly {formatCurrency(annualPerPatient)} per
          patient per year in recurring CMS codes — before counting TCM
          discharge billing or HRRP penalty avoidance.
        </p>
      </div>
    </div>
  );
}
