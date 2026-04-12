import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/shared/TopBar';
import { usePatientStore } from '../store/patientStore';
import { haptic } from '../utils/haptics';
import { INITIAL_MEDS, INITIAL_HABITS } from '../data/carePlanDefaults';
import type { MedItem, HabitItem } from '../data/carePlanDefaults';

const CHF_RESOURCES = [
  {
    id: 'r-1',
    title: 'Daily weight monitoring',
    body: 'Weigh yourself each morning before eating. Call your care team if you gain 2+ lbs in a day or 5+ lbs in a week.',
    icon: 'monitor_weight',
  },
  {
    id: 'r-2',
    title: 'Low-sodium diet',
    body: 'Limit sodium to less than 2,000 mg per day. Avoid processed foods, canned soups, and fast food.',
    icon: 'restaurant',
  },
  {
    id: 'r-3',
    title: 'Activity guidelines',
    body: 'Short walks are encouraged. Stop and rest if you feel short of breath or dizzy. Increase activity gradually each week.',
    icon: 'fitness_center',
  },
];

const COPD_RESOURCES = [
  {
    id: 'r-1',
    title: 'Pursed-lip breathing',
    body: 'Breathe in through your nose for 2 counts. Pucker your lips and exhale slowly for 4 counts. Repeat 3–4 times.',
    icon: 'air',
  },
  {
    id: 'r-2',
    title: 'Avoiding triggers',
    body: 'Stay indoors on high-pollution days. Avoid smoke, strong perfumes, and dust. Keep windows closed when pollen is high.',
    icon: 'health_and_safety',
  },
  {
    id: 'r-3',
    title: 'Inhaler technique',
    body: 'Shake before use. Exhale fully, then press and inhale slowly. Hold your breath for 10 seconds.',
    icon: 'medical_services',
  },
];

