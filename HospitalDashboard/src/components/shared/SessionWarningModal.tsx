interface SessionWarningModalProps {
  onExtend: () => void;
}

export default function SessionWarningModal({ onExtend }: SessionWarningModalProps) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[100]" aria-hidden="true" />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label="Session expiring soon"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101]
          bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center"
      >
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="font-semibold text-slate-800 font-sans text-base mb-2">
          Session expiring soon
        </h2>
        <p className="text-sm text-slate-500 font-sans mb-5">
          You'll be automatically signed out in 60 seconds due to inactivity.
        </p>
        <button
          onClick={onExtend}
          className="w-full bg-forest text-white font-sans font-semibold text-sm px-4 py-2.5 rounded-lg
            hover:bg-forest-light transition focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-1"
          autoFocus
        >
          Stay signed in
        </button>
      </div>
    </>
  );
}
