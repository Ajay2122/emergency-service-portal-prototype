import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Inbox, ExternalLink, Search, MapPin, Clock } from 'lucide-react';
import type { Job } from '../../types';
import UrgencyBadge from '../common/UrgencyBadge';
import StatusBadge from '../common/StatusBadge';

const TABS = ['All', 'Active', 'Completed'] as const;
type Tab = typeof TABS[number];
const ACTIVE_STATUSES = new Set(['Assigned', 'Accepted', 'In Progress', 'New']);

const URGENCY_BORDER: Record<string, string> = {
  Critical: '#e8401a', High: '#f97316', Medium: '#f59e0b', Low: '#6366f1',
};

function fmtDate(dt: string) {
  const [date, time] = dt.split(' ');
  const [, m, d] = date.split('-');
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[+m]} ${+d} · ${time}`;
}

interface Props { jobs: Job[]; dark?: boolean; }

export default function VendorJobsTable({ jobs, dark }: Props) {
  const cardBg      = dark ? 'rgba(13,26,53,0.8)'        : '#ffffff';
  const cardBorder  = dark ? 'rgba(255,255,255,0.07)'    : '#e2e9f7';
  const headerBg    = dark ? 'rgba(255,255,255,0.03)'    : '#ffffff';
  const headerBdr   = dark ? 'rgba(255,255,255,0.06)'    : '#f0f4fb';
  const tabBg       = dark ? 'rgba(255,255,255,0.05)'    : '#f0f4fb';
  const tabActive   = dark ? 'rgba(255,255,255,0.1)'     : '#ffffff';
  const tabColor    = dark ? 'rgba(255,255,255,0.85)'    : '#0e2040';
  const tabIdle     = dark ? 'rgba(148,163,184,0.5)'     : '#94a3b8';
  const titleColor  = dark ? '#ffffff'                   : '#0e2040';
  const inputBg     = dark ? 'rgba(255,255,255,0.05)'    : '#f8faff';
  const inputBdr    = dark ? 'rgba(255,255,255,0.08)'    : '#e2e9f7';
  const inputColor  = dark ? 'white'                     : '#0e2040';
  const rowHover    = dark ? 'rgba(255,255,255,0.03)'    : '#fafbff';
  const dividerClr  = dark ? 'rgba(255,255,255,0.04)'    : '#f8faff';
  const [tab, setTab]     = useState<Tab>('All');
  const [query, setQuery] = useState('');
  const navigate          = useNavigate();

  const byTab = useMemo(() => jobs.filter(j => {
    if (tab === 'Active')    return ACTIVE_STATUSES.has(j.status);
    if (tab === 'Completed') return j.status === 'Completed';
    return true;
  }), [jobs, tab]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return byTab;
    return byTab.filter(j =>
      j.id.toLowerCase().includes(q) ||
      j.customerName.toLowerCase().includes(q) ||
      j.serviceType.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q),
    );
  }, [byTab, query]);

  const activeCount    = useMemo(() => jobs.filter(j => ACTIVE_STATUSES.has(j.status)).length, [jobs]);
  const completedCount = useMemo(() => jobs.filter(j => j.status === 'Completed').length, [jobs]);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: dark ? '0 4px 24px rgba(0,0,0,0.3)' : '0 1px 4px rgba(14,32,64,0.06)' }}>

      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ background: headerBg, borderBottom: `1px solid ${headerBdr}` }}>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <h3 className="text-sm font-extrabold" style={{ color: titleColor }}>
            Assigned Jobs
            <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: dark ? 'rgba(255,255,255,0.08)' : '#f0f4fb', color: dark ? 'rgba(148,163,184,0.8)' : '#64748b' }}>
              {jobs.length}
            </span>
          </h3>
          <div className="flex items-center gap-1 rounded-lg p-0.5" style={{ background: tabBg }}>
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
                style={tab === t
                  ? { background: tabActive, color: tabColor, boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }
                  : { color: tabIdle }}>
                {t}
                {t === 'Active' && <span className="ml-1 text-[10px] font-bold" style={{ color: tab === t ? '#f97316' : 'rgba(148,163,184,0.3)' }}>{activeCount}</span>}
                {t === 'Completed' && <span className="ml-1 text-[10px] font-bold" style={{ color: tab === t ? '#34d399' : 'rgba(148,163,184,0.3)' }}>{completedCount}</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: dark ? 'rgba(148,163,184,0.4)' : '#94a3b8' }} />
          <input
            type="text" value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by job ID, customer, service type, or location…"
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl outline-none"
            style={{ background: inputBg, border: `1px solid ${inputBdr}`, color: inputColor }}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
            onBlur={e =>  { e.currentTarget.style.borderColor = inputBdr; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-14">
          <Inbox className="w-8 h-8" style={{ color: dark ? 'rgba(99,102,241,0.2)' : '#e2e9f7' }} />
          <p className="text-sm font-semibold" style={{ color: dark ? 'rgba(148,163,184,0.5)' : '#94a3b8' }}>
            {query ? 'No jobs match your search' : 'No jobs in this category'}
          </p>
          {query && (
            <button onClick={() => setQuery('')} className="text-xs font-semibold mt-1 px-3 py-1.5 rounded-lg"
              style={{ background: dark ? 'rgba(255,255,255,0.06)' : '#f0f4fb', color: dark ? 'rgba(148,163,184,0.7)' : '#64748b' }}>
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Job rows */}
      {filtered.length > 0 && (
        <div>
          {filtered.map((job, i) => {
            const accent  = URGENCY_BORDER[job.urgency] ?? '#94a3b8';
            const excerpt = job.description.length > 90 ? job.description.slice(0, 90).trimEnd() + '…' : job.description;
            const isLast  = i === filtered.length - 1;

            return (
              <div key={job.id}
                className="flex items-start gap-4 px-5 py-4 transition-colors"
                style={{
                  borderLeft: `3px solid ${accent}`,
                  borderBottom: isLast ? 'none' : `1px solid ${dividerClr}`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = rowHover; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <span className="font-mono text-xs font-bold" style={{ color: dark ? 'rgba(148,163,184,0.5)' : '#94a3b8' }}>{job.id}</span>
                    <UrgencyBadge urgency={job.urgency} size="sm" />
                    <StatusBadge status={job.status} size="sm" />
                  </div>
                  <p className="text-sm font-extrabold leading-snug" style={{ color: dark ? '#ffffff' : '#0e2040' }}>{job.serviceType}</p>
                  <p className="text-xs font-medium mt-0.5" style={{ color: dark ? 'rgba(148,163,184,0.7)' : '#64748b' }}>{job.customerName}</p>
                  <p className="text-xs mt-1.5 leading-relaxed" style={{ color: dark ? 'rgba(148,163,184,0.45)' : '#94a3b8' }}>{excerpt}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: dark ? 'rgba(148,163,184,0.4)' : '#94a3b8' }}>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" style={{ color: accent }} />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{fmtDate(job.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/jobs/${job.id}`)}
                  className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl shrink-0 transition-all"
                  style={dark
                    ? { background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }
                    : { background: '#f5f3ff', color: '#6366f1', border: '1px solid #ede9fe' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = dark ? 'rgba(99,102,241,0.2)' : '#ede9fe'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = dark ? 'rgba(99,102,241,0.12)' : '#f5f3ff'; }}
                >
                  View Job <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="px-5 py-3" style={{ borderTop: `1px solid ${dividerClr}` }}>
          <p className="text-[11px]" style={{ color: dark ? 'rgba(148,163,184,0.35)' : '#94a3b8' }}>
            {filtered.length} job{filtered.length !== 1 ? 's' : ''}{query ? ` matching "${query}"` : ` in ${tab.toLowerCase()} view`}
          </p>
        </div>
      )}
    </div>
  );
}
