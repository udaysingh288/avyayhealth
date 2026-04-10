import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Phone, AlertTriangle, X } from 'lucide-react';
import TopBar from '../components/shared/TopBar';
import { usePatientStore } from '../store/patientStore';

interface WarningSign {
  emoji: string;
  title: string;
  detail: string;
}

interface Section {
  id: string;
  title: string;
  emoji: string;
  color: string;
  bgColor: string;
  signs: WarningSign[];
}

const CHF_SECTIONS: Section[] = [
  {
    id: 'weight',
    title: 'Watch your weight',
    emoji: '⚖️',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-100',
    signs: [
      { emoji: '↑', title: 'Gain 2+ lbs in one day', detail: 'Weigh yourself every morning before eating. A sudden gain means fluid buildup.' },
      { emoji: '↑↑', title: 'Gain 5+ lbs in one week', detail: 'This is a serious warning sign. Call your care team right away.' },
    ],
  },
  {
    id: 'swelling',
    title: 'Swelling to watch for',
    emoji: '🦵',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-100',
    signs: [
      { emoji: '🦶', title: 'Swollen feet or ankles', detail: 'Press your finger into the skin — if a dent remains for 5 seconds, contact your care team.' },
      { emoji: '🦵', title: 'Swollen legs', detail: 'Fluid is building up. Elevate your feet and call your coordinator.' },
    ],
  },
  {
    id: 'breathing',
    title: 'Breathing changes',
    emoji: '💨',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50 border-teal-100',
    signs: [
      { emoji: '😮‍💨', title: 'Shortness of breath at rest', detail: "If you feel breathless without moving, that's a warning sign." },
      { emoji: '🛌', title: "Can't lie flat to sleep", detail: 'If you need more pillows to breathe comfortably, call your care team.' },
      { emoji: '😮', title: 'New or worsening cough', detail: 'A new persistent cough or pink/frothy mucus needs medical attention.' },
    ],
  },
  {
    id: 'energy',
    title: 'Energy & fatigue',
    emoji: '😴',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50 border-orange-100',
    signs: [
      { emoji: '😩', title: 'More tired than usual', detail: 'Feeling very tired doing normal activities like walking to the kitchen may mean your heart is working too hard.' },
      { emoji: '😵', title: 'Dizziness or confusion', detail: 'This can mean your blood pressure is too low or your medications need adjusting.' },
    ],
  },
];

const COPD_SECTIONS: Section[] = [
  {
    id: 'breathing',
    title: 'Breathing changes',
    emoji: '💨',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-100',
    signs: [
      { emoji: '😮‍💨', title: 'More breathless than usual', detail: "If simple activities like dressing make you much more winded than normal, contact your care team." },
      { emoji: '😴', title: 'Waking up breathless at night', detail: 'Waking up unable to breathe is an urgent warning sign. Call your care team.' },
      { emoji: '🫁', title: 'Chest tightness', detail: 'Tightness or pressure in the chest needs to be reported.' },
    ],
  },
  {
    id: 'mucus',
    title: 'Mucus changes',
    emoji: '🔬',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 border-yellow-100',
    signs: [
      { emoji: '🟡', title: 'Yellow or green mucus', detail: 'A color change in mucus often means infection. Call your care team for advice on antibiotics.' },
      { emoji: '📈', title: 'More mucus than normal', detail: 'Increased production means your lungs are working harder. Log it in your check-in.' },
    ],
  },
  {
    id: 'medications',
    title: 'Use your rescue inhaler',
    emoji: '💊',
    color: 'text-forest',
    bgColor: 'bg-forest-pale border-forest/20',
    signs: [
      { emoji: '💨', title: 'Use your rescue inhaler', detail: 'If you need your rescue inhaler more often than usual, your symptoms are getting worse.' },
      { emoji: '⚠️', title: 'Inhaler not helping', detail: 'If your rescue inhaler is not relieving symptoms, seek medical care immediately.' },
    ],
  },
];

const CALL_911_SIGNS = [
  { emoji: '💔', text: 'Severe chest pain or pressure' },
  { emoji: '🚫', text: 'Cannot breathe at all' },
  { emoji: '💙', text: 'Lips or fingertips turning blue' },
  { emoji: '😶', text: 'Sudden confusion or cannot speak' },
];

