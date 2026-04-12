import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/shared/TopBar';
import { usePatientStore } from '../store/patientStore';
import { haptic } from '../utils/haptics';

interface ContactCard {
  id: string;
  name: string;
  role: string;
  phone: string;
  phoneDisplay: string;
  icon: string;
  iconBg?: string;
  iconColor?: string;
  isEmergency?: boolean;
}

function formatPhone(p: string) {
  // e.g. 555-200-1234 → (555) 200-1234
  const digits = p.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return p;
}

export default function CareTeam() {
  const session = usePatientStore((s) => s.session);
  const [activeTab, setActiveTab] = useState<'my-team' | 'hospital'>('my-team');

  if (!session) return null;

  const myTeamContacts: ContactCard[] = [
    {
      id: 'coordinator',
      name: `${session.coordinator_first_name ?? 'Sarah'}, RN`,
      role: 'Care coordinator',
      phone: '555-200-1234',
      phoneDisplay: formatPhone('555-200-1234'),
      icon: 'person',
      iconBg: '#EEF2F1',
      iconColor: '#053027',
    },
    {
      id: 'pharmacy',
      name: 'Hospital pharmacy',
      role: 'Medication refills',
      phone: '555-200-5678',
      phoneDisplay: formatPhone('555-200-5678'),
      icon: 'prescriptions',
      iconBg: '#F0FDF4',
      iconColor: '#16A34A',
    },
    {
      id: 'oncall',
      name: 'On-call physician',
      role: '24/7 urgent line',
      phone: '555-200-9999',
      phoneDisplay: formatPhone('555-200-9999'),
      icon: 'emergency',
      isEmergency: true,
    },
  ];

  const hospitalContacts: ContactCard[] = [
    {
      id: 'main',
      name: session.hospital_name,
      role: 'Main reception',
      phone: '555-200-0000',
      phoneDisplay: formatPhone('555-200-0000'),
      icon: 'local_hospital',
      iconBg: '#EEF2F1',
      iconColor: '#053027',
    },
    {
      id: 'discharge',
      name: 'Discharge planning',
      role: 'Follow-up appointments',
      phone: '555-200-1111',
      phoneDisplay: formatPhone('555-200-1111'),
      icon: 'calendar_month',
      iconBg: '#FDF4E7',
      iconColor: '#D97706',
    },
    {
      id: 'billing',
      name: 'Patient services',
      role: 'Billing & insurance',
      phone: '555-200-2222',
      phoneDisplay: formatPhone('555-200-2222'),
      icon: 'receipt_long',
      iconBg: '#EBF3FA',
      iconColor: '#1E73BE',
    },
  ];

  const contacts = activeTab === 'my-team' ? myTeamContacts : hospitalContacts;

  return (
    <div className="flex flex-col h-full bg-warm-oatmeal overflow-hidden">
      <TopBar title="Care Team" subtitle={session.hospital_name} />

      {/* Segmented control */}
      <div className="px-5 pt-3 pb-2 shrink-0">
        <div
          className="p-1 rounded-xl flex relative"
          style={{ backgroundColor: 'rgba(5,48,39,0.06)' }}
        >
          <motion.div
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-ios-sm"
            style={{
              left: activeTab === 'my-team' ? '4px' : 'calc(50% + 0px)',
            }}
          />
          <button
            onClick={() => {
              haptic('light');
              setActiveTab('my-team');
            }}
            className={`relative flex-1 h-9 font-semibold text-[14px] rounded-lg transition-colors ${
              activeTab === 'my-team' ? 'text-forest-slate' : 'text-sage-muted'
            }`}
          >
            My team
          </button>
          <button
            onClick={() => {
              haptic('light');
              setActiveTab('hospital');
            }}
            className={`relative flex-1 h-9 font-semibold text-[14px] rounded-lg transition-colors ${
              activeTab === 'hospital' ? 'text-forest-slate' : 'text-sage-muted'
            }`}
          >
            Hospital
          </button>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto scroll-y hide-scrollbar px-5 pt-3 pb-32 space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="space-y-3"
          >
            {contacts.map((contact) => (
              <ContactRow key={contact.id} contact={contact} />
            ))}
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-[11px] text-sage-muted pt-4 px-4">
          Your care team is here to support you. If this is a life-threatening
          emergency, always call 911 first.
        </p>
      </main>
    </div>
  );
}

function ContactRow({ contact }: { contact: ContactCard }) {
  if (contact.isEmergency) {
    return (
      <div className="relative card-ios overflow-hidden border-[1.5px] border-[#DC2626]/25 shadow-ios-lg">
        <div
          className="absolute left-0 top-0 bottom-0 w-1 bg-[#DC2626]"
          aria-hidden="true"
        />
        <div className="flex items-center gap-3.5 px-4 py-4 pl-5">
          <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center shrink-0">
            <span
              className="material-symbols-outlined text-[#DC2626]"
              style={{
                fontVariationSettings: "'FILL' 1",
                fontSize: '24px',
              }}
            >
              emergency
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[16px] font-bold text-[#DC2626] leading-tight">
              {contact.name}
            </p>
            <p className="text-[13px] text-[#DC2626]/70 font-medium mt-0.5">
              {contact.role}
            </p>
            <p className="text-[12px] text-[#DC2626]/60 mt-0.5 tabular-nums">
              {contact.phoneDisplay}
            </p>
          </div>
          <a
            href={`tel:${contact.phone}`}
            onClick={() => haptic('heavy')}
            aria-label={`Call ${contact.name}`}
            className="w-12 h-12 rounded-full bg-[#DC2626] flex items-center justify-center text-white shadow-ios tap-scale active:bg-[#B91C1C] transition-colors shrink-0"
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: "'FILL' 1",
                fontSize: '22px',
              }}
            >
              call
            </span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="card-ios">
      <div className="flex items-center gap-3.5 px-4 py-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
          style={{ backgroundColor: contact.iconBg ?? '#EEF2F1' }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings: "'FILL' 1",
              fontSize: '22px',
              color: contact.iconColor ?? '#053027',
            }}
          >
            {contact.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-bold text-forest-slate leading-tight truncate">
            {contact.name}
          </p>
          <p className="text-[13px] text-sage-muted font-medium mt-0.5 truncate">
            {contact.role}
          </p>
          <p className="text-[12px] text-sage-muted/80 mt-0.5 tabular-nums">
            {contact.phoneDisplay}
          </p>
        </div>
        <a
          href={`tel:${contact.phone}`}
          onClick={() => haptic('medium')}
          aria-label={`Call ${contact.name}`}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-ios tap-scale active:bg-primary-light transition-colors shrink-0"
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings: "'FILL' 1",
              fontSize: '22px',
            }}
          >
            call
          </span>
        </a>
      </div>
    </div>
  );
}
