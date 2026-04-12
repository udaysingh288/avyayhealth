import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import TopBar from '../components/layout/TopBar';
import { ENGAGEMENT_TREND } from '../utils/mockData';
import { conditionLabel } from '../utils/riskUtils';
import { useDashboardData } from '../hooks/useDashboardData';

export default function Reports() {
  const { patients, metrics } = useDashboardData();

  const riskData = [
    { name: 'Red', value: metrics.red_count, color: '#DC2626' },
    { name: 'Yellow', value: metrics.yellow_count, color: '#D97706' },
    { name: 'Green', value: metrics.green_count, color: '#16A34A' },
    { name: 'Not started', value: metrics.not_started_count, color: '#94A3B8' },
  ];

  const conditionData = Object.entries(
    patients.reduce<Record<string, number>>((acc, p) => {
      acc[p.condition] = (acc[p.condition] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([condition, count]) => ({ condition: conditionLabel(condition as never), count }));

  // Build SDOH counts from live patients
  const sdohCounts: Record<string, number> = {};
  patients.forEach((p) => {
    p.sdoh_flags.forEach((f) => {
      const label = f.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      sdohCounts[label] = (sdohCounts[label] ?? 0) + 1;
    });
  });
  const sdohData = Object.entries(sdohCounts).map(([domain, count]) => ({ domain, count }));

  const avgCompletion = Math.round(metrics.checkin_completion_rate * 100);

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Reports" />
      <div className="flex-1 p-6 overflow-auto">
        <div className="grid grid-cols-3 gap-5 mb-5">
          {[
            { label: 'Active patients', value: String(metrics.total_active_patients), sub: `${metrics.red_count} red, ${metrics.yellow_count} yellow`, color: 'text-forest' },
            { label: 'Avg check-in completion', value: `${avgCompletion}%`, sub: 'Across all active patients', color: 'text-forest' },
            { label: 'SDOH flags active', value: String(metrics.sdoh_flags_today), sub: 'Across all patients', color: 'text-amber-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg border border-slate-200 p-5">
              <div className={`text-2xl font-bold font-sans ${s.color}`}>{s.value}</div>
              <div className="text-sm font-medium text-slate-700 font-sans mt-1">{s.label}</div>
              <div className="text-xs text-slate-400 font-sans mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 font-sans mb-4">Daily Engagement — Last 10 Days</h3>
            <div className="h-48" role="img" aria-label="Bar chart of daily engagement rates">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ENGAGEMENT_TREND} margin={{ left: -20 }}>
                  <XAxis dataKey="day" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#94A3B8' }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'DM Sans', borderRadius: 6, border: '1px solid #E2E8F0' }} formatter={(v: number) => [`${v}%`, 'Response rate']} />
                  <Bar dataKey="rate" fill="#053027" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 font-sans mb-4">Risk Distribution</h3>
            <div className="flex items-center gap-5">
              <div className="h-48 w-48" role="img" aria-label="Pie chart of patient risk levels">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                      {riskData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'DM Sans', borderRadius: 6 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2.5">
                {riskData.map((r) => (
                  <div key={r.name} className="flex items-center gap-2 text-sm font-sans">
                    <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: r.color }} aria-hidden="true" />
                    <span className="text-slate-600">{r.name}</span>
                    <span className="font-semibold text-slate-800 ml-auto">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 font-sans mb-4">Patients by Condition</h3>
            <div className="h-40" role="img" aria-label="Bar chart of patients by condition">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conditionData} layout="vertical" margin={{ left: 60, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="condition" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'DM Sans', borderRadius: 6, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="count" fill="#053027" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-700 font-sans mb-4">SDOH Flags by Domain</h3>
            <div className="h-40" role="img" aria-label="Bar chart of SDOH flags by domain">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sdohData} layout="vertical" margin={{ left: 80, right: 20 }}>
                  <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#94A3B8' }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="domain" tick={{ fontSize: 11, fontFamily: 'DM Sans', fill: '#64748B' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 12, fontFamily: 'DM Sans', borderRadius: 6, border: '1px solid #E2E8F0' }} />
                  <Bar dataKey="count" fill="#D97706" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
