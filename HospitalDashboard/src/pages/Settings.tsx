import TopBar from '../components/layout/TopBar';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const profile = useAuthStore((s) => s.profile);
  const email = useAuthStore((s) => s.email);

  const roleLabel =
    profile?.role === 'care_coordinator'
      ? 'Care Coordinator'
      : profile?.role === 'quality_director'
        ? 'Quality Director'
        : profile?.role === 'admin'
          ? 'Admin'
          : 'Coordinator';

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Settings" />
      <div className="flex-1 p-6 overflow-auto max-w-2xl">
        <div className="bg-white rounded-lg border border-slate-200 divide-y divide-slate-100">
          {/* Account */}
          <div className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 font-sans mb-4">Account</h3>
            <div className="space-y-3 text-sm font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500">Name</span>
                <span className="font-medium text-slate-800">{profile?.display_name ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email</span>
                <span className="font-medium text-slate-800">{email ?? '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Role</span>
                <span className="font-medium text-slate-800">{roleLabel}</span>
              </div>
            </div>
          </div>

          {/* Session */}
          <div className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 font-sans mb-4">Session &amp; Security</h3>
            <div className="space-y-3 text-sm font-sans">
              <div className="flex justify-between">
                <span className="text-slate-500">Session timeout</span>
                <span className="font-medium text-slate-800">15 minutes inactivity</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Token storage</span>
                <span className="font-medium text-slate-800">In-memory only (HIPAA)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Auto-refresh interval</span>
                <span className="font-medium text-slate-800">Every 2 minutes</span>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="p-5">
            <h3 className="text-sm font-semibold text-slate-700 font-sans mb-4">Notifications</h3>
            <div className="space-y-3">
              {[
                { label: 'Red alert notifications', desc: 'Browser alerts when a patient escalates to RED' },
                { label: 'Shift summary email', desc: 'Daily 8 AM digest of patient status changes' },
                { label: 'SDOH referral updates', desc: 'Notify when community resource referral is complete' },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-700 font-sans">{n.label}</div>
                    <div className="text-xs text-slate-400 font-sans">{n.desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-forest w-4 h-4 cursor-pointer"
                    aria-label={n.label}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-sans mt-4 text-center">
          Avyay Health Coordinator Dashboard · HIPAA-compliant · v0.1.0
        </p>
      </div>
    </div>
  );
}
