"use client";

import { useState } from "react";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://formspree.io/dikshadeshmukh016@gmail.com", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setSubmitted(true);
        form.reset();
      } else {
        // Fallback: open mailto
        const name = data.get("name") || "";
        const hospital = data.get("hospital") || "";
        const role = data.get("role") || "";
        const email = data.get("email") || "";
        const message = data.get("message") || "";
        const subject = encodeURIComponent(`Discovery Call Request — ${hospital}`);
        const body = encodeURIComponent(
          `Name: ${name}\nHospital: ${hospital}\nRole: ${role}\nEmail: ${email}\n\n${message}`
        );
        window.location.href = `mailto:dikshadeshmukh016@gmail.com?subject=${subject}&body=${body}`;
      }
    } catch {
      // Network error — fallback to mailto
      const name = data.get("name") || "";
      const hospital = data.get("hospital") || "";
      const role = data.get("role") || "";
      const email = data.get("email") || "";
      const message = data.get("message") || "";
      const subject = encodeURIComponent(`Discovery Call Request — ${hospital}`);
      const body = encodeURIComponent(
        `Name: ${name}\nHospital: ${hospital}\nRole: ${role}\nEmail: ${email}\n\n${message}`
      );
      window.location.href = `mailto:dikshadeshmukh016@gmail.com?subject=${subject}&body=${body}`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="contact" className="bg-[#F9F7F2] py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-10">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-[#053027]/10 flex items-center justify-center mx-auto mb-4">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#053027" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <h3 className="font-semibold text-[#1A1A1A] text-lg mb-2">We&apos;ll be in touch</h3>
              <p className="text-[#6B7280] text-sm">Expect a reply within 24 hours.</p>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-[#1A1A1A] text-lg mb-6">Book your discovery call</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Name *</label>
                    <input type="text" name="name" required placeholder="Dr. Jane Smith"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053027]/20 focus:border-[#053027]/40 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Hospital *</label>
                    <input type="text" name="hospital" required placeholder="St. Mary's Medical Center"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053027]/20 focus:border-[#053027]/40 transition-all" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Role / Title *</label>
                    <input type="text" name="role" required placeholder="VP of Quality"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053027]/20 focus:border-[#053027]/40 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Work Email *</label>
                    <input type="email" name="email" required placeholder="jane@hospital.org"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053027]/20 focus:border-[#053027]/40 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#6B7280] mb-1.5">Anything else? (optional)</label>
                  <textarea name="message" rows={3} placeholder="Tell us about your current post-discharge workflow..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-[#1A1A1A] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#053027]/20 focus:border-[#053027]/40 transition-all resize-none" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#053027] text-white py-3.5 rounded-xl font-semibold text-base hover:bg-[#0D6B56] transition-all hover:shadow-lg hover:shadow-[#053027]/15 disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? "Sending..." : "Book a Discovery Call"}
                </button>
                <p className="text-center text-[#6B7280] text-xs">
                  We&apos;ll respond within 24 hours. No spam, ever.
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
