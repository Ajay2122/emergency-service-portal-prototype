import { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { Zap, LayoutDashboard, ChevronDown, Store } from 'lucide-react';

import { JobProvider } from './context/JobContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { useJobs } from './context/JobContext';

import StaffDashboard from './pages/StaffDashboard';
import StaffJobDetail from './pages/StaffJobDetail';
import VendorPortal from './pages/VendorPortal';
import VendorJobDetail from './pages/VendorJobDetail';
import VendorList from './pages/VendorList';
import VendorDetail from './pages/VendorDetail';
import { ToastContainer } from './components/common/Toast';
import type { ToastMessage } from './components/common/Toast';
import NotificationBell from './components/common/NotificationBell';

function AppShell() {
  const { notifications }  = useNotifications();
  const { vendors }        = useJobs();
  const navigate           = useNavigate();
  const [toasts, setToasts]         = useState<ToastMessage[]>([]);
  const [vendorOpen, setVendorOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Toast bridge
  const prevNotifLen = useRef(notifications.length);
  useEffect(() => {
    if (notifications.length > prevNotifLen.current) {
      const latest = notifications[0];
      setToasts(prev => [...prev, {
        id:      `toast-${latest.id}`,
        title:   latest.title,
        message: latest.message,
        type:    latest.type,
      }]);
    }
    prevNotifLen.current = notifications.length;
  }, [notifications]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!vendorOpen) return;
    function onDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setVendorOpen(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [vendorOpen]);

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const navBase = 'flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-lg text-sm font-medium transition-colors';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#f0f4fb' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="shrink-0 z-40" style={{ background: '#0e2040', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-5 h-14">

          {/* Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#e8401a' }}>
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" fill="currentColor" />
            </div>
            <span className="text-white font-bold text-sm sm:text-base tracking-tight">DispatchIQ</span>
          </div>

          {/* Nav — icon only on mobile, icon+label on sm+ */}
          <nav className="flex items-center gap-0.5 sm:gap-1">
            <NavLink to="/" end className={navBase}
              style={({ isActive }) => isActive
                ? { background: 'rgba(255,255,255,0.1)', color: 'white' }
                : { color: 'rgba(255,255,255,0.45)' }}>
              <LayoutDashboard className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </NavLink>

            {/* Vendor portal dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setVendorOpen(v => !v)}
                className={navBase}
                style={vendorOpen
                  ? { background: 'rgba(255,255,255,0.1)', color: 'white' }
                  : { color: 'rgba(255,255,255,0.45)' }}>
                <Store className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Vendor Portal</span>
                <ChevronDown className="hidden sm:block w-3 h-3" style={{
                  transform: vendorOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 150ms',
                }} />
              </button>

              {vendorOpen && (
                <div className="absolute top-full right-0 sm:left-0 mt-1.5 w-52 rounded-xl shadow-xl py-1 z-50"
                  style={{ background: 'white', border: '1px solid #e2e9f7' }}>
                  <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{ color: '#94a3b8' }}>
                    Sign in as vendor
                  </p>
                  {vendors.map(v => (
                    <button key={v.id}
                      onClick={() => { navigate(`/vendor/${v.id}`); setVendorOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-sm font-medium flex items-center gap-2.5 transition-colors hover:bg-slate-50">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
                        style={{ background: '#f0f4fb', color: '#0e2040' }}>
                        {v.name.charAt(0)}
                      </div>
                      <span className="truncate" style={{ color: '#0e2040' }}>{v.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right */}
          <NotificationBell />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-0">
        <Routes>
          <Route path="/"                                   element={<StaffDashboard />} />
          <Route path="/jobs/:id"                           element={<StaffJobDetail />} />
          <Route path="/vendors"                            element={<VendorList />} />
          <Route path="/vendors/:vendorId"                  element={<VendorDetail />} />
          <Route path="/vendor/:vendorId"                   element={<VendorPortal />} />
          <Route path="/vendor/:vendorId/jobs/:jobId"       element={<VendorJobDetail />} />
          <Route path="*"                                   element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <JobProvider>
        <NotificationProvider>
          <AppShell />
        </NotificationProvider>
      </JobProvider>
    </BrowserRouter>
  );
}
