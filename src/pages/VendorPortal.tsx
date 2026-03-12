import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Clock, ChevronRight, Inbox, Phone, Mail, Tag } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import type { Job, Urgency, JobStatus } from '../types';
import UrgencyBadge from '../components/common/UrgencyBadge';
import StatusBadge from '../components/common/StatusBadge';

const URGENCY_ORDER: Record<Urgency, number>   = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const STATUS_ORDER:  Record<JobStatus, number> = {
  'In Progress': 0, 'Accepted': 1, 'Assigned': 2, 'New': 3, 'Completed': 4,
};
const URGENCY_ACCENT: Record<Urgency, string> = {
  Critical: '#e8401a', High: '#f97316', Medium: '#f59e0b', Low: '#6366f1',
};

function fmtDate(dt: string) {
  const [date, time] = dt.split(' ');
  const [, m, d] = date.split('-');
  const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m]} ${+d} · ${time}`;
}

export default function VendorPortal() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const { getVendorJobs, vendors } = useJobs();
  const navigate = useNavigate();
  const vendor   = vendors.find(v => v.id === vendorId);

  const allJobs = getVendorJobs(vendorId ?? '');
  const jobs    = useMemo(() => (
    [...allJobs].sort((a, b) => {
      const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      return s !== 0 ? s : URGENCY_ORDER[a.urgency] - URGENCY_ORDER[b.urgency];
    })
  ), [allJobs]);

  const activeJobs    = jobs.filter(j => j.status === 'In Progress' || j.status === 'Accepted');
  const pendingJobs   = jobs.filter(j => j.status === 'Assigned'    || j.status === 'New');
  const completedJobs = jobs.filter(j => j.status === 'Completed');

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ background: '#f0f4fb' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ background: '#0e2040' }}>
        <div style={{ height: '2px', background: '#e8401a' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Vendor Portal</p>
              <h1 className="text-xl font-bold text-white">{vendor?.name ?? 'My Jobs'}</h1>
              {vendor?.specialty.length && (
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <Tag className="w-3 h-3 shrink-0" style={{ color: 'rgba(255,255,255,0.18)' }} />
                  {vendor.specialty.map(s => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-6">
              {vendor && (
                <div className="flex flex-col gap-1.5">
                  <a href={`tel:${vendor.phone}`} className="flex items-center gap-2 text-sm text-white hover:opacity-75 transition-opacity">
                    <Phone className="w-3.5 h-3.5 shrink-0" style={{ color: '#e8401a' }} />
                    {vendor.phone}
                  </a>
                  <a href={`mailto:${vendor.email}`} className="flex items-center gap-2 text-sm hover:opacity-75 transition-opacity"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgba(255,255,255,0.2)' }} />
                    {vendor.email}
                  </a>
                </div>
              )}

              <div className="flex gap-2">
                <StatBadge label="Active"    value={activeJobs.length}    color="#f97316" />
                <StatBadge label="Pending"   value={pendingJobs.length}   color="#f59e0b" />
                <StatBadge label="Completed" value={completedJobs.length} color="#34d399" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Jobs ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 sm:space-y-7">

          {jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-28">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: '#e2e9f7' }}>
                <Inbox className="w-6 h-6" style={{ color: '#94a3b8' }} />
              </div>
              <p className="text-sm font-semibold" style={{ color: '#0e2040' }}>No jobs assigned yet</p>
              <p className="text-xs" style={{ color: '#94a3b8' }}>New jobs dispatched to you will appear here</p>
            </div>
          )}

          {activeJobs.length > 0 && (
            <section>
              <SectionHeader label="Active" count={activeJobs.length} dot="#e8401a" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {activeJobs.map(job => <JobCard key={job.id} job={job} onClick={() => navigate(`/vendor/${vendorId}/jobs/${job.id}`)} />)}
              </div>
            </section>
          )}

          {pendingJobs.length > 0 && (
            <section>
              <SectionHeader label="Awaiting Action" count={pendingJobs.length} dot="#f59e0b" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {pendingJobs.map(job => <JobCard key={job.id} job={job} onClick={() => navigate(`/vendor/${vendorId}/jobs/${job.id}`)} />)}
              </div>
            </section>
          )}

          {completedJobs.length > 0 && (
            <section>
              <SectionHeader label="Completed" count={completedJobs.length} dot="#34d399" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                {completedJobs.map(job => <JobCard key={job.id} job={job} onClick={() => navigate(`/vendor/${vendorId}/jobs/${job.id}`)} muted />)}
              </div>
            </section>
          )}

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center px-3.5 py-2 rounded-lg"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', minWidth: '52px' }}>
      <span className="text-xl font-bold leading-none" style={{ color }}>{value}</span>
      <span className="text-[10px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.28)' }}>{label}</span>
    </div>
  );
}

function JobCard({ job, onClick, muted }: { job: Job; onClick: () => void; muted?: boolean }) {
  const accent  = URGENCY_ACCENT[job.urgency];
  const excerpt = job.description.length > 80 ? job.description.slice(0, 80).trimEnd() + '…' : job.description;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-xl transition-all duration-150 hover:shadow-md hover:-translate-y-px"
      style={{
        border: '1px solid #e2e9f7',
        borderLeft: `3px solid ${accent}`,
        opacity: muted ? 0.6 : 1,
      }}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-[10px] font-mono" style={{ color: '#94a3b8' }}>{job.id}</span>
          <StatusBadge status={job.status} size="sm" />
        </div>
        <p className="text-sm font-semibold leading-snug mb-0.5" style={{ color: '#0e2040' }}>{job.serviceType}</p>
        <p className="text-xs mb-2" style={{ color: '#64748b' }}>{job.customerName}</p>
        <p className="text-xs leading-relaxed mb-3" style={{ color: '#94a3b8' }}>{excerpt}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs" style={{ color: '#94a3b8' }}>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" style={{ color: accent }} />{job.location}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{fmtDate(job.createdAt)}
            </span>
          </div>
          <UrgencyBadge urgency={job.urgency} size="sm" />
        </div>
      </div>
      <div className="px-4 py-2 flex items-center justify-end gap-1 text-xs font-medium rounded-b-xl"
        style={{ borderTop: '1px solid #f0f4fb', color: accent }}>
        View job <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </button>
  );
}

function SectionHeader({ label, count, dot }: { label: string; count: number; dot: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dot }} />
      <h2 className="text-sm font-semibold" style={{ color: '#0e2040' }}>{label}</h2>
      <span className="text-xs px-2 py-0.5 rounded-full"
        style={{ background: '#fff', color: '#64748b', border: '1px solid #e2e9f7' }}>
        {count}
      </span>
      <div className="flex-1 h-px" style={{ background: '#e2e9f7' }} />
    </div>
  );
}
