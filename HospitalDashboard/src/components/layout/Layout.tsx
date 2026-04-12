import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { DashboardProvider } from '../../context/DashboardContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DashboardProvider>
    <div className="flex h-screen bg-off-white overflow-hidden">
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — overlay on mobile, fixed on desktop */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile top bar with hamburger */}
        <div className="lg:hidden h-12 bg-white border-b border-slate-200 flex items-center px-4 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 -ml-1.5 rounded-md text-slate-600 hover:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-forest"
            aria-label="Open navigation"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </button>
          <div className="ml-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-forest rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                <path d="M16 28 C16 28 3 19 3 10.5 C3 6.91 5.91 4 9.5 4 C11.74 4 13.73 5.14 16 7.3 C18.27 5.14 20.26 4 22.5 4 C26.09 4 29 6.91 29 10.5 C29 19 16 28 16 28 Z" fill="white" />
                <rect x="14.6" y="9" width="2.8" height="9" rx="0.6" fill="#053027" />
                <rect x="11.5" y="12.1" width="9" height="2.8" rx="0.6" fill="#053027" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-forest font-sans">Avyay Health</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
    </DashboardProvider>
  );
}
