export default function DashboardMockup() {
  const patients = [
    { name: "Maria T., 68F", condition: "Heart Failure", risk: "red", time: "2 hrs ago", reply: "Ankle swelling, more breathless", action: "Call now" },
    { name: "James W., 74M", condition: "COPD", risk: "yellow", time: "4 hrs ago", reply: "Coughing more than usual", action: "Follow up" },
    { name: "Sandra K., 61F", condition: "Heart Failure", risk: "green", time: "1 hr ago", reply: "Feeling good, went for a walk", action: "No action" },
    { name: "Michael W., 71M", condition: "COPD", risk: "yellow", time: "3 hrs ago", reply: "Dizzy after morning meds", action: "Follow up" },
    { name: "Jennifer L., 55F", condition: "Heart Failure", risk: "green", time: "5 hrs ago", reply: "Pain manageable, sleeping better", action: "No action" },
  ];

  const riskDot: Record<string, string> = { red: "bg-[#C0392B]", yellow: "bg-[#D97706]", green: "bg-[#053027]" };
  const riskLabel: Record<string, string> = { red: "RED", yellow: "YELLOW", green: "GREEN" };
  const riskText: Record<string, string> = { red: "text-[#C0392B]", yellow: "text-[#D97706]", green: "text-[#053027]" };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 transition-shadow duration-300 hover:shadow-2xl">
      {/* Header */}
      <div className="bg-[#053027] px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white text-sm font-semibold">
          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z"
                fill="white"
              />
            </svg>
          </div>
          Avyay Dashboard
        </div>
        <div className="hidden md:flex gap-5 text-white/50 text-xs">
          <span className="text-white border-b border-white pb-0.5">Patients</span>
          <span>Alerts</span>
          <span>Reports</span>
        </div>
      </div>

      {/* Metrics — scroll on mobile */}
      <div className="flex overflow-x-auto sm:grid sm:grid-cols-5 divide-x divide-gray-100 border-b border-gray-100">
        {[
          { label: "Active", value: "47", color: "text-[#1A1A1A]" },
          { label: "Red", value: "3", color: "text-[#C0392B]" },
          { label: "Yellow", value: "8", color: "text-[#D97706]" },
          { label: "Green", value: "36", color: "text-[#053027]" },
          { label: "Engagement", value: "84%", color: "text-[#0D6B56]" },
        ].map((m) => (
          <div key={m.label} className="flex-shrink-0 min-w-[80px] px-3 py-3 text-center">
            <div className={`text-lg sm:text-xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-[#6B7280] text-[9px] mt-0.5 leading-tight">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="bg-gray-50 text-[#6B7280] text-[10px] sm:text-xs uppercase tracking-wide">
              <th className="text-left px-3 sm:px-5 py-2.5 font-medium">Patient</th>
              <th className="text-left px-3 sm:px-4 py-2.5 font-medium">Condition</th>
              <th className="text-left px-3 sm:px-4 py-2.5 font-medium">Risk</th>
              <th className="text-left px-3 sm:px-4 py-2.5 font-medium hidden sm:table-cell">Last Reply</th>
              <th className="text-left px-3 sm:px-4 py-2.5 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {patients.map((p) => (
              <tr key={p.name} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-3 sm:px-5 py-3 font-medium text-[#1A1A1A] whitespace-nowrap text-xs sm:text-sm">{p.name}</td>
                <td className="px-3 sm:px-4 py-3 text-[#6B7280] whitespace-nowrap text-xs sm:text-sm">{p.condition}</td>
                <td className="px-3 sm:px-4 py-3">
                  <span className={`flex items-center gap-1.5 font-semibold text-xs ${riskText[p.risk]}`}>
                    <span className={`w-2 h-2 rounded-full ${riskDot[p.risk]}`} />
                    {riskLabel[p.risk]}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 text-[#1A1A1A] text-xs max-w-[160px] truncate hidden sm:table-cell">
                  &ldquo;{p.reply}&rdquo;
                </td>
                <td className="px-3 sm:px-4 py-3">
                  <span className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-3 py-1 rounded-full whitespace-nowrap ${
                    p.action === "Call now" ? "bg-[#C0392B]/10 text-[#C0392B]"
                    : p.action === "Follow up" ? "bg-[#D97706]/10 text-[#D97706]"
                    : "bg-[#053027]/10 text-[#053027]"
                  }`}>
                    {p.action}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
