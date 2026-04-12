export default function ContactForm() {
  return (
    <section id="contact" className="relative overflow-hidden bg-[#053027]">
      <div className="absolute inset-0 bg-gradient-to-br from-[#053027] via-[#0D6B56]/30 to-[#053027]" />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
        backgroundSize: "32px 32px"
      }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-10">
          <div className="text-[#0D6B56] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            Get In Touch
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-3 text-balance">
            20 minutes is all we need
          </h2>
          <p className="text-white/50 text-sm sm:text-base">
            Walk us through your post-discharge workflow. No pitch — just questions.
          </p>
        </div>

        <form
          action="https://formspree.io/f/YOUR_FORM_ID"
          method="POST"
          className="bg-white/[0.08] backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">Name</label>
              <input type="text" name="name" required placeholder="Dr. Jane Smith"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">Hospital</label>
              <input type="text" name="hospital" required placeholder="St. Mary\u2019s Medical Center"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">Role</label>
              <input type="text" name="role" required placeholder="VP of Quality"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wide">Email</label>
              <input type="email" name="email" required placeholder="jane@hospital.org"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors" />
            </div>
          </div>
          <button type="submit"
            className="w-full bg-white text-[#053027] py-3.5 rounded-xl font-semibold text-base hover:bg-[#FFF8E7] transition-all hover:shadow-lg hover:shadow-white/15 hover:scale-[1.01]">
            Book a Discovery Call →
          </button>
          <p className="text-center text-white/40 text-xs">
            We&apos;ll respond within 24 hours.
          </p>
        </form>
      </div>
    </section>
  );
}
