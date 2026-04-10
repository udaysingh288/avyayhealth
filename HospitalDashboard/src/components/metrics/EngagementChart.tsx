import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ENGAGEMENT_TREND } from '../../utils/mockData';

export default function EngagementChart() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-700 font-sans">Daily Engagement Rate</h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">% of patients who replied to check-in</p>
        </div>
        <span className="text-lg font-bold text-forest font-sans">78%</span>
      </div>
      <div className="h-32" role="img" aria-label="Daily engagement rate chart showing 10-day trend">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={ENGAGEMENT_TREND} margin={{ top: 4, right: 4, left: -32, bottom: 0 }}>
            <defs>
              <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#27500A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#27500A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Sans' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[50, 100]}
              tick={{ fontSize: 10, fill: '#94A3B8', fontFamily: 'DM Sans' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #E2E8F0',
                borderRadius: 6,
                fontSize: 12,
                fontFamily: 'DM Sans',
              }}
              formatter={(v: number) => [`${v}%`, 'Response rate']}
            />
            <Area
              type="monotone"
              dataKey="rate"
              stroke="#27500A"
              strokeWidth={2}
              fill="url(#engGrad)"
              dot={false}
              activeDot={{ r: 4, fill: '#27500A' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
