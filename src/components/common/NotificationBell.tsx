import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import type { Notification } from '../../types';
import { useNavigate } from 'react-router-dom';

const TYPE_ICONS: Record<Notification['type'], React.ReactNode> = {
  info:    <Info className="w-4 h-4" style={{ color: '#3b82f6' }} />,
  success: <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />,
  warning: <AlertTriangle className="w-4 h-4" style={{ color: '#f59e0b' }} />,
  error:   <XCircle className="w-4 h-4" style={{ color: '#e8401a' }} />,
};

export default function NotificationBell() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef        = useRef<HTMLDivElement>(null);
  const navigate        = useNavigate();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleNotifClick(notif: Notification) {
    markRead(notif.id);
    if (notif.jobId) navigate(`/jobs/${notif.jobId}`);
    setOpen(false);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className="relative p-2 rounded-lg transition-colors"
        style={{ color: 'rgba(255,255,255,0.5)' }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.color = 'white';
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 w-4 h-4 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse"
            style={{ background: '#e8401a' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[min(320px,calc(100vw-1rem))] bg-white rounded-2xl shadow-2xl z-50 overflow-hidden"
          style={{ border: '1.5px solid #e2e9f7', boxShadow: '0 16px 40px rgba(14,32,64,0.16)' }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: '#f8faff', borderBottom: '1.5px solid #eef2fb' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold" style={{ color: '#0e2040' }}>Notifications</span>
              {unreadCount > 0 && (
                <span
                  className="px-1.5 py-0.5 text-xs font-semibold rounded-full"
                  style={{ background: '#fff0ed', color: '#e8401a' }}
                >
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-semibold transition-colors"
                style={{ color: '#0e2040' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = '#e8401a'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = '#0e2040'}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-sm" style={{ color: '#94a3b8' }}>No notifications</div>
            ) : (
              notifications.map(notif => (
                <button
                  key={notif.id}
                  onClick={() => handleNotifClick(notif)}
                  className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b last:border-0"
                  style={{
                    background: !notif.read ? '#f8faff' : 'white',
                    borderColor: '#f0f4fb',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = '#f0f4fb'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = !notif.read ? '#f8faff' : 'white'}
                >
                  <div className="mt-0.5 shrink-0">{TYPE_ICONS[notif.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className="text-xs font-semibold leading-snug"
                        style={{ color: !notif.read ? '#0e2040' : '#64748b' }}
                      >
                        {notif.title}
                      </p>
                      {!notif.read && (
                        <span className="mt-1 w-2 h-2 rounded-full shrink-0" style={{ background: '#e8401a' }} />
                      )}
                    </div>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: '#64748b' }}>{notif.message}</p>
                    <p className="text-[10px] mt-1" style={{ color: '#94a3b8' }}>{notif.timestamp}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
