"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

// ─── Fade-in hook ─────────────────────────────────────────────────────────────
function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div className="bg-[#085041] rounded-xl px-3 py-2 flex items-center gap-3">
      <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
        <path
          d="M14 30C14 30 1 19.5 1 11C1 5.477 6.925 1 14 1C21.075 1 27 5.477 27 11C27 19.5 14 30 14 30Z"
          fill="white"
        />
        <rect x="11" y="6" width="2.5" height="8" rx="1" fill="#085041" />
        <rect x="8" y="9" width="8" height="2.5" rx="1" fill="#085041" />
      </svg>
      <div className="border-l border-white/30 pl-3">
        <div className="text-white text-lg font-bold tracking-tight leading-none">
          Avyay Health
        </div>
        <div className="text-white/60 text-[8px] tracking-[0.18em] uppercase mt-1">
          The Care That Follows You Home
        </div>
      </div>
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Problem", href: "#problem" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Why Us", href: "#why-us" },
    { label: "Business Case", href: "#business-case" },
    { label: "Team", href: "#team" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#085041] shadow-lg" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className={`transition-colors ${
                scrolled
                  ? "text-white/80 hover:text-white"
                  : "text-[#1A1A1A]/70 hover:text-[#1A1A1A]"
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="bg-white text-[#085041] px-4 py-2 rounded-lg font-semibold hover:bg-[#FFF8E7] transition-colors text-sm"
          >
            Book a Call
          </a>
        </div>
        <button
          className={`md:hidden ${scrolled ? "text-white" : "text-[#1A1A1A]"}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
            {menuOpen ? (
              <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-[#085041] px-6 pb-6 flex flex-col gap-4">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="text-white/80 hover:text-white text-sm font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className="bg-white text-[#085041] px-4 py-2 rounded-lg font-semibold text-sm text-center"
            onClick={() => setMenuOpen(false)}
          >
            Book a Call
          </a>
        </div>
      )}
    </nav>
  );
}

// ─── SMS Mockup ───────────────────────────────────────────────────────────────
function SMSMockup() {
  return (
    <div className="relative mx-auto w-72">
      <div className="bg-gray-900 rounded-[2.5rem] p-3 shadow-2xl ring-1 ring-white/10">
        <div className="bg-black rounded-[2rem] overflow-hidden">
          {/* Status bar */}
          <div className="bg-gray-900 px-5 py-2 flex justify-between items-center">
            <span className="text-white text-xs font-medium">9:31</span>
            <div className="flex gap-1.5 items-center">
              <div className="flex gap-0.5 items-end">
                {[3, 5, 7, 9].map((h, i) => (
                  <div key={i} className={`w-1 rounded-sm ${i < 3 ? "bg-white" : "bg-white/30"}`} style={{ height: h }} />
                ))}
              </div>
              <div className="w-4 h-3 rounded-sm border border-white flex items-center px-0.5">
                <div className="w-2 h-1.5 bg-white rounded-sm"></div>
              </div>
            </div>
          </div>
          {/* Chat header */}
          <div className="bg-gray-900 px-4 py-3 flex items-center gap-3 border-b border-gray-800">
            <div className="w-9 h-9 rounded-full bg-[#085041] flex items-center justify-center flex-shrink-0">
              <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                <path d="M8 16C8 16 1 11 1 6C1 3.24 4.134 1 8 1C11.866 1 15 3.24 15 6C15 11 8 16 8 16Z" fill="white" />
                <rect x="6.5" y="3.5" width="2" height="5" rx="0.8" fill="#085041" />
                <rect x="4" y="5.5" width="7" height="2" rx="0.8" fill="#085041" />
              </svg>
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Avyay Health</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                <span className="text-green-400 text-xs">Active</span>
              </div>
            </div>
          </div>
          {/* Messages */}
          <div className="bg-gray-950 px-3 py-4 space-y-3 min-h-[300px]">
            <div className="flex justify-start">
              <div className="bg-gray-800 text-white text-[11px] rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[82%] font-mono leading-relaxed">
                Hi Maria, it&apos;s day 3 after your discharge. How are you feeling today? Any pain, shortness of breath, or swelling?
                <div className="text-gray-500 text-[9px] mt-1">9:31 AM</div>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-blue-600 text-white text-[11px] rounded-2xl rounded-tr-sm px-3 py-2.5 max-w-[75%] font-mono leading-relaxed">
                My ankle is a bit swollen and I feel tired.
                <div className="text-blue-200 text-[9px] mt-1">9:31 AM</div>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="bg-gray-800 text-white text-[11px] rounded-2xl rounded-tl-sm px-3 py-2.5 max-w-[82%] font-mono leading-relaxed">
                Thanks for letting me know. That level of swelling is worth checking. I&apos;ll flag this for your care team now.
                <div className="text-gray-500 text-[9px] mt-1">9:31 AM</div>
              </div>
            </div>
            <div className="flex justify-center pt-1">
              <div className="bg-[#D97706]/20 border border-[#D97706]/40 text-[#D97706] text-[10px] font-semibold px-3 py-1.5 rounded-full font-mono">
                ● Flagged as Yellow — Care team notified
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  const patients = [
    { name: "Maria T., 68F", condition: "Heart Failure", risk: "red", time: "2 hrs ago", reply: "Ankle swelling, more breathless going upstairs", action: "Call now" },
    { name: "James W., 74M", condition: "COPD", risk: "yellow", time: "4 hrs ago", reply: "Coughing more than usual, no fever", action: "Follow up today" },
    { name: "Sandra K., 61F", condition: "Heart Failure", risk: "green", time: "1 hr ago", reply: "Feeling good, went for a short walk today", action: "No action" },
    { name: "Michael W., 71M", condition: "Diabetes", risk: "yellow", time: "3 hrs ago", reply: "Feeling a bit dizzy after morning meds", action: "Follow up today" },
    { name: "Jennifer L., 55F", condition: "Chronic Pain", risk: "green", time: "5 hrs ago", reply: "Pain is manageable, sleeping better", action: "No action" },
  ];

  const riskDot: Record<string, string> = { red: "bg-[#C0392B]", yellow: "bg-[#D97706]", green: "bg-[#085041]" };
  const riskLabel: Record<string, string> = { red: "RED", yellow: "YELLOW", green: "GREEN" };
  const riskText: Record<string, string> = { red: "text-[#C0392B]", yellow: "text-[#D97706]", green: "text-[#085041]" };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-[#085041] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white text-sm font-semibold">
          <div className="w-6 h-6 rounded-md bg-white/20 flex items-center justify-center">
            <svg width="12" height="14" viewBox="0 0 12 14" fill="white">
              <path d="M6 12C6 12 1 8 1 4.5C1 2.5 3.2 1 6 1C8.8 1 11 2.5 11 4.5C11 8 6 12 6 12Z" />
            </svg>
          </div>
          Patient Risk
        </div>
        <div className="hidden md:flex gap-6 text-white/50 text-xs">
          <span className="text-white border-b border-white pb-0.5">Patient Risk</span>
          <span>Messaging</span>
          <span>Calendar</span>
          <span>Reports</span>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-5 divide-x divide-gray-100 border-b border-gray-100">
        {[
          { label: "Active Patients", value: "47", color: "text-[#1A1A1A]" },
          { label: "Red Alerts", value: "3", color: "text-[#C0392B]" },
          { label: "Yellow — Watch", value: "8", color: "text-[#D97706]" },
          { label: "Green — Stable", value: "36", color: "text-[#085041]" },
          { label: "Engagement Rate", value: "84%", color: "text-[#0D6B56]" },
        ].map((m) => (
          <div key={m.label} className="px-3 py-3 text-center">
            <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-[#6B7280] text-[9px] mt-0.5 leading-tight">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-[#6B7280] text-xs uppercase tracking-wide">
              <th className="text-left px-5 py-3 font-medium">Patient</th>
              <th className="text-left px-4 py-3 font-medium">Condition</th>
              <th className="text-left px-4 py-3 font-medium">Risk</th>
              <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Last Check-in</th>
              <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Last Reply</th>
              <th className="text-left px-4 py-3 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {patients.map((p) => (
              <tr key={p.name} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3.5 font-medium text-[#1A1A1A] whitespace-nowrap text-sm">{p.name}</td>
                <td className="px-4 py-3.5 text-[#6B7280] whitespace-nowrap text-sm">{p.condition}</td>
                <td className="px-4 py-3.5">
                  <span className={`flex items-center gap-1.5 font-semibold text-xs ${riskText[p.risk]}`}>
                    <span className={`w-2 h-2 rounded-full ${riskDot[p.risk]}`}></span>
                    {riskLabel[p.risk]}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-[#6B7280] text-xs hidden md:table-cell whitespace-nowrap">{p.time}</td>
                <td className="px-4 py-3.5 text-[#1A1A1A] text-xs max-w-[180px] truncate hidden lg:table-cell">
                  &ldquo;{p.reply}&rdquo;
                </td>
                <td className="px-4 py-3.5">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                    p.action === "Call now" ? "bg-[#C0392B]/10 text-[#C0392B]"
                    : p.action === "Follow up today" ? "bg-[#D97706]/10 text-[#D97706]"
                    : "bg-[#085041]/10 text-[#085041]"
                  }`}>
                    {p.action}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom metrics */}
      <div className="border-t border-gray-100 grid grid-cols-3 divide-x divide-gray-100">
        {[
          { label: "Daily Response Rate", value: "84%", sub: "of all patients responded today" },
          { label: "Check-in Completion", value: "91%", sub: "of all scheduled check-ins completed" },
          { label: "SDOH Flags Raised", value: "12", sub: "flags raised today" },
        ].map((m) => (
          <div key={m.label} className="px-5 py-4 text-center">
            <div className="text-2xl font-bold text-[#1A1A1A]">{m.value}</div>
            <div className="text-[#6B7280] text-[10px] mt-1 leading-tight">{m.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Fade Section ─────────────────────────────────────────────────────────────
function FadeSection({ id, children, className = "" }: { id?: string; children: React.ReactNode; className?: string }) {
  const ref = useFadeIn();
  return (
    <section id={id} className={`py-24 px-6 ${className}`}>
      <div ref={ref} className="fade-in max-w-6xl mx-auto">
        {children}
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <Nav />

      {/* 1 — Hero */}
      <section className="min-h-screen flex items-center pt-20 px-6 bg-[#FFF8E7]">
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center py-20">
          <div>
            <div className="inline-block bg-[#085041]/10 text-[#085041] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
              Free 90-Day Pilot — No Budget Required
            </div>
            <h1 className="font-serif text-5xl md:text-6xl lg:text-[4.5rem] text-[#1A1A1A] leading-[1.1] mb-6">
              The care that follows you home
            </h1>
            <p className="text-[#6B7280] text-lg leading-relaxed mb-10 max-w-xl">
              Avyay Health contacts every discharged patient daily for 30 days — by SMS or app — and alerts your care team before deterioration becomes a readmission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#contact" className="bg-[#085041] text-white px-8 py-4 rounded-xl font-semibold text-base hover:bg-[#0D6B56] transition-colors text-center">
                Book a free 20-minute call →
              </a>
              <a href="#how-it-works" className="border border-[#1A1A1A]/20 text-[#1A1A1A] px-8 py-4 rounded-xl font-semibold text-base hover:border-[#085041] hover:text-[#085041] transition-colors text-center">
                See how it works ↓
              </a>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-4 text-sm">
              {[
                { title: "No hardware.", sub: "Works on any phone." },
                { title: "ADT feed only.", sub: "No EHR write-back." },
                { title: "Live in <1 week.", sub: "No IT lift required." },
              ].map((item) => (
                <div key={item.title}>
                  <div className="font-bold text-[#1A1A1A]">{item.title}</div>
                  <div className="text-[#6B7280]">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-center md:justify-end">
            <SMSMockup />
          </div>
        </div>
      </section>

      {/* 2 — Problem */}
      <FadeSection id="problem" className="bg-[#1A1A1A]">
        <div className="text-center mb-16">
          <div className="inline-block bg-white/10 text-white/50 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            The Post-Discharge Gap
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
            Your patients leave. Most systems lose them.
          </h2>
          <p className="text-white/40 text-sm">From 52 hospital professionals surveyed — March 2026</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {[
            { stat: "8 in 10", desc: "hospital staff rank reducing 30-day readmissions as a top priority" },
            { stat: "46%", desc: "say their #1 challenge is not being able to reach patients after discharge" },
            { stat: "46%", desc: "still rely on nurses making manual follow-up calls — adding to burnout" },
            { stat: "37%", desc: "cite patient comprehension failure as a core breakdown point" },
          ].map((item) => (
            <div key={item.stat} className="bg-white/5 border border-white/8 rounded-2xl p-7">
              <div className="font-serif text-4xl text-white mb-3">{item.stat}</div>
              <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <blockquote className="border-l-4 border-[#0D6B56] pl-6 mb-16 max-w-2xl">
          <p className="text-white/75 text-lg italic leading-relaxed mb-3">
            &ldquo;Many patients don&apos;t answer the phone. Often their contact info in the EMR is not accurate. Without a verified number, we simply cannot follow up.&rdquo;
          </p>
          <footer className="text-white/35 text-sm">— Discharge Nurse, Survey Respondent, March 2026</footer>
        </blockquote>

        <div className="grid md:grid-cols-3 gap-5">
          {[
            { value: "$15,000", desc: "Average cost per preventable hospital readmission, directly hitting operating margins" },
            { value: "2,400+", desc: "Hospitals penalized under HRRP in FY2026. Penalties reach up to 3% of Medicare base payments" },
            { value: "~20%", desc: "Medicare patients readmitted within 30 days. A 300-bed hospital faces $2M+ in annual HRRP penalty exposure" },
          ].map((item) => (
            <div key={item.value} className="bg-white/5 border border-white/8 rounded-2xl p-7">
              <div className="w-full h-1 rounded-full bg-[#0D6B56]/40 mb-5"></div>
              <div className="font-serif text-5xl text-white mb-3">{item.value}</div>
              <p className="text-white/45 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </FadeSection>

      {/* 3 — How It Works */}
      <FadeSection id="how-it-works" className="bg-[#FFF8E7]">
        <div className="text-center mb-16">
          <div className="inline-block bg-[#085041]/10 text-[#085041] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            How It Works
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A]">
            From discharge to 30 days — automated
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              num: "01", title: "Enrollment",
              body: "Nurse enrolls patient at discharge. Welcome SMS arrives within 24 hours. No hardware. No app download required. Works on any phone.",
              highlight: false,
            },
            {
              num: "02", title: "Daily Check-ins",
              body: "Days 1–7. AI asks about symptoms, medications, and recovery. Reads free-text replies — not just button taps. \"Feeling more winded going upstairs\" triggers escalation, not a log entry.",
              highlight: false,
            },
            {
              num: "03", title: "Tapering Care",
              body: "Days 8–30. Check-ins taper as patient stabilizes. Social determinants screened using the CMS 5-domain framework and referred to community resources.",
              highlight: false,
            },
            {
              num: "04", title: "Red Alerts",
              body: "Anytime. Flagged symptoms trigger an instant coordinator ping with patient summary. Response SLA: under 2 hours.",
              highlight: true,
            },
          ].map((step) => (
            <div key={step.num} className={`rounded-2xl p-8 ${step.highlight ? "bg-[#085041] text-white" : "bg-white border border-gray-100"}`}>
              <div className={`font-serif text-5xl mb-4 ${step.highlight ? "text-white/25" : "text-[#085041]/15"}`}>{step.num}</div>
              <h3 className={`font-serif text-2xl mb-4 ${step.highlight ? "text-white" : "text-[#1A1A1A]"}`}>{step.title}</h3>
              <p className={`text-sm leading-relaxed ${step.highlight ? "text-white/65" : "text-[#6B7280]"}`}>{step.body}</p>
            </div>
          ))}
        </div>
      </FadeSection>

      {/* 4 — Dashboard */}
      <FadeSection id="dashboard" className="bg-white">
        <div className="text-center mb-12">
          <div className="inline-block bg-[#085041]/10 text-[#085041] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            One Dashboard, Every Patient
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-4">
            Your care coordinators see everything. In real time.
          </h2>
          <p className="text-[#6B7280] text-base max-w-xl mx-auto">
            Browser-based. No new software to install. No training required. Your team is live in under a week.
          </p>
        </div>
        <DashboardMockup />
      </FadeSection>

      {/* 5 — Why We're Different */}
      <FadeSection id="why-us" className="bg-[#FFF8E7]">
        <div className="text-center mb-12">
          <div className="inline-block bg-[#085041]/10 text-[#085041] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            Why We&apos;re Different
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-4">
            Built for hospitals that can&apos;t afford to wait
          </h2>
          <p className="text-[#6B7280] text-base max-w-2xl mx-auto">
            Avyay outperforms legacy and digital alternatives on the metrics that matter most: patient engagement, channel flexibility, and care coordinator efficiency.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl shadow-sm border border-gray-100 bg-white">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-4 font-medium text-[#6B7280] text-xs uppercase tracking-wide w-36">Feature</th>
                <th className="px-6 py-4 text-center">
                  <span className="bg-[#085041] text-white text-xs font-bold px-3 py-1.5 rounded-lg inline-block">Avyay Health</span>
                </th>
                <th className="text-center px-6 py-4 font-medium text-[#6B7280] text-xs uppercase tracking-wide">Manual Calls</th>
                <th className="text-center px-6 py-4 font-medium text-[#6B7280] text-xs uppercase tracking-wide">IVR / Portals</th>
                <th className="text-center px-6 py-4 font-medium text-[#6B7280] text-xs uppercase tracking-wide">Digital Health Tools</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                {
                  feature: "Engagement",
                  avyay: "App + SMS — meets every patient where they are",
                  manual: "40–50% reach rate, high staff cost",
                  ivr: "20–30% open rate, low completion",
                  digital: "30–50% depending on app download",
                },
                {
                  feature: "Language Access",
                  avyay: "English + Spanish at launch",
                  manual: "Requires bilingual staff",
                  ivr: "English-only or basic",
                  digital: "Limited translation layers",
                },
                {
                  feature: "SDOH Screening",
                  avyay: "CMS 5-domain built in to every check-in",
                  manual: "Ad hoc, inconsistent",
                  ivr: "Not supported",
                  digital: "Optional add-on module",
                },
                {
                  feature: "Implementation",
                  avyay: "<24hr enrollment via ADT feed — zero-friction",
                  manual: "Ongoing continuous staffing need",
                  ivr: "4–8 weeks IT integration",
                  digital: "6–12 weeks app rollout + training",
                },
              ].map((row) => (
                <tr key={row.feature} className="hover:bg-gray-50/50">
                  <td className="px-6 py-5 font-medium text-[#1A1A1A] text-sm">{row.feature}</td>
                  <td className="px-6 py-5 text-center">
                    <span className="text-[#085041] font-semibold text-sm">{row.avyay}</span>
                  </td>
                  <td className="px-6 py-5 text-center text-[#6B7280] text-sm">{row.manual}</td>
                  <td className="px-6 py-5 text-center text-[#6B7280] text-sm">{row.ivr}</td>
                  <td className="px-6 py-5 text-center text-[#6B7280] text-sm">{row.digital}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeSection>

      {/* 6 — Business Case */}
      <FadeSection id="business-case" className="bg-[#085041]">
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
              {[
                { code: "99453", desc: "RPM device setup", amount: "$21.71", note: "one-time" },
                { code: "99454", desc: "Device supply monthly", amount: "$52.11", note: "per month" },
                { code: "99457", desc: "RPM management 20 min", amount: "$51.77", note: "per month" },
                { code: "99458", desc: "RPM management add-on", amount: "$41.42", note: "per month" },
                { code: "99490", desc: "CCM first 20 min", amount: "$66.13", note: "per month" },
                { code: "99496", desc: "TCM high complexity", amount: "$298", note: "per discharge" },
              ].map((item) => (
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
              {[
                { patients: "100 patients", fee: "$42–60K Avyay fee", revenue: "~$316K CMS revenue", roi: "5–7x ROI" },
                { patients: "500 patients", fee: "$210–300K Avyay fee", revenue: "~$1.58M CMS revenue", roi: "5–6x ROI" },
              ].map((row) => (
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

      {/* 7 — Free Pilot */}
      <FadeSection id="pilot" className="bg-[#FFF8E7]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-[#085041]/10 text-[#085041] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
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
                  "ADT discharge feed only — no EHR write-back",
                  "Full setup and onboarding handled by Avyay",
                  "Complete outcomes report: readmission data, engagement metrics, SDOH flags",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-[#6B7280]">
                    <span className="text-[#085041] flex-shrink-0 mt-0.5">✓</span>
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
                    <span className="text-[#085041] flex-shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#085041]/5 border border-[#085041]/15 rounded-2xl p-10 text-center">
            <p className="text-[#1A1A1A] text-base font-semibold mb-2">
              If the pilot shows ≥15% readmission reduction, we convert to a paid contract.
            </p>
            <p className="text-[#6B7280] text-sm mb-8">If not, we part as friends.</p>
            <a
              href="#contact"
              className="bg-[#085041] text-white px-10 py-4 rounded-xl font-semibold text-base hover:bg-[#0D6B56] transition-colors inline-block"
            >
              Book your discovery call →
            </a>
          </div>
        </div>
      </FadeSection>

      {/* 8 — Founders */}
      <FadeSection id="team" className="bg-white">
        <div className="text-center mb-16">
          <div className="inline-block bg-[#085041]/10 text-[#085041] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
            The Team
          </div>
          <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A]">
            Built by people who have been inside your hospital
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Diksha */}
          <div className="bg-[#FFF8E7] rounded-2xl p-8 border border-gray-100">
            <div className="flex items-start gap-5 mb-6">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-[#085041]/10">
                <Image src="/diksha.jpg" alt="Diksha Deshmukh" fill className="object-cover object-top" />
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A] text-base">Diksha Deshmukh</div>
                <div className="text-[#6B7280] text-xs mt-1 leading-relaxed">CEO & Co-Founder — Clinical Research & Healthcare Expert, MPH</div>
                <a
                  href="https://www.linkedin.com/in/dikshadeshmukh16/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-[#085041] hover:text-[#0D6B56] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-xs font-medium">LinkedIn</span>
                </a>
              </div>
            </div>
            <blockquote className="text-[#1A1A1A] text-sm leading-relaxed italic">
              &ldquo;I spent 3 years inside hospital systems studying post-discharge care failure firsthand — not from the outside. I&apos;ve personally spoken with 52 hospital professionals to validate every assumption before writing a line of code. That&apos;s not research. That&apos;s obsession.&rdquo;
            </blockquote>
          </div>

          {/* Kunwar */}
          <div className="bg-[#FFF8E7] rounded-2xl p-8 border border-gray-100">
            <div className="flex items-start gap-5 mb-6">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-[#085041]/10">
                <Image src="/kunwar.jpg" alt="Kunwar Uday Singh" fill className="object-cover object-top" />
              </div>
              <div>
                <div className="font-semibold text-[#1A1A1A] text-base">Kunwar Uday Singh</div>
                <div className="text-[#6B7280] text-xs mt-1 leading-relaxed">Co-Founder — Data, AI/ML & Product Engineering</div>
                <a
                  href="https://www.linkedin.com/in/kunwaruday/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-2 text-[#085041] hover:text-[#0D6B56] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-xs font-medium">LinkedIn</span>
                </a>
              </div>
            </div>
            <blockquote className="text-[#1A1A1A] text-sm leading-relaxed italic">
              &ldquo;I build the AI infrastructure that makes Avyay work — the LLM classification engine, the SMS infrastructure, the real-time risk scoring system. Healthcare data is my domain.&rdquo;
            </blockquote>
          </div>
        </div>
      </FadeSection>

      {/* 9 — Contact */}
      <FadeSection id="contact" className="bg-[#FFF8E7]">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block bg-[#085041]/10 text-[#085041] text-xs font-semibold px-3 py-1.5 rounded-full mb-4 tracking-wide uppercase">
              Get in Touch
            </div>
            <h2 className="font-serif text-4xl md:text-5xl text-[#1A1A1A] mb-4">
              Let&apos;s talk — 20 minutes is all we need
            </h2>
            <p className="text-[#6B7280] text-base">
              Walk us through your current post-discharge workflow. We&apos;ll show you how Avyay fits in. No pitch — just questions.
            </p>
          </div>

          <form
            action="https://formspree.io/f/YOUR_FORM_ID"
            method="POST"
            className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-5"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-2 uppercase tracking-wide">Name</label>
                <input type="text" name="name" required placeholder="Dr. Jane Smith"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#085041] transition-colors bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-2 uppercase tracking-wide">Hospital Name</label>
                <input type="text" name="hospital" required placeholder="St. Mary's Medical Center"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#085041] transition-colors bg-white" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-2 uppercase tracking-wide">Role / Title</label>
                <input type="text" name="role" required placeholder="VP of Quality"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#085041] transition-colors bg-white" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#1A1A1A] mb-2 uppercase tracking-wide">Email</label>
                <input type="email" name="email" required placeholder="jane@hospital.org"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#085041] transition-colors bg-white" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-2 uppercase tracking-wide">Preferred Time to Talk</label>
              <input type="text" name="preferred_time" placeholder="Weekday mornings, any day this week"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] focus:outline-none focus:border-[#085041] transition-colors bg-white" />
            </div>
            <button type="submit"
              className="w-full bg-[#085041] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#0D6B56] transition-colors">
              Book a discovery call →
            </button>
            <p className="text-center text-[#6B7280] text-xs">
              Or email directly:{" "}
              <a href="mailto:diksha@avyayhealth.com" className="text-[#085041] hover:underline">
                diksha@avyayhealth.com
              </a>
            </p>
          </form>
        </div>
      </FadeSection>

      {/* 10 — Footer */}
      <footer className="bg-[#1A1A1A] text-white px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
            <div>
              <Logo />
              <p className="text-white/35 text-sm mt-5 max-w-xs leading-relaxed">
                AI care companion for post-discharge recovery. Reducing readmissions. Protecting patients. Helping hospitals earn.
              </p>
            </div>
            <div className="flex gap-14 text-sm">
              <div>
                <h4 className="text-white/30 text-xs uppercase tracking-widest mb-4">Product</h4>
                <ul className="space-y-3 text-white/55">
                  {[["How It Works", "#how-it-works"], ["Dashboard", "#dashboard"], ["Why Avyay", "#why-us"]].map(([label, href]) => (
                    <li key={label}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-white/30 text-xs uppercase tracking-widest mb-4">Company</h4>
                <ul className="space-y-3 text-white/55">
                  {[["Team", "#team"], ["Free Pilot", "#pilot"], ["Contact", "#contact"]].map(([label, href]) => (
                    <li key={label}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-white/8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/25 text-xs">
            <span>Avyay Health, Inc. · Jersey City, NJ · 2026</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="mailto:diksha@avyayhealth.com" className="hover:text-white transition-colors">diksha@avyayhealth.com</a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
