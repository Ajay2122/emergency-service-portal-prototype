import { MapPin, Building2, AlertCircle } from 'lucide-react';
import type { Job } from '../../types';
import UrgencyBadge from '../common/UrgencyBadge';

const URGENCY_BORDER: Record<Job['urgency'], string> = {
  Critical: '#e8401a',
  High:     '#f97316',
  Medium:   '#fbbf24',
  Low:      '#dde5f5',
};

function jobAge(createdAt: string): { label: string; color: string; bg: string; overdue: boolean } {
  const diffMs  = Date.now() - new Date(createdAt.replace(' ', 'T')).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 60)  return { label: `${diffMin}m`,  color: '#059669', bg: '#ecfdf5', overdue: false };
  if (diffHr  < 6)   return { label: `${diffHr}h`,   color: '#d97706', bg: '#fffbeb', overdue: false };
  if (diffHr  < 24)  return { label: `${diffHr}h`,   color: '#ea580c', bg: '#fff4ed', overdue: true  };
  return               { label: `${diffDay}d`,        color: '#dc2626', bg: '#fff0ed', overdue: true  };
}

export default function StaffJobCard({ job, onClick }: { job: Job; onClick: () => void }) {
  const border = URGENCY_BORDER[job.urgency];
  const age    = jobAge(job.createdAt);
  const warn   = age.overdue && job.status !== 'Completed' && (job.urgency === 'Critical' || job.urgency === 'High');

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl transition-all duration-150 hover:shadow-md hover:-translate-y-px"
      style={{
        border: '1px solid #e8edf7',
        borderLeft: `3px solid ${border}`,
      }}
    >
      <div className="p-3.5">
        {/* ID + urgency */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono" style={{ color: '#b0bdd0' }}>{job.id}</span>
          <UrgencyBadge urgency={job.urgency} size="sm" />
        </div>

        {/* Customer */}
        <p className="text-sm font-semibold truncate mb-0.5" style={{ color: '#0e2040' }}>
          {job.customerName}
        </p>

        {/* Service */}
        <p className="text-xs truncate mb-2.5" style={{ color: '#64748b' }}>
          {job.serviceType}
        </p>

        {/* Location + age */}
        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-1 text-xs truncate" style={{ color: '#94a3b8' }}>
            <MapPin className="w-3 h-3 shrink-0" style={{ color: '#c8d3e8' }} />
            <span className="truncate">{job.location}</span>
          </span>
          <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0"
            style={{ background: age.bg, color: age.color }}>
            {warn && <AlertCircle className="w-2.5 h-2.5" />}
            {age.label}
          </span>
        </div>

        {/* Vendor */}
        {job.assignedVendor && (
          <div className="mt-2.5 pt-2.5 flex items-center gap-1.5" style={{ borderTop: '1px solid #f0f4fb' }}>
            <Building2 className="w-3 h-3 shrink-0" style={{ color: '#c8d3e8' }} />
            <span className="text-xs truncate" style={{ color: '#64748b' }}>{job.assignedVendor}</span>
          </div>
        )}
      </div>
    </button>
  );
}
