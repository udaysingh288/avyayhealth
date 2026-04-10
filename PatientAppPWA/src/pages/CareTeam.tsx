import { useState } from 'react';
import { usePatientStore } from '../store/patientStore';
import { MOCK_SESSION } from '../utils/mockData';

interface ContactCard {
  id: string;
  name: string;
  role: string;
  phone: string;
  avatarType: 'image' | 'icon';
  avatarSrc?: string;
  avatarIcon?: string;
  iconBg?: string;
  iconColor?: string;
  isEmergency?: boolean;
}

function ContactCardItem({ contact }: { contact: ContactCard }) {
  if (contact.isEmergency) {
    return (
      <div className="flex items-center h-[88px] bg-white rounded-xl border border-status-red shadow-[0_2px_4px_rgba(220,38,38,0.08)] p-4 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-status-red" />
        <div className="w-12 h-12 rounded-full bg-status-red-bg flex items-center justify-center shrink-0">
          <span
            className="material-symbols-outlined text-status-red"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            emergency
          </span>
        </div>
        <div className="ml-4 flex-1 min-w-0">
          <h2 className="text-base font-bold text-status-red truncate">{contact.name}</h2>
          <p className="text-sm font-medium text-status-red opacity-80 truncate">{contact.role}</p>
        </div>
        <a
          href={`tel:${contact.phone}`}
          aria-label={`Call ${contact.name}`}
          className="ml-4 w-10 h-10 rounded-full bg-status-red-bg border border-red-200 flex items-center justify-center text-status-red hover:bg-red-100 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-status-red focus:ring-offset-1"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            call
          </span>
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center h-[88px] bg-white rounded-xl border border-border shadow-[0_2px_4px_rgba(8,80,65,0.04)] p-4">
      {contact.avatarType === 'image' ? (
        <div className="w-12 h-12 rounded-full bg-primary-pale flex items-center justify-center shrink-0 border border-border overflow-hidden">
          <span
            className="material-symbols-outlined text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            person
          </span>
        </div>
      ) : (
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border"
          style={{
            backgroundColor: contact.iconBg ?? '#f0f4f3',
            borderColor: `${contact.iconColor ?? '#085041'}30`,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontVariationSettings: "'FILL' 1",
              color: contact.iconColor ?? '#085041',
            }}
          >
            {contact.avatarIcon}
          </span>
        </div>
      )}

      <div className="ml-4 flex-1 min-w-0">
        <h2 className="text-base font-bold text-forest-slate truncate">{contact.name}</h2>
        <p className="text-sm font-medium text-sage-muted truncate">{contact.role}</p>
      </div>

      <a
        href={`tel:${contact.phone}`}
        aria-label={`Call ${contact.name}`}
        className="ml-4 w-10 h-10 rounded-full bg-gray-50 border border-border flex items-center justify-center text-primary hover:bg-gray-100 transition-colors shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
      >
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
          call
        </span>
      </a>
    </div>
  );
}

export default function CareTeam() {
  const session = usePatientStore((s) => s.session) ?? MOCK_SESSION;
  const [activeTab, setActiveTab] = useState<'my-team' | 'hospital'>('my-team');

  const myTeamContacts: ContactCard[] = [
    {
      id: 'coordinator',
      name: `${session.coordinator_first_name ?? 'Sarah'}, RN`,
      role: 'Care Coordinator',
      phone: '555-200-1234',
      avatarType: 'image',
    },
    {
      id: 'pharmacy',
      name: 'Hospital Pharmacy',
      role: 'Medication Refills',
      phone: '555-200-5678',
      avatarType: 'icon',
      avatarIcon: 'prescriptions',
      iconBg: '#F0FDF4',
      iconColor: '#085041',
    },
    {
      id: 'oncall',
      name: 'On-Call Physician',
      role: '24/7 Urgent Line',
      phone: '555-200-9999',
      avatarType: 'icon',
      avatarIcon: 'emergency',
      isEmergency: true,
    },
  ];

  const hospitalContacts: ContactCard[] = [
    {
      id: 'main',
      name: session.hospital_name,
      role: 'Main Reception',
      phone: '555-200-0000',
      avatarType: 'icon',
      avatarIcon: 'local_hospital',
      iconBg: '#f0f4f3',
      iconColor: '#085041',
    },
    {
      id: 'discharge',
      name: 'Discharge Planning',
      role: 'Follow-up Appointments',
      phone: '555-200-1111',
      avatarType: 'icon',
      avatarIcon: 'calendar_month',
      iconBg: '#f0f4f3',
      iconColor: '#085041',
    },
    {
      id: 'billing',
      name: 'Patient Services',
      role: 'Billing & Insurance',
      phone: '555-200-2222',
      avatarType: 'icon',
      avatarIcon: 'receipt_long',
      iconBg: '#f0f4f3',
      iconColor: '#085041',
    },
  ];

  const contacts = activeTab === 'my-team' ? myTeamContacts : hospitalContacts;

  return (
    <div className="flex flex-col h-full bg-warm-oatmeal">
      {/* Sticky header */}
      <div
        className="bg-white shadow-[0_2px_4px_rgba(8,80,65,0.08)] sticky top-0 z-10 shrink-0"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-forest-slate text-2xl font-bold tracking-tight flex-1 text-center">
            Care Team
          </h1>
        </div>
        {/* Segmented control */}
        <div className="px-4 pb-4">
          <div className="flex h-10 w-full items-center justify-center rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab('my-team')}
              className={`flex h-full grow items-center justify-center rounded-md px-2 text-sm font-semibold transition-all
                ${activeTab === 'my-team' ? 'bg-white shadow-sm text-forest-slate' : 'text-sage-muted'}`}
            >
              My Team
            </button>
            <button
              onClick={() => setActiveTab('hospital')}
              className={`flex h-full grow items-center justify-center rounded-md px-2 text-sm font-semibold transition-all
                ${activeTab === 'hospital' ? 'bg-white shadow-sm text-forest-slate' : 'text-sage-muted'}`}
            >
              Hospital Directory
            </button>
          </div>
        </div>
      </div>

      {/* Contact list */}
      <main
        className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        {contacts.map((contact) => (
          <ContactCardItem key={contact.id} contact={contact} />
        ))}
      </main>
    </div>
  );
}
