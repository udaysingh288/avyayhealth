import { useState } from 'react';
import { usePatientStore } from '../store/patientStore';
import { MOCK_SESSION } from '../utils/mockData';

interface MedItem {
  id: string;
  name: string;
  dose: string;
  timing: string;
  checked: boolean;
}

interface HabitItem {
  id: string;
  label: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  checked: boolean;
}

const INITIAL_MEDS: MedItem[] = [
  { id: 'med-1', name: 'Amoxicillin', dose: '500mg', timing: 'With breakfast', checked: true },
  { id: 'med-2', name: 'Ibuprofen', dose: '400mg', timing: 'As needed for pain', checked: false },
];

const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'hab-1',
    label: 'Hydration',
    description: 'Drink 2L of water today',
    icon: 'water_drop',
    iconColor: '#4B7bec',
    iconBg: '#f4f7fc',
    checked: false,
  },
  {
    id: 'hab-2',
    label: 'Gentle Movement',
    description: 'Short 10-minute walk',
    icon: 'directions_walk',
    iconColor: '#fa8231',
    iconBg: '#fdf5f0',
    checked: false,
  },
];

const CHF_RESOURCES = [
  {
    id: 'r-1',
    title: 'Daily Weight Monitoring',
    body: 'Weigh yourself every morning before eating. Call your care team if you gain 2+ lbs in one day or 5+ lbs in one week.',
    icon: 'monitor_weight',
  },
  {
    id: 'r-2',
    title: 'Low-Sodium Diet',
    body: 'Limit sodium to less than 2,000 mg per day. Avoid processed foods, canned soups, and fast food.',
    icon: 'nutrition',
  },
  {
    id: 'r-3',
    title: 'Activity Guidelines',
    body: 'Short walks are encouraged. Stop and rest if you feel short of breath or dizzy. Gradually increase activity each week.',
    icon: 'fitness_center',
  },
];

const COPD_RESOURCES = [
  {
    id: 'r-1',
    title: 'Pursed-Lip Breathing',
    body: 'Breathe in through your nose for 2 counts. Pucker your lips and breathe out slowly for 4 counts. Repeat 3-4 times.',
    icon: 'air',
  },
  {
    id: 'r-2',
    title: 'Avoiding Triggers',
    body: 'Stay indoors on high pollution days. Avoid smoke, strong perfumes, and dust. Keep windows closed when pollen is high.',
    icon: 'health_and_safety',
  },
  {
    id: 'r-3',
    title: 'Inhaler Technique',
    body: 'Always shake your inhaler before use. Exhale fully, then press and inhale slowly. Hold breath for 10 seconds.',
    icon: 'medical_services',
  },
];

