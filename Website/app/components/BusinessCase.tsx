import FadeSection from "./FadeSection";

const cmsItems = [
  { code: "99453", desc: "RPM device setup", amount: "$21.71", note: "one-time" },
  { code: "99454", desc: "Device supply monthly", amount: "$52.11", note: "per month" },
  { code: "99457", desc: "RPM management 20 min", amount: "$51.77", note: "per month" },
  { code: "99458", desc: "RPM management add-on", amount: "$41.42", note: "per month" },
  { code: "99490", desc: "CCM first 20 min", amount: "$66.13", note: "per month" },
  { code: "99496", desc: "TCM high complexity", amount: "$298", note: "per discharge" },
];

const roiRows = [
  { patients: "100 patients", fee: "$42\u201360K Avyay fee", revenue: "~$316K CMS revenue", roi: "5\u20137x ROI" },
  { patients: "500 patients", fee: "$210\u2013300K Avyay fee", revenue: "~$1.58M CMS revenue", roi: "5\u20136x ROI" },
];

export default function BusinessCase() {
  return (
    <FadeSection id="business-case" className="bg-[#053027]">
      <div className="text-center mb-16">
        <div className="inline-block bg-white/15 text-white/60 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
          Business Case
        </div>
        <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
          We don&apos;t cost hospitals money. We make them money.
        </h2>
        <p className="text-white/50 text-base max-w-xl mx-auto">
          CMS reimbursement codes unlocked by Avyay&apos;s RPM + CCM + TCM capabilities.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-5">CMS Reimbursement Stack</h3>
          <div className="space-y-2.5">
            {cmsItems.map((item) => (
              <div key={item.code} className="flex items-center justify-between bg-white/10 rounded-xl px-5 py-3">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-white/35 text-xs">{item.code}</span>
                  <span className="text-white/75 text-sm">{item.desc}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-white font-bold">{item.amount}</div>
                  <div className="text-white/35 text-[10px]">{item.note}</div>
                </div>
              </div>
            ))}
            <div className="flex items-center justify-between bg-white/20 border border-white/25 rounded-xl px-5 py-4">
              <span className="text-white font-semibold text-sm">Total per CHF patient / year</span>
              <span className="text-white font-bold text-xl">$3,164+</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-white/50 text-xs font-semibold uppercase tracking-widest mb-5">ROI Projection</h3>
          <div className="space-y-4 mb-6">
            {roiRows.map((row) => (
              <div key={row.patients} className="bg-white/10 rounded-2xl p-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-white font-semibold">{row.patients}</span>
                  <span className="bg-white/20 text-white text-sm font-bold px-3 py-1 rounded-full">{row.roi}</span>
                </div>
                <div className="text-white/45 text-sm mb-1">{row.fee}</div>
                <div className="text-white/80 text-sm font-medium">{row.revenue}</div>
              </div>
            ))}
          </div>
          <div className="bg-white/10 border border-white/15 rounded-2xl p-6">
            <h4 className="text-white font-semibold mb-3 text-sm">HRRP Penalty Context</h4>
            <p className="text-white/55 text-sm leading-relaxed">
              A 300-bed hospital with a 0.5% HRRP penalty on $200M Medicare revenue loses{" "}
              <strong className="text-white">$1M/year</strong>. Reducing readmissions by 20% can save{" "}
              <strong className="text-white">$500K in penalties alone</strong> — before counting CMS reimbursement revenue.
            </p>
          </div>
        </div>
      </div>
    </FadeSection>
  );
}
