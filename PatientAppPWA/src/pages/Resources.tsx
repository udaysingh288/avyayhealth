import { useState } from 'react';
import { Phone, Globe, CheckCircle, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../components/shared/TopBar';
import { usePatientStore } from '../store/patientStore';
import { MOCK_RESOURCES } from '../utils/mockData';
import type { SDOHDomain, PatientSession } from '../types';
import { fullDate } from '../utils/dateUtils';

const domainLabels: Record<SDOHDomain, { label: string; emoji: string; description: string }> = {
  transportation: { label: 'Transportation', emoji: '🚗', description: 'Help getting to appointments' },
  food_insecurity: { label: 'Food support', emoji: '🥗', description: 'Meal delivery and food programs' },
  housing_instability: { label: 'Housing', emoji: '🏠', description: 'Stable housing resources' },
  utility_difficulty: { label: 'Utilities', emoji: '⚡', description: 'Electricity and heating assistance' },
  interpersonal_safety: { label: 'Safety', emoji: '🛡️', description: 'Safety and support services' },
};

export default function Resources() {
  const session = usePatientStore((s) => s.session);
  const resources = MOCK_RESOURCES;
  const [activeTab, setActiveTab] = useState<'referrals' | 'careTeam'>('referrals');

  return (
    <div className="flex flex-col h-full bg-off-white">
      <TopBar title="Resources & Care Team" />

      {/* Tabs */}
      <div className="bg-white border-b border-slate-100 px-5 flex gap-4 shrink-0">
        {([['referrals', 'My Referrals'], ['careTeam', 'Care Team']] as const).map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3.5 font-sans font-medium text-sm border-b-2 transition
              focus:outline-none
              ${activeTab === tab ? 'border-forest text-forest' : 'border-transparent text-slate-500'}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5">
        <AnimatePresence mode="wait">
          {activeTab === 'referrals' && (
            <motion.div
              key="referrals"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              {resources.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-3" aria-hidden="true">🤝</span>
                  <p className="font-sans text-slate-500 text-base">
                    No referrals yet. If you need community support, your care coordinator will connect you.
                  </p>
                </div>
              ) : (
                resources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))
              )}

              {/* Info note */}
              <div className="bg-forest-pale border border-forest/20 rounded-2xl p-4">
                <p className="font-sans text-forest/80 text-sm leading-relaxed">
                  Your care coordinator reviews your check-in responses and connects you with local resources when needed. All referrals are free.
                </p>
              </div>
            </motion.div>
          )}

          {activeTab === 'careTeam' && (
            <motion.div
              key="careTeam"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <CareTeamCard session={session} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ResourceCard({ resource }: { resource: typeof MOCK_RESOURCES[number] }) {
  const domainInfo = domainLabels[resource.domain];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-4 flex items-start gap-3 text-left
          focus:outline-none focus:ring-2 focus:ring-forest"
        aria-expanded={expanded}
      >
        <span className="text-2xl shrink-0" aria-hidden="true">{domainInfo.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-sans font-semibold text-slate-800 text-base">{resource.name}</span>
            {resource.referral_made && (
              <span className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-sans font-medium">
                Referred
              </span>
            )}
          </div>
          <p className="font-sans text-slate-500 text-sm">{domainInfo.description}</p>
        </div>
        <motion.span animate={{ rotate: expanded ? 90 : 0 }}>
          <ChevronRight size={18} className="text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
        </motion.span>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-slate-50 pt-3">
              <p className="font-sans text-slate-600 text-sm leading-relaxed">
                {resource.description}
              </p>

              {resource.referral_made && resource.referral_date && (
                <div className="flex items-center gap-2 text-sm font-sans">
                  <CheckCircle size={14} className="text-green-600 shrink-0" aria-hidden="true" />
                  <span className="text-green-700">
                    Referral made {fullDate(resource.referral_date)}
                  </span>
                </div>
              )}

              {!resource.referral_made && (
                <div className="flex items-center gap-2 text-sm font-sans">
                  <Clock size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
                  <span className="text-slate-500">Referral pending — your coordinator will follow up</span>
                </div>
              )}

              <div className="flex gap-2">
                {resource.phone && (
                  <a
                    href={`tel:${resource.phone.replace(/\D/g, '')}`}
                    className="flex items-center gap-1.5 bg-forest text-white font-sans font-semibold text-sm
                      px-4 py-2.5 rounded-xl active:bg-forest-light transition
                      focus:outline-none focus:ring-2 focus:ring-forest focus:ring-offset-2"
                  >
                    <Phone size={14} aria-hidden="true" />
                    {resource.phone}
                  </a>
                )}
                {resource.website && (
                  <span className="flex items-center gap-1.5 text-forest font-sans text-sm font-medium
                    px-4 py-2.5 rounded-xl border border-forest bg-forest-pale">
                    <Globe size={14} aria-hidden="true" />
                    {resource.website}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CareTeamCardProps {
  session: PatientSession | null;
}

function CareTeamCard({ session }: CareTeamCardProps) {
  const supportPhone = import.meta.env.VITE_HOSPITAL_SUPPORT_PHONE ?? '18005550100';

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 bg-forest-pale rounded-full flex items-center justify-center shrink-0">
            <span className="font-serif text-2xl text-forest">
              {session?.coordinator_first_name?.charAt(0) ?? 'S'}
            </span>
          </div>
          <div>
            <div className="font-sans font-semibold text-slate-800 text-lg">
              {session?.coordinator_first_name ?? 'Sarah'}, your coordinator
            </div>
            <div className="font-sans text-slate-500 text-sm">
              {session?.hospital_name ?? 'Your Hospital'}
            </div>
          </div>
        </div>

        <p className="font-sans text-slate-600 text-base leading-relaxed mb-4">
          {session?.coordinator_first_name ?? 'Your coordinator'} reviews your daily check-ins and will reach out if anything needs attention. They arranged your care referrals and can help with questions.
        </p>

        <a
          href={`tel:${supportPhone}`}
          className="flex items-center justify-center gap-2 w-full min-h-[56px] bg-forest text-white
            font-sans font-semibold text-base rounded-xl active:bg-forest-light transition
            focus:outline-none focus:ring-4 focus:ring-forest/30"
        >
          <Phone size={18} aria-hidden="true" />
          Call care team
        </a>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl shrink-0" aria-hidden="true">🆘</span>
          <div>
            <div className="font-sans font-semibold text-red-800 text-base mb-1">
              Having a medical emergency?
            </div>
            <p className="font-sans text-red-700 text-sm leading-relaxed mb-3">
              Don't call us — call 911 right away.
            </p>
            <a
              href="tel:911"
              className="flex items-center gap-2 font-sans font-semibold text-base text-white
                bg-red-600 px-5 py-3 rounded-xl active:bg-red-700 transition
                focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              <Phone size={16} aria-hidden="true" />
              Call 911
            </a>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-4">
        <h3 className="font-sans font-semibold text-slate-700 text-sm uppercase tracking-wide mb-3">
          Your program
        </h3>
        <div className="space-y-2">
          {[
            { label: 'Hospital', value: session?.hospital_name ?? 'Riverside Community Medical Center' },
            { label: 'Program length', value: '30 days after discharge' },
            { label: 'Check-in time', value: 'Every morning, 8:00 AM' },
            { label: 'Contact', value: 'diksha@avyayhealth.com' },
          ].map((item) => (
            <div key={item.label} className="flex justify-between text-sm font-sans">
              <span className="text-slate-400">{item.label}</span>
              <span className="text-slate-700 font-medium text-right max-w-[55%]">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
