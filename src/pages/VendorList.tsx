import { useState, useMemo } from 'react';
import { Phone, Mail, MapPin, Briefcase, CheckCircle2, ArrowRight, Inbox, Search, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { getVendorCategory, CATEGORY_STYLE } from '../components/vendor/VendorCard';
import type { Vendor } from '../types';

const ACTIVE_STATUSES = new Set(['New', 'Assigned', 'Accepted', 'In Progress']);
const FILTERS = ['All', 'Plumbing', 'HVAC', 'Electrical', 'Gas'] as const;

export default function VendorList() {
  const { vendors, jobs } = useJobs();
  const [query, setQuery]       = useState('');
  const [category, setCategory] = useState<string>('All');

  const vendorCounts = useMemo(() => {
    const map: Record<string, { active: number; completed: number; total: number }> = {};
    vendors.forEach(v => { map[v.id] = { active: 0, completed: 0, total: 0 }; });
    jobs.forEach(j => {
      if (!j.assignedVendorId || !map[j.assignedVendorId]) return;
      map[j.assignedVendorId].total++;
      if (j.status === 'Completed') map[j.assignedVendorId].completed++;
      else if (ACTIVE_STATUSES.has(j.status)) map[j.assignedVendorId].active++;
    });
    return map;
  }, [vendors, jobs]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return vendors.filter(v => {
      const matchesQuery = !q || v.name.toLowerCase().includes(q) ||
        v.location.toLowerCase().includes(q) ||
        v.specialty.some(s => s.toLowerCase().includes(q));
      const matchesCat = category === 'All' || getVendorCategory(v.specialty) === category;
      return matchesQuery && matchesCat;
    });
  }, [vendors, query, category]);

  const maxLoad = useMemo(() => Math.max(...Object.values(vendorCounts).map(c => c.active), 1), [vendorCounts]);

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ background: '#f0f4fb' }}>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={{ background: '#0e2040' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <h1 className="text-xl font-bold text-white mb-4">Vendors</h1>

          {/* Search + filters */}
          <div className="bg-white rounded-xl p-3 space-y-2.5" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#c4cfe0' }} />
              <input
                type="text" value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Search by name, specialty, or location…"
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg outline-none"
                style={{ background: '#f8faff', border: '1px solid #e2e9f7', color: '#0e2040' }}
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTERS.map(f => (
                <button key={f} onClick={() => setCategory(f)}
                  className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                  style={category === f
                    ? { background: '#0e2040', color: 'white' }
                    : { background: '#f0f4fb', color: '#64748b', border: '1px solid #e2e9f7' }}>
                  {f}
                </button>
              ))}
              {(query || category !== 'All') && (
                <button onClick={() => { setQuery(''); setCategory('All'); }}
                  className="ml-auto text-xs font-medium px-3 py-1 rounded-full"
                  style={{ color: '#94a3b8' }}>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Vendor rows ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#e2e9f7' }}>
                <Inbox className="w-6 h-6" style={{ color: '#94a3b8' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#0e2040' }}>No vendors match your search</p>
              <button onClick={() => { setQuery(''); setCategory('All'); }}
                className="text-xs font-semibold px-4 py-2 rounded-lg"
                style={{ background: '#0e2040', color: 'white' }}>
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium mb-4" style={{ color: '#94a3b8' }}>
                {filtered.length === vendors.length ? `${vendors.length} vendors` : `${filtered.length} of ${vendors.length}`}
              </p>
              <div className="space-y-2">
                {filtered.map(v => (
                  <VendorRow
                    key={v.id} vendor={v}
                    activeCount={vendorCounts[v.id]?.active ?? 0}
                    completedCount={vendorCounts[v.id]?.completed ?? 0}
                    totalCount={vendorCounts[v.id]?.total ?? 0}
                    maxLoad={maxLoad}
                  />
                ))}
              </div>
            </>
          )}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}

// ── Vendor row ──────────────────────────────────────────────────────────────
function VendorRow({ vendor, activeCount, completedCount, totalCount, maxLoad }: {
  vendor: Vendor; activeCount: number; completedCount: number; totalCount: number; maxLoad: number;
}) {
  const navigate = useNavigate();
  const category = getVendorCategory(vendor.specialty);
  const cat      = CATEGORY_STYLE[category] ?? CATEGORY_STYLE.General;
  const initials = vendor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const loadPct  = maxLoad > 0 ? Math.round((activeCount / maxLoad) * 100) : 0;

  return (
    <div
      className="bg-white rounded-xl cursor-pointer group transition-shadow hover:shadow-md"
      style={{ border: '1px solid #e8edf7', borderLeft: `4px solid ${cat.stripe}` }}
      onClick={() => navigate(`/vendors/${vendor.id}`)}
    >
      <div className="flex flex-wrap items-center gap-5 px-5 py-4">

        {/* Avatar + identity */}
        <div className="flex items-center gap-3.5 min-w-[190px] flex-1">
          <div className="relative w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: `${cat.stripe}15`, color: cat.stripe }}>
            {initials}
            {activeCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
                style={{ background: '#22c55e' }} />
            )}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#0e2040' }}>{vendor.name}</p>
            <span className="inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: cat.bg, color: cat.text }}>
              {category}
            </span>
          </div>
        </div>

        {/* Specialties */}
        <div className="hidden md:flex flex-wrap gap-1 items-center min-w-[160px] flex-1">
          <Tag className="w-3 h-3 shrink-0" style={{ color: '#c4cfe0' }} />
          {vendor.specialty.map(s => (
            <span key={s} className="text-[10px] px-1.5 py-0.5 rounded"
              style={{ background: '#f0f4fb', color: '#64748b' }}>
              {s}
            </span>
          ))}
        </div>

        {/* Contact */}
        <div className="hidden lg:flex flex-col gap-1 min-w-[170px] text-xs" style={{ color: '#64748b' }}>
          <div className="flex items-center gap-1.5">
            <Phone className="w-3 h-3 shrink-0" style={{ color: cat.stripe }} />{vendor.phone}
          </div>
          <div className="flex items-center gap-1.5 truncate" style={{ color: '#94a3b8' }}>
            <Mail className="w-3 h-3 shrink-0" style={{ color: '#c4cfe0' }} />
            <span className="truncate max-w-[150px]">{vendor.email}</span>
          </div>
          <div className="flex items-center gap-1.5" style={{ color: '#94a3b8' }}>
            <MapPin className="w-3 h-3 shrink-0" style={{ color: '#c4cfe0' }} />{vendor.location}
          </div>
        </div>

        {/* Workload */}
        <div className="flex flex-col gap-1.5 min-w-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#94a3b8' }}>Workload</span>
            <span className="text-[10px] font-semibold" style={{ color: cat.stripe }}>{activeCount} active</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: '#f0f4fb' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${loadPct}%`, background: cat.stripe, minWidth: loadPct > 0 ? '4px' : '0' }} />
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: activeCount > 0 ? '#f97316' : '#c4cfe0' }}>
              <Briefcase className="w-3 h-3" />{activeCount}
            </span>
            <span className="flex items-center gap-1 text-xs font-medium" style={{ color: completedCount > 0 ? '#10b981' : '#c4cfe0' }}>
              <CheckCircle2 className="w-3 h-3" />{completedCount}
            </span>
            <span className="text-[10px]" style={{ color: '#c4cfe0' }}>/ {totalCount}</span>
          </div>
        </div>

        {/* Arrow */}
        <ArrowRight className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: cat.stripe }} />
      </div>
    </div>
  );
}
