// Toast: non-blocking feedback for status changes.
// Appears bottom-right (staff) — out of the way of main content.
// Auto-dismisses after 4s so dispatchers aren't interrupted.
import { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

const ICONS = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info:    <Info className="w-5 h-5 text-blue-500" />,
  error:   <XCircle className="w-5 h-5 text-red-500" />,
};

const BORDER = {
  success: 'border-l-4 border-green-500',
  warning: 'border-l-4 border-amber-500',
  info:    'border-l-4 border-blue-500',
  error:   'border-l-4 border-red-500',
};

interface SingleToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

function SingleToast({ toast, onDismiss }: SingleToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Mount animation
    const showTimer = setTimeout(() => setVisible(true), 10);
    // Auto-dismiss after 4s
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(toast.id), 300);
    }, 4000);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`bg-white rounded-lg shadow-lg ${BORDER[toast.type]} p-4 flex items-start gap-3 min-w-72 max-w-sm
        transition-all duration-300 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
    >
      <div className="mt-0.5 shrink-0">{ICONS[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{toast.title}</p>
        <p className="text-xs text-slate-500 mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <SingleToast toast={t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