export default function Learn() {
  const session = usePatientStore((s) => s.session);
  const condition = session?.condition ?? 'chf';
  const sections = condition === 'copd' ? COPD_SECTIONS : CHF_SECTIONS;
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showEmergency, setShowEmergency] = useState(false);

  return (
    <div className="flex flex-col h-full bg-off-white">
      <TopBar title={condition === 'copd' ? 'COPD Recovery Guide' : 'Heart Failure Recovery Guide'} />

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {/* Condition pill */}
        <div className="flex items-center gap-2">
          <span className="bg-forest-pale text-forest font-sans font-semibold text-sm px-3 py-1.5 rounded-full border border-forest/20">
            {condition === 'copd' ? '🫁 COPD' : '❤️ Heart Failure'}
          </span>
          <span className="text-xs font-sans text-slate-400">
            Your recovery guide
          </span>
        </div>

        {/* Intro */}
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <p className="font-sans text-slate-600 text-base leading-relaxed">
            {condition === 'copd'
              ? "Your lungs are recovering. Knowing when to act on symptoms can prevent a trip back to the hospital."
              : "Your heart is healing. Learning your warning signs helps you stay safe at home and avoid readmission."
            }
          </p>
        </div>

        {/* Warning sign sections */}
        {sections.map((section) => (
          <div key={section.id} className={`rounded-2xl border ${section.bgColor}`}>
            <button
              onClick={() => setExpanded(expanded === section.id ? null : section.id)}
              className="w-full flex items-center justify-between px-4 py-4 text-left
                focus:outline-none focus:ring-2 focus:ring-forest rounded-2xl"
              aria-expanded={expanded === section.id}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" aria-hidden="true">{section.emoji}</span>
                <span className={`font-sans font-semibold text-base ${section.color}`}>{section.title}</span>
              </div>
              <motion.span
                animate={{ rotate: expanded === section.id ? 90 : 0 }}
                className={section.color}
              >
                <ChevronRight size={20} aria-hidden="true" />
              </motion.span>
            </button>

            <AnimatePresence>
              {expanded === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {section.signs.map((sign) => (
                      <div key={sign.title} className="bg-white/70 rounded-xl p-3.5">
                        <div className="flex items-start gap-3">
                          <span className="text-xl shrink-0" aria-hidden="true">{sign.emoji}</span>
                          <div>
                            <div className="font-sans font-semibold text-slate-800 text-base">{sign.title}</div>
                            <p className="font-sans text-slate-600 text-sm leading-relaxed mt-0.5">{sign.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}

        {/* 911 section */}
        <button
          onClick={() => setShowEmergency(true)}
          className="w-full bg-red-50 border border-red-200 rounded-2xl p-4 text-left
            active:bg-red-100 transition focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle size={20} className="text-red-600 shrink-0" aria-hidden="true" />
            <span className="font-sans font-semibold text-red-700 text-base">When to call 911</span>
          </div>
          <p className="font-sans text-red-600 text-sm">
            Some symptoms need emergency care. Tap to see the full list.
          </p>
        </button>
      </div>

      {/* Emergency 911 sheet */}
      <AnimatePresence>
        {showEmergency && (
          <EmergencySheet onClose={() => setShowEmergency(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function EmergencySheet({ onClose }: { onClose: () => void }) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl px-5 pt-5 shadow-2xl"
        style={{ paddingBottom: 'max(32px, env(safe-area-inset-bottom))' }}
        role="dialog"
        aria-label="When to call 911"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-red-800">Call 911 immediately if…</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100
              focus:outline-none focus:ring-2 focus:ring-forest"
            aria-label="Close"
          >
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          {CALL_911_SIGNS.map((sign) => (
            <div key={sign.text} className="flex items-center gap-3 bg-red-50 rounded-xl px-4 py-3.5">
              <span className="text-2xl shrink-0" aria-hidden="true">{sign.emoji}</span>
              <span className="font-sans text-red-800 text-base font-medium">{sign.text}</span>
            </div>
          ))}
        </div>

        <a
          href="tel:911"
          className="flex items-center justify-center gap-3 w-full min-h-[60px] bg-red-600 text-white
            font-sans font-semibold text-xl rounded-2xl shadow-lg active:bg-red-700 transition
            focus:outline-none focus:ring-4 focus:ring-red-300"
        >
          <Phone size={22} aria-hidden="true" />
          Call 911
        </a>
      </motion.div>
    </>
  );
}
