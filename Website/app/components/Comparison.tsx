import FadeSection from "./FadeSection";

export default function Comparison() {
  return (
    <FadeSection id="impact" className="bg-white">
      <div className="text-center mb-14">
        <div className="text-[#0D6B56] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
          Why We&apos;re Different
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] mb-4 text-balance">
          Built for hospitals that can&apos;t afford to wait
        </h2>
      </div>

      {/* Comparison row — minimal */}
      <div className="border border-gray-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-4 sm:grid-cols-5 text-center text-xs font-semibold uppercase tracking-wide text-[#6B7280] bg-[#F9F7F2] py-3">
          <div className="hidden sm:block px-3">Feature</div>
          <div className="px-2">
            <span className="bg-[#053027] text-white px-2 py-1 rounded-md text-[10px]">Avyay</span>
          </div>
          <div className="px-2">Manual</div>
          <div className="px-2">IVR</div>
          <div className="px-2">Digital</div>
        </div>
        {[
          { feature: "Engagement", avyay: "SMS + App", manual: "40\u201350%", ivr: "20\u201330%", digital: "App install" },
          { feature: "Languages", avyay: "EN + ES", manual: "Staff dep.", ivr: "EN only", digital: "Limited" },
          { feature: "SDOH", avyay: "Built in", manual: "Ad hoc", ivr: "None", digital: "Add-on" },
          { feature: "Go-live", avyay: "<24 hrs", manual: "Ongoing", ivr: "4\u20138 wks", digital: "6\u201312 wks" },
        ].map((row, i) => (
          <div key={row.feature} className={`grid grid-cols-4 sm:grid-cols-5 text-center text-sm py-3.5 ${i < 3 ? "border-b border-gray-50" : ""}`}>
            <div className="hidden sm:block px-3 text-left font-medium text-[#1A1A1A]">{row.feature}</div>
            <div className="px-2 text-[#053027] font-semibold">{row.avyay}</div>
            <div className="px-2 text-[#6B7280]">{row.manual}</div>
            <div className="px-2 text-[#6B7280]">{row.ivr}</div>
            <div className="px-2 text-[#6B7280]">{row.digital}</div>
          </div>
        ))}
      </div>
    </FadeSection>
  );
}
