import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Card from '../components/shared/Card';
import Stat from '../components/shared/Stat';
import { ENGAGEMENT_SERIES } from '../data/mockData';
import { useHospitalData } from '../hooks/useHospitalData';

const SDOH_LABELS: Record<string, string> = {
  transportation: 'Transportation',
  food_insecurity: 'Food insecurity',
  housing_instability: 'Housing instability',
  utility_difficulty: 'Utility difficulty',
  interpersonal_safety: 'Interpersonal safety',
};

function prettySdohLabel(key: string): string {
  return (
    SDOH_LABELS[key] ??
    key.replace(/_/g, ' ').replace(/\b\w/g, (ch) => ch.toUpperCase())
  );
}

function last(v: number[]) {
  return v[v.length - 1] ?? 0;
}

export default function Engagement() {
  const { conditions, sdohFlags, loading, isMock } = useHospitalData();

  if (loading) {
    return (
      <div className="px-8 py-7 max-w-[1280px]">
        <div className="text-slate-500 font-sans text-sm">Loading engagement data…</div>
      </div>
    );
  }

  const data = ENGAGEMENT_SERIES.map((p) => ({
    date: p.date,
    'Response rate': Math.round(p.responseRate * 100),
    Completion: Math.round(p.completion * 100),
  }));

  const responseAvg =
    Math.round(
      (ENGAGEMENT_SERIES.reduce((a, p) => a + p.responseRate, 0) /
        ENGAGEMENT_SERIES.length) *
        100,
    );
  const completionAvg =
    Math.round(
      (ENGAGEMENT_SERIES.reduce((a, p) => a + p.completion, 0) /
        ENGAGEMENT_SERIES.length) *
        100,
    );
  const latestResponse = Math.round(
    last(ENGAGEMENT_SERIES.map((p) => p.responseRate)) * 100,
  );
  const latestCompletion = Math.round(
    last(ENGAGEMENT_SERIES.map((p) => p.completion)) * 100,
  );

  const sdohEntries = Object.entries(sdohFlags);
  const sdohTotal = sdohEntries.reduce((a, [, v]) => a + v, 0);

  return (
    <div className="px-8 py-7 max-w-[1280px]">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[12px] uppercase tracking-wider text-slate-500 font-sans font-semibold">
            Insights
          </div>
          {isMock && (
            <span className="text-[10px] uppercase tracking-wider bg-warn/10 text-warn font-semibold px-1.5 py-0.5 rounded">
              Demo data
            </span>
          )}
        </div>
        <h1 className="font-serif text-[34px] text-forest leading-tight">
          Engagement & outcomes
        </h1>
        <p className="text-slate-600 font-sans text-[14px] mt-1">
          30-day rolling view of patient engagement, condition outcomes, and SDOH
          signals
        </p>
      </header>

      <div className="grid grid-cols-4 gap-4 mb-5">
        <Stat
          label="Response rate (today)"
          value={`${latestResponse}%`}
          tone="forest"
          sub={`30-day avg ${responseAvg}%`}
        />
        <Stat
          label="Completion (today)"
          value={`${latestCompletion}%`}
          tone="forest"
          sub={`30-day avg ${completionAvg}%`}
        />
        <Stat
          label="SDOH flags raised"
          value={sdohTotal}
          tone="warn"
          sub="Across 5 CMS domains"
        />
        <Stat
          label="Conditions tracked"
          value={conditions.length}
          sub={conditions.map((c) => c.condition).join(', ')}
        />
      </div>

      <Card
        title="Patient engagement — 30 days"
        subtitle="Daily response rate and check-in completion"
        className="mb-5"
      >
        <div className="h-[280px] -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id="respGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#053027" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#053027" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0D6B56" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#0D6B56" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                interval={3}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                domain={[40, 100]}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #E5E7EB',
                  fontSize: 12,
                  fontFamily: '"DM Sans", sans-serif',
                }}
                formatter={(v: number) => `${v}%`}
              />
              <Area
                type="monotone"
                dataKey="Response rate"
                stroke="#053027"
                strokeWidth={2}
                fill="url(#respGrad)"
              />
              <Area
                type="monotone"
                dataKey="Completion"
                stroke="#0D6B56"
                strokeWidth={2}
                fill="url(#compGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card
          title="Condition outcomes"
          subtitle="Readmission rate by condition cohort"
        >
          <div className="divide-y divide-slate-100">
            {conditions.map((c) => (
              <div key={c.condition} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-sans text-[14px] font-semibold text-slate-800">
                    {c.condition}
                  </div>
                  <div className="text-[13px] font-bold text-forest">
                    {(c.readmissionRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      c.readmissionRate >= 0.2
                        ? 'bg-danger'
                        : c.readmissionRate >= 0.17
                          ? 'bg-warn'
                          : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(c.readmissionRate * 100 * 4, 100).toFixed(0)}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {c.patients} patients enrolled
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="SDOH screening (CMS 5-domain)"
          subtitle="Flags raised across the cohort"
        >
          <div className="space-y-3">
            {sdohEntries.map(([key, count]) => {
              const pct = sdohTotal > 0 ? (count / sdohTotal) * 100 : 0;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[13px] font-sans text-slate-700">
                      {prettySdohLabel(key)}
                    </div>
                    <div className="text-[13px] font-bold text-forest">
                      {count}
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-forest-light"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