export default function CarePlan() {
  const session = usePatientStore((s) => s.session);
  const [activeTab, setActiveTab] = useState<'schedule' | 'resources'>('schedule');

  // Use patient-specific medications from discharge data, fall back to defaults
  const patientMeds = useMemo<MedItem[]>(() => {
    if (session?.medications && session.medications.length > 0) {
      return session.medications.map((m, i) => ({
        id: `med-${i + 1}`,
        name: m.name,
        dose: m.dose,
        timing: m.timing || m.frequency,
        time: m.timing || '',
        checked: false,
      }));
    }
    return INITIAL_MEDS;
  }, [session?.medications]);

  const [meds, setMeds] = useState<MedItem[]>(patientMeds);
  const [habits, setHabits] = useState<HabitItem[]>(INITIAL_HABITS);

  if (!session) return null;

  const resources = session.condition === 'copd' ? COPD_RESOURCES : CHF_RESOURCES;

  function toggleMed(id: string) {
    haptic('light');
    setMeds((prev) =>
      prev.map((m) => (m.id === id ? { ...m, checked: !m.checked } : m)),
    );
  }

  function toggleHabit(id: string) {
    haptic('light');
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, checked: !h.checked } : h)),
    );
  }

  return (
    <div className="flex flex-col h-full bg-warm-oatmeal overflow-hidden">
      <TopBar title="Care Plan" subtitle={`${session.condition === 'copd' ? 'COPD' : 'Heart Failure'} Recovery`} />

      {/* Segmented control */}
      <div className="px-5 pt-3 pb-2 shrink-0">
        <div className="bg-primary/8 p-1 rounded-xl flex relative" style={{ backgroundColor: 'rgba(5,48,39,0.06)' }}>
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-ios-sm`}
            style={{
              left: activeTab === 'schedule' ? '4px' : 'calc(50% + 0px)',
            }}
          />
          <button
            onClick={() => {
              haptic('light');
              setActiveTab('schedule');
            }}
            className={`relative flex-1 h-9 font-semibold text-[14px] rounded-lg transition-colors ${
              activeTab === 'schedule' ? 'text-forest-slate' : 'text-sage-muted'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => {
              haptic('light');
              setActiveTab('resources');
            }}
            className={`relative flex-1 h-9 font-semibold text-[14px] rounded-lg transition-colors ${
              activeTab === 'resources' ? 'text-forest-slate' : 'text-sage-muted'
            }`}
          >
            Resources
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto scroll-y hide-scrollbar px-5 pt-3 pb-40">
        <AnimatePresence mode="wait">
          {activeTab === 'schedule' ? (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Medications */}
              <section>
                <SectionHeader title="Medications" sub={`${meds.filter((m) => m.checked).length} of ${meds.length} taken`} />
                <div className="card-ios overflow-hidden">
                  {meds.map((med, i) => (
                    <TaskRow
                      key={med.id}
                      checked={med.checked}
                      onToggle={() => toggleMed(med.id)}
                      icon="pill"
                      iconBg="#EEF2F1"
                      iconColor="#053027"
                      title={`${med.name} · ${med.dose}`}
                      subtitle={`${med.timing}`}
                      trailing={med.time}
                      isLast={i === meds.length - 1}
                    />
                  ))}
                </div>
              </section>

              {/* Daily habits */}
              <section>
                <SectionHeader
                  title="Daily habits"
                  sub={`${habits.filter((h) => h.checked).length} of ${habits.length} complete`}
                />
                <div className="card-ios overflow-hidden">
                  {habits.map((habit, i) => (
                    <TaskRow
                      key={habit.id}
                      checked={habit.checked}
                      onToggle={() => toggleHabit(habit.id)}
                      icon={habit.icon}
                      iconBg={habit.iconBg}
                      iconColor={habit.iconColor}
                      title={habit.label}
                      subtitle={habit.description}
                      isLast={i === habits.length - 1}
                    />
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div
              key="resources"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <SectionHeader
                title={`${session.condition === 'copd' ? 'COPD' : 'Heart Failure'} Guide`}
                sub="Tap a topic to learn more"
              />
              <div className="space-y-3">
                {resources.map((r) => (
                  <div key={r.id} className="card-ios p-5">
                    <div className="flex items-center gap-3 mb-2.5">
                      <div className="w-10 h-10 rounded-full bg-primary-pale flex items-center justify-center">
                        <span
                          className="material-symbols-outlined text-primary"
                          style={{
                            fontVariationSettings: "'FILL' 1",
                            fontSize: '20px',
                          }}
                        >
                          {r.icon}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-bold text-forest-slate tracking-tight">
                        {r.title}
                      </h4>
                    </div>
                    <p className="text-[14px] text-forest-secondary leading-relaxed">
                      {r.body}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Sticky emergency footer — above BottomNav */}
      <div
        className="fixed left-0 right-0 z-40 px-4"
        style={{ bottom: 'calc(76px + env(safe-area-inset-bottom))' }}
      >
        <div className="max-w-md mx-auto card-ios px-4 py-3 flex items-center justify-between gap-3 border border-[#DC2626]/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center">
              <span
                className="material-symbols-outlined text-[#DC2626]"
                style={{
                  fontVariationSettings: "'FILL' 1",
                  fontSize: '22px',
                }}
              >
                emergency
              </span>
            </div>
            <div>
              <p className="text-[13px] font-bold text-forest-slate leading-tight">
                Urgent help
              </p>
              <p className="text-[11px] text-sage-muted">Available 24/7</p>
            </div>
          </div>
          <a
            href="tel:911"
            onClick={() => haptic('heavy')}
            className="bg-[#DC2626] text-white px-4 h-10 rounded-full text-[14px] font-bold flex items-center gap-1.5 shadow-ios tap-scale active:bg-[#B91C1C] transition-colors"
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: "'FILL' 1",
                fontSize: '18px',
              }}
            >
              call
            </span>
            Call 911
          </a>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-end justify-between mb-3 px-1">
      <h3 className="text-[17px] font-bold text-forest-slate tracking-tight">
        {title}
      </h3>
      {sub && <p className="text-[12px] text-sage-muted font-medium">{sub}</p>}
    </div>
  );
}

interface TaskRowProps {
  checked: boolean;
  onToggle: () => void;
  icon: string;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  trailing?: string;
  isLast: boolean;
}

function TaskRow({
  checked,
  onToggle,
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  trailing,
  isLast,
}: TaskRowProps) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3.5 px-4 py-3.5 tap-scale-sm active:bg-black/[0.02] transition-colors text-left ${
        !isLast ? 'hairline-b' : ''
      }`}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            fontVariationSettings: "'FILL' 1",
            fontSize: '20px',
            color: iconColor,
          }}
        >
          {icon}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-[15px] font-semibold text-forest-slate leading-tight ${
            checked ? 'line-through opacity-50' : ''
          }`}
        >
          {title}
        </p>
        <p className="text-[13px] text-sage-muted mt-0.5">{subtitle}</p>
      </div>

      {trailing && !checked && (
        <span className="text-[12px] text-sage-muted font-semibold tabular-nums mr-1">
          {trailing}
        </span>
      )}

      <div
        className={`w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0 transition-all ${
          checked ? 'bg-primary' : 'border-[1.5px] border-sage-muted/40 bg-transparent'
        }`}
      >
        {checked && (
          <span
            className="material-symbols-outlined text-white"
            style={{
              fontSize: '16px',
              fontVariationSettings: "'FILL' 1, 'wght' 700",
            }}
          >
            check
          </span>
        )}
      </div>
    </button>
  );
}
