import type { TimelineEvent } from '../../types';
import {
  PlusCircle, UserCheck, Wrench, CheckCircle2,
  StickyNote, AlertCircle, Camera, XCircle,
} from 'lucide-react';

const EVENT_META: Record<TimelineEvent['type'], { icon: React.ReactNode; bg: string; border: string }> = {
  created:        { icon: <PlusCircle className="w-4 h-4" style={{ color: '#3b82f6' }} />,  bg: '#eff8ff', border: '#bae6fd' },
  assigned:       { icon: <UserCheck className="w-4 h-4" style={{ color: '#7c3aed' }} />,   bg: '#f5f3ff', border: '#ddd6fe' },
  accepted:       { icon: <UserCheck className="w-4 h-4" style={{ color: '#d97706' }} />,   bg: '#fffbeb', border: '#fde68a' },
  declined:       { icon: <XCircle className="w-4 h-4" style={{ color: '#dc2626' }} />,     bg: '#fef2f2', border: '#fecaca' },
  status_update:  { icon: <Wrench className="w-4 h-4" style={{ color: '#f97316' }} />,      bg: '#fff7ed', border: '#fed7aa' },
  note_added:     { icon: <StickyNote className="w-4 h-4" style={{ color: '#64748b' }} />,  bg: '#f8faff', border: '#dde5f5' },
  completed:      { icon: <CheckCircle2 className="w-4 h-4" style={{ color: '#10b981' }} />, bg: '#ecfdf5', border: '#a7f3d0' },
  photo_uploaded: { icon: <Camera className="w-4 h-4" style={{ color: '#64748b' }} />,      bg: '#f8faff', border: '#dde5f5' },
};

interface Props { events: TimelineEvent[]; }

export default function Timeline({ events }: Props) {
  const sorted = [...events].reverse();

  if (sorted.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-8" style={{ color: '#94a3b8' }}>
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">No activity yet</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Connector line */}
      <div
        className="absolute top-5 bottom-2"
        style={{ left: '15px', width: '1px', background: '#e2e9f7' }}
      />

      <div className="space-y-4">
        {sorted.map(event => {
          const meta = EVENT_META[event.type];
          return (
            <div key={event.id} className="relative flex gap-3">
              <div
                className="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: meta.bg, boxShadow: `0 0 0 1px ${meta.border}` }}
              >
                {meta.icon}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <p className="text-sm font-medium leading-snug" style={{ color: '#0e2040' }}>
                  {event.message}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: '#64748b' }}>{event.actor}</span>
                  <span style={{ color: '#c8d3e8' }}>·</span>
                  <span className="text-xs" style={{ color: '#94a3b8' }}>{event.timestamp}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