export default function CarePlan() {
  const session = usePatientStore((s) => s.session) ?? MOCK_SESSION;
  const [activeTab, setActiveTab] = useState<'schedule' | 'resources'>('schedule');
  const [meds, setMeds] = useState<MedItem[]>(INITIAL_MEDS);
  const [habits, setHabits] = useState<HabitItem[]>(INITIAL_HABITS);

  const resources = session.condition === 'copd' ? COPD_RESOURCES : CHF_RESOURCES;

  function toggleMed(id: string) {
    setMeds((prev) => prev.map((m) => (m.id === id ? { ...m, checked: !m.checked } : m)));
  }

  function toggleHabit(id: string) {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, checked: !h.checked } : h)));
  }

  return (
    <div className="flex flex-col h-full bg-warm-oatmeal">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-warm-oatmeal/95 backdrop-blur-sm shrink-0">
        <div className="flex items-center p-4 pb-2 justify-between"
          style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}>
          <h2 className="text-forest-slate text-xl font-bold leading-tight flex-1 text-center px-12">
            Care Plan
          </h2>
        </div>
        {/* Tabs */}
        <div className="pb-3">
          <div className="flex border-b border-border px-4 justify-between">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 transition-colors
                ${activeTab === 'schedule'
                  ? 'border-b-primary text-forest-slate'
                  : 'border-b-transparent text-sage-muted'
                }`}
            >
              <p className="text-base font-bold leading-normal tracking-[0.015em]">Schedule</p>
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 flex-1 transition-colors
                ${activeTab === 'resources'
                  ? 'border-b-primary text-forest-slate'
                  : 'border-b-transparent text-sage-muted'
                }`}
            >
              <p className="text-base font-bold leading-normal tracking-[0.015em]">Resources</p>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-4 pb-32 space-y-8">
        {activeTab === 'schedule' ? (
          <>
            {/* Medications */}
            <section>
              <h3 className="text-forest-slate text-lg font-bold leading-tight pb-4">
                Today's Medications
              </h3>
              <div className="space-y-4">
                {meds.map((med) => (
                  <div
                    key={med.id}
                    className="bg-surface rounded-2xl p-5 shadow-soft flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-pale flex items-center justify-center text-primary">
                        <span
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          pill
                        </span>
                      </div>
                      <div>
                        <h4
                          className={`text-forest-slate font-bold text-base ${
                            med.checked ? 'line-through opacity-70' : ''
                          }`}
                        >
                          {med.name}
                        </h4>
                        <p className="text-sage-muted text-sm">
                          {med.dose} · {med.timing}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleMed(med.id)}
                      aria-label={med.checked ? 'Mark as incomplete' : 'Mark as complete'}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95
                        ${med.checked
                          ? 'bg-primary'
                          : 'border-2 border-sage-muted hover:border-primary'
                        }`}
                    >
                      {med.checked && (
                        <span
                          className="material-symbols-outlined text-white text-xl"
                          style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}
                        >
                          check
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Daily Habits */}
            <section>
              <h3 className="text-forest-slate text-lg font-bold leading-tight pb-4">
                Daily Habits
              </h3>
              <div className="space-y-4">
                {habits.map((habit) => (
                  <div
                    key={habit.id}
                    className="bg-surface rounded-2xl p-5 shadow-soft flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: habit.iconBg, color: habit.iconColor }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontVariationSettings: "'FILL' 1", color: habit.iconColor }}
                        >
                          {habit.icon}
                        </span>
                      </div>
                      <div>
                        <h4
                          className={`text-forest-slate font-bold text-base ${
                            habit.checked ? 'line-through opacity-70' : ''
                          }`}
                        >
                          {habit.label}
                        </h4>
                        <p className="text-sage-muted text-sm">{habit.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      aria-label={habit.checked ? 'Mark as incomplete' : 'Mark as complete'}
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-95
                        ${habit.checked
                          ? 'bg-primary'
                          : 'border-2 border-sage-muted hover:border-primary'
                        }`}
                    >
                      {habit.checked && (
                        <span
                          className="material-symbols-outlined text-white text-xl"
                          style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}
                        >
                          check
                        </span>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          /* Resources tab */
          <section>
            <h3 className="text-forest-slate text-lg font-bold leading-tight pb-4">
              {session.condition === 'copd' ? 'COPD' : 'Heart Failure'} Recovery Guide
            </h3>
            <div className="space-y-4">
              {resources.map((r) => (
                <div key={r.id} className="bg-surface rounded-2xl p-5 shadow-soft">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary-pale flex items-center justify-center text-primary">
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        {r.icon}
                      </span>
                    </div>
                    <h4 className="text-forest-slate font-bold text-base">{r.title}</h4>
                  </div>
                  <p className="text-sage-muted text-sm leading-relaxed">{r.body}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Sticky emergency footer */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 bg-surface/90 backdrop-blur-md border-t border-border shadow-[0_-8px_24px_rgba(0,0,0,0.04)] z-50"
        style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-forest-slate font-bold text-sm">Need urgent help?</p>
            <p className="text-sage-muted text-xs">Available 24/7</p>
          </div>
          <a
            href="tel:911"
            className="bg-triage-red text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-sm transition-transform active:scale-95 hover:bg-[#d47875]"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              call
            </span>
            Call Triage
          </a>
        </div>
      </div>
    </div>
  );
}
