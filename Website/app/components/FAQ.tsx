"use client";

import { useState } from "react";
import FadeSection from "./FadeSection";

const faqs = [
  {
    q: "How does Avyay integrate with our existing systems?",
    a: "Avyay connects through your ADT discharge feed only — no EHR write-back, no IT integration project. We read discharge events and enroll patients automatically. Your coordinators access a browser-based dashboard. No software to install.",
  },
  {
    q: "What does the patient experience look like?",
    a: "Patients receive a welcome SMS within 24 hours of discharge. Each day, they get a brief conversational check-in asking about symptoms, medications, and recovery. They reply in their own words — no buttons or forms. If they prefer, they can use our PWA app instead.",
  },
  {
    q: "How is Avyay different from IVR or patient portal solutions?",
    a: "IVR systems get 20\u201330% completion rates. Patient portals require app downloads and logins. Avyay uses SMS — the channel patients already use — and reads free-text replies with AI classification. Our engagement rates are significantly higher because we meet patients where they are.",
  },
  {
    q: "How does Avyay generate CMS reimbursement revenue?",
    a: "Avyay\u2019s daily remote monitoring qualifies hospitals for CPT codes including 99453, 99454, 99457, 99458, 99490, and 99496. For a CHF patient, this can total $3,100+ per year in CMS reimbursement — meaning the program pays for itself.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <FadeSection id="faq" className="bg-[#F9F7F2]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="text-[#0D6B56] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            FAQ
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1A1A1A] text-balance">
            Questions before getting started?
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-[#053027]/15"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <div className="flex items-center gap-4">
                  <span className="text-[#053027]/30 font-serif text-lg font-bold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold text-sm sm:text-base text-[#1A1A1A]">{faq.q}</span>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6B7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`shrink-0 ml-4 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {open === i && (
                <div className="px-6 pb-5 pl-16">
                  <p className="text-[#6B7280] text-sm leading-relaxed">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </FadeSection>
  );
}
