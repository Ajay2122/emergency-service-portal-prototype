import { useState, useMemo } from 'react';
import { AlertOctagon, Clock, CheckCircle2, Layers, Search, X } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import KanbanColumn from '../components/staff/KanbanColumn';
import type { Job, JobStatus, Urgency } from '../types';

const COLUMNS: JobStatus[] = ['New', 'Assigned', 'Accepted', 'In Progress', 'Completed'];

export default function StaffDashboard() {
  const { jobs } = useJobs();
  const [search, setSearch]               = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | 'All'>('All');

  const stats = useMemo(() => ({
    critical: jobs.filter(j => j.urgency === 'Critical' && j.status !== 'Completed').length,
    active:   jobs.filter(j => j.status === 'In Progress').length,
    new:      jobs.filter(j => j.status === 'New').length,
    done:     jobs.filter(j => j.status === 'Completed').length,
  }), [jobs]);

  const filtered = useMemo((): Job[] =>
    jobs.filter(job => {
      const matchSearch = !search || [
        job.id, job.customerName, job.serviceType, job.location, job.assignedVendor ?? '',
      ].some(f => f.toLowerCase().includes(search.toLowerCase()));
      return matchSearch && (urgencyFilter === 'All' || job.urgency === urgencyFilter);
    }), [jobs, search, urgencyFilter]);

  return (
    <div className="flex flex-col h-full">

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        <StatCard icon={<AlertOctagon className="w-4 h-4" />} label="Critical Active"  value={stats.critical} accent="#e8401a" pulse={stats.critical > 0} />
        <StatCard icon={<Layers className="w-4 h-4" />}       label="New Unassigned"   value={stats.new}      accent="#6366f1" />
        <StatCard icon={<Clock className="w-4 h-4" />}        label="In Progress"      value={stats.active}   accent="#f97316" />
        <StatCard icon={<CheckCircle2 className="w-4 h-4" />} label="Total Completed"  value={stats.done}     accent="#10b981" />
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 pb-3 sm:pb-4 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2">
        {/* Search — full width on mobile */}
        <div className="relative w-full sm:flex-1 sm:min-w-48 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: '#94a3b8' }} />
          <input
            type="text" placeholder="Search jobs, customers, vendors…"
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg outline-none"
            style={{ background: '#fff', border: '1px solid #e2e9f7', color: '#0e2040' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#94a3b8' }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Urgency filter chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['All', 'Critical', 'High', 'Medium', 'Low'] as (Urgency | 'All')[]).map(u => {
            const on = urgencyFilter === u;
            const dotColor: Record<string, string> = { Critical: '#e8401a', High: '#f97316', Medium: '#f59e0b', Low: '#6366f1', All: '#0e2040' };
            return (
              <button key={u} onClick={() => setUrgencyFilter(u)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                style={on
                  ? { background: '#0e2040', color: '#fff', border: '1px solid #0e2040' }
                  : { background: '#fff', color: '#64748b', border: '1px solid #e2e9f7' }}>
                {u !== 'All' && (
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: on ? '#fff' : dotColor[u] }} />
                )}
                {u}
              </button>
            );
          })}
          {(search || urgencyFilter !== 'All') && (
            <span className="text-xs px-2.5 py-1.5 rounded-lg" style={{ background: '#f0f4fb', color: '#94a3b8' }}>
              {filtered.length} / {jobs.length}
            </span>
          )}
        </div>
      </div>

      {/* ── Kanban Board ──────────────────────────────────────────────── */}
      <div className="flex-1 overflow-x-auto px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="flex gap-3 h-full" style={{ minWidth: 'max-content' }}>
          {COLUMNS.map(status => (
            <KanbanColumn key={status} status={status} jobs={filtered.filter(j => j.status === status)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent, pulse }: {
  icon: React.ReactNode; label: string; value: number;
  accent: string; pulse?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 flex items-center gap-3"
      style={{ border: '1px solid #e2e9f7', borderLeft: `3px solid ${accent}` }}>
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${pulse && value > 0 ? 'animate-pulse' : ''}`}
        style={{ background: `${accent}12`, color: accent }}>
        {icon}
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-bold leading-none" style={{ color: '#0e2040' }}>{value}</div>
        <div className="text-[10px] sm:text-[11px] font-medium mt-1" style={{ color: '#94a3b8' }}>{label}</div>
      </div>
    </div>
  );
}
