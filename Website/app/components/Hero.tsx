"use client";

import { useState } from "react";
import SMSMockupAnimated from "./SMSMockupAnimated";

// Same Google Form as ContactForm — only submits email field
const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSep4daSSq3fxMqKwUWFFcCUFFFqg-1qlzSSzUXZfDU7PDxKYA/formResponse";
const FIELD_EMAIL = "entry.2006775208";

export default function Hero() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);
    const email = (data.get("email") as string) || "";

    const body = new URLSearchParams();
    body.append(FIELD_EMAIL, email);

    try {
      await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
      setSubmitted(true);
      form.reset();
    } catch {
      const subject = encodeURIComponent("Discovery Call Request — Avyay Health");
      const mailBody = encodeURIComponent(`Email: ${email}\n\nI'd like to book a discovery call.`);
      window.location.href = `mailto:diksha@avyayhealth.com?subject=${subject}&body=${mailBody}`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-[#F9F7F2] pt-28 pb-16 sm:pt-32 sm:pb-20 lg:pt-36 lg:pb-24">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — headline + form */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#053027]/10 border border-[#053027]/15 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] relative">
                <span className="absolute inset-0 rounded-full bg-[#16A34A] animate-pulse-ring" />
              </span>
              <span className="text-[#053027]/70 text-xs font-medium">Now accepting pilot partners</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#1A1A1A] leading-[1.08] mb-5">
              The care that follows you home
            </h1>
            <p className="text-[#6B7280] text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              AI care companion that contacts every discharged patient daily for 30 days — via SMS or app — and alerts your care team before deterioration becomes a readmission.
            </p>

            {/* Inline form */}
            {submitted ? (
              <div className="flex items-center gap-3 bg-[#053027]/10 rounded-xl px-5 py-4 mb-6">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#053027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                </svg>
                <span className="text-[#053027] text-sm font-medium">Thanks! We&apos;ll be in touch within 24 hours.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your work email"
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#053027]/20 focus:border-[#053027]/40 transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#053027] text-white px-8 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#0D6B56] transition-all hover:shadow-lg hover:shadow-[#053027]/15 whitespace-nowrap disabled:opacity-60"
                >
                  {loading ? "Sending..." : "Book a Demo"}
                </button>
              </form>
            )}

            {/* Trust row */}
            <div className="flex flex-wrap items-center gap-6 text-[#6B7280] text-xs">
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#053027" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                No hardware required
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#053027" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                Live in &lt;24 hours
              </span>
              <span className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#053027" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
                90-day pilot
              </span>
            </div>
          </div>

          {/* Right — phone mockup */}
          <div className="flex justify-center lg:justify-end">
            <SMSMockupAnimated />
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-16 lg:mt-20 grid grid-cols-2 sm:grid-cols-4 gap-px bg-[#053027] rounded-2xl overflow-hidden">
          {[
            { value: "$3,100+", label: "CMS revenue per patient/yr" },
            { value: "5-7x", label: "ROI for hospitals" },
            { value: "<2hr", label: "Alert response SLA" },
            { value: "52", label: "Hospital pros surveyed" },
          ].map((s) => (
            <div key={s.label} className="bg-[#053027] px-6 py-5 text-center">
              <div className="font-serif text-2xl sm:text-3xl text-white mb-1">{s.value}</div>
              <div className="text-white/50 text-xs leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
