import type { JobStatus } from '../../types';

const STYLES: Record<JobStatus, { bg: string; text: string; dot: string; ring: string }> = {
  'New':         { bg: '#eff8ff', text: '#0369a1', dot: '#38bdf8', ring: '#bae6fd' },
  'Assigned':    { bg: '#f5f3ff', text: '#6d28d9', dot: '#a78bfa', ring: '#ddd6fe' },
  'Accepted':    { bg: '#fffbeb', text: '#92400e', dot: '#fbbf24', ring: '#fde68a' },
  'In Progress': { bg: '#fff7ed', text: '#c2410c', dot: '#f97316', ring: '#fed7aa' },
  'Completed':   { bg: '#ecfdf5', text: '#065f46', dot: '#34d399', ring: '#a7f3d0' },
};

interface Props {
  status: JobStatus;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, size = 'md' }: Props) {
  const s = STYLES[status];
  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : size === 'lg'
    ? 'px-3 py-1.5 text-sm font-semibold'
    : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClass}`}
      style={{ background: s.bg, color: s.text, boxShadow: `0 0 0 1px ${s.ring}` }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${status === 'In Progress' ? 'animate-pulse' : ''}`}
        style={{ background: s.dot }}
      />
      {status}
    </span>
  );
}
