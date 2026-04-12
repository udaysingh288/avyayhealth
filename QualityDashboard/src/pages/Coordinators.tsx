import Card from '../components/shared/Card';
import { useHospitalData } from '../hooks/useHospitalData';

function tone(value: number, good: number, warn: number) {
  if (value >= good) return 'text-success';
  if (value >= warn) return 'text-warn';
  return 'text-danger';
}

function responseTone(minutes: number) {
  if (minutes <= 15) return 'text-success';
  if (minutes <= 25) return 'text-warn';
  return 'text-danger';
}

export default function Coordinators() {
  const { coordinators, loading, isMock } = useHospitalData();

  if (loading) {
    return (
      <div className="px-8 py-7 max-w-[1280px]">
        <div className="text-slate-500 font-sans text-sm">Loading coordinators…</div>
      </div>
    );
  }

  return (
    <div className="px-8 py-7 max-w-[1280px]">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[12px] uppercase tracking-wider text-slate-500 font-sans font-semibold">
            Team
          </div>
          {isMock && (
            <span className="text-[10px] uppercase tracking-wider bg-warn/10 text-warn font-semibold px-1.5 py-0.5 rounded">
              Demo data
            </span>
          )}
        </div>
        <h1 className="font-serif text-[34px] text-forest leading-tight">
          Care Coordinators
        </h1>
        <p className="text-slate-600 font-sans text-[14px] mt-1">
          Performance across your post-discharge care team
        </p>
      </header>

      <Card title="All coordinators" subtitle="Live performance snapshot">
        <div className="overflow-x-auto -mx-5">
          <table className="w-full text-[13px] font-sans">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200">
                <th className="text-left px-5 py-3">Coordinator</th>
                <th className="text-right px-3 py-3">Patients</th>
                <th className="text-right px-3 py-3">Red</th>
                <th className="text-right px-3 py-3">Yellow</th>
                <th className="text-right px-3 py-3">Avg response</th>
                <th className="text-right px-3 py-3">Completion</th>
                <th className="text-right px-5 py-3">SLA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coordinators.map((c) => (
                <tr key={c.id} className="hover:bg-sunken/40">
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <div className="text-[11px] text-slate-500">{c.role}</div>
                  </td>
                  <td className="text-right px-3 py-4 font-semibold text-forest">
                    {c.activePatients}
                  </td>
                  <td className="text-right px-3 py-4">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold ${
                        c.redAlerts > 0
                          ? 'bg-danger/10 text-danger'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {c.redAlerts}
                    </span>
                  </td>
                  <td className="text-right px-3 py-4">
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-bold ${
                        c.yellowWatch > 0
                          ? 'bg-warn/10 text-warn'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {c.yellowWatch}
                    </span>
                  </td>
                  <td
                    className={`text-right px-3 py-4 font-semibold ${responseTone(
                      c.avgResponseMinutes,
                    )}`}
                  >
                    {c.avgResponseMinutes} min
                  </td>
                  <td
                    className={`text-right px-3 py-4 font-semibold ${tone(
                      c.completionRate,
                      0.85,
                      0.75,
                    )}`}
                  >
                    {Math.round(c.completionRate * 100)}%
                  </td>
                  <td
                    className={`text-right px-5 py-4 font-semibold ${tone(
                      c.slaCompliance,
                      0.9,
                      0.8,
                    )}`}
                  >
                    {Math.round(c.slaCompliance * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <Card title="Workload note">
          <p className="text-[13px] text-slate-600 font-sans leading-relaxed">
            Recommended target is 15–20 active patients per coordinator for
            post-discharge programs. Rebalance if any coordinator exceeds 22 to
            avoid SLA drift.
          </p>
        </Card>
        <Card title="Response SLA">
          <p className="text-[13px] text-slate-600 font-sans leading-relaxed">
            Red alert response SLA is under 2 hours. Coordinator average
            response time should trend under 20 minutes for acknowledgement.
          </p>
        </Card>
        <Card title="Completion target">
          <p className="text-[13px] text-slate-600 font-sans leading-relaxed">
            Check-in completion should stay above 80%. Below that we raise a
            team-level review and rebalance enrollment cadence.
          </p>
        </Card>
      </div>
    </div>
  );
}
