import type { Urgency } from '../../types';

// Critical pulsing dot — motion demands attention before text is read
const STYLES: Record<Urgency, { bg: string; text: string; dot: string; ring: string }> = {
  Critical: { bg: '#fff0ed', text: '#e8401a', dot: '#e8401a', ring: '#fecdbd' },
  High:     { bg: '#fff7ed', text: '#c2410c', dot: '#f97316', ring: '#fed7aa' },
  Medium:   { bg: '#fffbeb', text: '#92400e', dot: '#fbbf24', ring: '#fde68a' },
  Low:      { bg: '#f8faff', text: '#64748b', dot: '#94a3b8', ring: '#dde5f5' },
};

interface Props {
  urgency: Urgency;
  size?: 'sm' | 'md' | 'lg';
}

export default function UrgencyBadge({ urgency, size = 'md' }: Props) {
  const s = STYLES[urgency];
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
        className={`w-1.5 h-1.5 rounded-full ${urgency === 'Critical' ? 'animate-pulse' : ''}`}
        style={{ background: s.dot }}
      />
      {urgency}
    </span>
  );
}
