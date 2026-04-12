import FadeSection from "./FadeSection";

export default function PilotOffer() {
  return (
    <FadeSection id="pilot" className="bg-[#FFF8E7]">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-block bg-[#053027]/10 text-[#053027] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            Free Pilot
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-4">
            A free 90-day pilot. No budget. No IT lift.
          </h2>
          <p className="text-[#6B7280] text-base max-w-xl mx-auto">
            We handle everything. You provide one data feed and one champion.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h3 className="font-semibold text-[#1A1A1A] mb-6 text-sm uppercase tracking-wide">What we offer</h3>
            <ul className="space-y-3">
              {[
                "200 CHF or COPD patients enrolled",
                "One care unit, one coordinator",
                "ADT discharge feed only \u2014 no EHR write-back",
                "Full setup and onboarding handled by Avyay",
                "Complete outcomes report: readmission data, engagement metrics, SDOH flags",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-[#6B7280]">
                  <span className="text-[#053027] flex-shrink-0 mt-0.5">{"\u2713"}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-gray-100">
            <h3 className="font-semibold text-[#1A1A1A] mb-6 text-sm uppercase tracking-wide">What we need from you</h3>
            <ul className="space-y-3">
              {["ADT discharge data feed", "1 clinical champion", "30 minutes to onboard"].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-[#6B7280]">
                  <span className="text-[#053027] flex-shrink-0">{"\u2192"}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-[#053027]/5 border border-[#053027]/15 rounded-2xl p-10 text-center">
          <p className="text-[#1A1A1A] text-base font-semibold mb-2">
            If the pilot shows {"\u2265"}15% readmission reduction, we convert to a paid contract.
          </p>
          <p className="text-[#6B7280] text-sm mb-8">If not, we part as friends.</p>
          <a
            href="#contact"
            className="bg-[#053027] text-white px-10 py-4 rounded-xl font-semibold text-base hover:bg-[#0D6B56] transition-colors inline-block"
          >
            Book your discovery call {"\u2192"}
          </a>
        </div>
      </div>
    </FadeSection>
  );
}
