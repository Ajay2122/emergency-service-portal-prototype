import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Briefcase, CheckCircle2, ArrowRight } from 'lucide-react';
import type { Vendor } from '../../types';

export function getVendorCategory(specialty: string[]): string {
  const s = specialty[0]?.toLowerCase() ?? '';
  if (s.includes('plumb') || s.includes('pipe') || s.includes('sewage') || s.includes('flood') || s.includes('water') || s.includes('frozen')) return 'Plumbing';
  if (s.includes('hvac') || s.includes('heat') || s.includes('cool') || s.includes('ac') || s.includes('mold')) return 'HVAC';
  if (s.includes('electric') || s.includes('panel') || s.includes('power')) return 'Electrical';
  if (s.includes('gas')) return 'Gas';
  if (s.includes('roof') || s.includes('restor')) return 'Restoration';
  return 'General';
}

export const CATEGORY_STYLE: Record<string, { bg: string; text: string; ring: string; stripe: string }> = {
  Plumbing:    { bg: '#eff6ff', text: '#1d4ed8', ring: '#bfdbfe', stripe: '#3b82f6' },
  HVAC:        { bg: '#fff7ed', text: '#c2410c', ring: '#fed7aa', stripe: '#f97316' },
  Electrical:  { bg: '#fffbeb', text: '#92400e', ring: '#fde68a', stripe: '#f59e0b' },
  Gas:         { bg: '#fef2f2', text: '#b91c1c', ring: '#fecaca', stripe: '#ef4444' },
  Restoration: { bg: '#f0fdf4', text: '#166534', ring: '#bbf7d0', stripe: '#22c55e' },
  General:     { bg: '#f8faff', text: '#475569', ring: '#e2e9f7', stripe: '#94a3b8' },
};

interface Props {
  vendor: Vendor;
  activeCount: number;
  completedCount: number;
}

export default function VendorCard({ vendor, activeCount, completedCount }: Props) {
  const navigate   = useNavigate();
  const [hovered, setHovered] = useState(false);
  const category   = getVendorCategory(vendor.specialty);
  const cat        = CATEGORY_STYLE[category] ?? CATEGORY_STYLE.General;
  const initials   = vendor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      className="bg-white rounded-2xl flex flex-col transition-all duration-150"
      style={{
        border: `1px solid ${hovered ? cat.ring : '#e2e9f7'}`,
        boxShadow: hovered ? `0 8px 24px rgba(14,32,64,0.10)` : '0 1px 4px rgba(14,32,64,0.06)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Category stripe */}
      <div className="h-1 rounded-t-2xl" style={{ background: cat.stripe }} />

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Identity row */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
            style={{ background: `${cat.stripe}18`, color: cat.stripe }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-sm leading-tight" style={{ color: '#0e2040' }}>
              {vendor.name}
            </p>
            <span
              className="inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: cat.bg, color: cat.text, boxShadow: `0 0 0 1px ${cat.ring}` }}
            >
              {category}
            </span>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5">
          {vendor.specialty.map(s => (
            <span key={s} className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ background: '#f0f4fb', color: '#64748b' }}>
              {s}
            </span>
          ))}
        </div>

        {/* Contact */}
        <div className="space-y-1.5 text-xs" style={{ color: '#64748b' }}>
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 shrink-0" style={{ color: '#c4cfe0' }} />
            {vendor.location}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: '#c4cfe0' }} />
            {vendor.phone}
          </div>
          <div className="flex items-center gap-2 truncate">
            <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: '#c4cfe0' }} />
            <span className="truncate">{vendor.email}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="rounded-xl px-3 py-2.5 text-center"
            style={{
              background: activeCount > 0 ? '#fff7ed' : '#f8faff',
              border: `1px solid ${activeCount > 0 ? '#fed7aa' : '#e2e9f7'}`,
            }}>
            <div className="flex items-center justify-center gap-1">
              <Briefcase className="w-3 h-3" style={{ color: activeCount > 0 ? '#f97316' : '#c4cfe0' }} />
              <span className="text-base font-black" style={{ color: activeCount > 0 ? '#c2410c' : '#94a3b8' }}>
                {activeCount}
              </span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: '#94a3b8' }}>Active</p>
          </div>
          <div className="rounded-xl px-3 py-2.5 text-center"
            style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3 h-3" style={{ color: '#16a34a' }} />
              <span className="text-base font-black" style={{ color: '#166534' }}>{completedCount}</span>
            </div>
            <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5" style={{ color: '#94a3b8' }}>Done</p>
          </div>
        </div>
      </div>

      {/* CTA footer */}
      <button
        onClick={() => navigate(`/vendors/${vendor.id}`)}
        className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold rounded-b-2xl transition-all duration-150"
        style={{
          borderTop: '1px solid #f0f4fb',
          background: hovered ? cat.bg : 'transparent',
          color: cat.text,
        }}
      >
        View Profile <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
