import { ShieldAlert, TrendingDown, DollarSign } from 'lucide-react';
import Card from '../components/shared/Card';
import Stat from '../components/shared/Stat';
import { HOSPITAL, HRRP, CONDITIONS } from '../data/mockData';

function formatCurrency(n: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function Penalties() {
  const projectedSavings = HRRP.currentAnnualPenalty * HRRP.projectedReductionPct;
  const residualPenalty = HRRP.currentAnnualPenalty - projectedSavings;
  const savingsPct = HRRP.projectedReductionPct * 100;

  return (
    <div className="px-8 py-7 max-w-[1280px]">
      <header className="mb-6">
        <div className="text-[12px] uppercase tracking-wider text-slate-500 font-sans font-semibold mb-1">
          Compliance
        </div>
        <h1 className="font-serif text-[34px] text-forest leading-tight">
          HRRP Penalty Exposure
        </h1>
        <p className="text-slate-600 font-sans text-[14px] mt-1">
          Hospital Readmissions Reduction Program — current penalty and
          projected savings
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-5">
        <Stat
          label="Current penalty rate"
          value={`${(HRRP.currentPenaltyRate * 100).toFixed(2)}%`}
          tone="danger"
          sub="Of Medicare base payments"
          icon={<ShieldAlert size={17} />}
        />
        <Stat
          label="Annual penalty"
          value={formatCurrency(HRRP.currentAnnualPenalty)}
          tone="danger"
          sub={`${formatCurrency(HRRP.annualMedicareRevenue)} Medicare revenue`}
          icon={<DollarSign size={17} />}
        />
        <Stat
          label="Projected savings"
          value={formatCurrency(projectedSavings)}
          tone="success"
          sub={`${savingsPct}% readmission reduction`}
          icon={<TrendingDown size={17} />}
        />
      </div>

      <Card
        title="Penalty impact model"
        subtitle="Before vs. after a 20% readmission reduction"
        className="mb-5"
      >
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[13px] font-sans text-slate-700 font-semibold">
                Current annual penalty
              </div>
              <div className="text-[14px] font-bold text-danger">
                {formatCurrency(HRRP.currentAnnualPenalty)}
              </div>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-danger" style={{ width: '100%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[13px] font-sans text-slate-700 font-semibold">
                With Avyay — residual penalty
              </div>
              <div className="text-[14px] font-bold text-warn">
                {formatCurrency(residualPenalty)}
              </div>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-warn"
                style={{ width: `${100 - savingsPct}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[13px] font-sans text-slate-700 font-semibold">
                Projected annual savings
              </div>
              <div className="text-[14px] font-bold text-success">
                {formatCurrency(projectedSavings)}
              </div>
            </div>
            <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${savingsPct}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card title="How the penalty is calculated">
          <div className="space-y-3 text-[13px] font-sans text-slate-600 leading-relaxed">
            <p>
              HRRP penalizes hospitals up to <strong>3%</strong> of base
              Medicare payments for excess 30-day readmissions across 6
              conditions — including AMI, CHF, COPD, and pneumonia.
            </p>
            <p>
              {HOSPITAL.name} is currently at{' '}
              <strong className="text-danger">
                {(HRRP.currentPenaltyRate * 100).toFixed(2)}%
              </strong>{' '}
              of{' '}
              <strong>{formatCurrency(HRRP.annualMedicareRevenue)}</strong> in
              annual Medicare base payments —{' '}
              <strong className="text-danger">
                {formatCurrency(HRRP.currentAnnualPenalty)}
              </strong>{' '}
              in avoidable penalty each year.
            </p>
            <p>
              A sustained 20% reduction in condition-specific readmissions
              typically drops the excess readmission ratio below the national
              median — recovering roughly{' '}
              <strong className="text-success">
                {formatCurrency(projectedSavings)}
              </strong>{' '}
              annually.
            </p>
          </div>
        </Card>

        <Card title="Tracked condition cohorts" subtitle="HRRP-qualifying diagnoses">
          <div className="divide-y divide-slate-100">
            {CONDITIONS.map((c) => (
              <div
                key={c.condition}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <div className="font-sans text-[14px] font-semibold text-slate-800">
                    {c.condition}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {c.patients} enrolled
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-[13px] font-bold ${
                      c.readmissionRate >= 0.2
                        ? 'text-danger'
                        : c.readmissionRate >= 0.17
                          ? 'text-warn'
                          : 'text-success'
                    }`}
                  >
                    {(c.readmissionRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-[10px] text-slate-500">
                    30-day readmission
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
