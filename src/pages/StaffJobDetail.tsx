import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, Building2, Clock, User,
  Send, Lock, Globe, AlertTriangle, ExternalLink,
  CheckCircle2, ChevronRight,
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useNotifications } from '../context/NotificationContext';
import StatusBadge from '../components/common/StatusBadge';
import UrgencyBadge from '../components/common/UrgencyBadge';
import Timeline from '../components/common/Timeline';
import type { JobStatus } from '../types';

const STATUS_PIPELINE: JobStatus[] = ['New', 'Assigned', 'Accepted', 'In Progress', 'Completed'];

const URGENCY_STRIPE: Record<string, string> = {
  Critical: '#e8401a', High: '#f97316', Medium: '#fbbf24', Low: '#94a3b8',
};

// SLA thresholds in hours per urgency
const SLA_WARN: Record<string, number> = { Critical: 1, High: 3, Medium: 8, Low: 24 };
const SLA_OVER: Record<string, number> = { Critical: 2, High: 6, Medium: 16, Low: 48 };

function parseTs(ts: string) { return new Date(ts.replace(' ', 'T') + ':00'); }

function jobElapsed(createdAt: string) {
  const ms  = Date.now() - parseTs(createdAt).getTime();
  const min = Math.floor(ms / 60000);
  const hr  = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `${day}d ${hr % 24}h`;
  if (hr > 0)  return `${hr}h ${min % 60}m`;
  return `${min}m`;
}

function slaStatus(createdAt: string, urgency: string, status: JobStatus): 'ok' | 'warn' | 'over' {
  if (status === 'Completed') return 'ok';
  const hrElapsed = (Date.now() - parseTs(createdAt).getTime()) / 3600000;
  if (hrElapsed >= (SLA_OVER[urgency] ?? 99)) return 'over';
  if (hrElapsed >= (SLA_WARN[urgency] ?? 99)) return 'warn';
  return 'ok';
}

const STAGE_DESC: Record<JobStatus, string> = {
  'New':         'Unassigned — check the timeline below for any decline history, then select a vendor to dispatch.',
  'Assigned':    'Vendor has been notified and is awaiting acceptance.',
  'Accepted':    'Vendor accepted and is en route to the site.',
  'In Progress': 'Vendor is on site and work is actively underway.',
  'Completed':   'Job has been resolved and closed out.',
};

export default function StaffJobDetail() {
  const { id }   = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getJob, updateJobStatus, assignVendor, addNote, vendors, jobs } = useJobs();
  const { addNotification } = useNotifications();

  const job = getJob(id ?? '');
  const [noteText, setNoteText]     = useState('');
  const [isInternal, setIsInternal] = useState(true);
  const [showForce, setShowForce]   = useState(false);

  const vendorLoad = useMemo(() => {
    const map: Record<string, number> = {};
    jobs.forEach(j => {
      if (j.assignedVendorId && j.status !== 'Completed') {
        map[j.assignedVendorId] = (map[j.assignedVendorId] ?? 0) + 1;
      }
    });
    return map;
  }, [jobs]);

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4" style={{ color: '#94a3b8' }}>
        <AlertTriangle className="w-12 h-12" />
        <p className="text-lg font-semibold" style={{ color: '#64748b' }}>Job not found</p>
        <button onClick={() => navigate('/')} className="text-sm font-medium" style={{ color: '#e8401a' }}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const stripe   = URGENCY_STRIPE[job.urgency] ?? '#94a3b8';
  const elapsed  = jobElapsed(job.createdAt);
  const sla      = slaStatus(job.createdAt, job.urgency, job.status);
  const curIdx   = STATUS_PIPELINE.indexOf(job.status);
  const nextStep = STATUS_PIPELINE[curIdx + 1] ?? null;
  const mapsUrl  = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`;

  function handleStatusChange(newStatus: JobStatus) {
    if (!job) return;
    if (newStatus === job.status) return;
    updateJobStatus(job.id, newStatus, 'Staff — Dispatcher');
    addNotification({
      title: `${job.id} — Status Updated`,
      message: `Status changed to "${newStatus}"`,
      type: newStatus === 'Completed' ? 'success' : 'info',
      jobId: job.id,
    });
    setShowForce(false);
  }

  function handleVendorAssign(vendorId: string) {
    if (!job) return;
    const vendor = vendors.find(v => v.id === vendorId);
    if (!vendor) return;
    assignVendor(job.id, vendorId, 'Staff — Dispatcher');
    addNotification({ title: `${job.id} — Vendor Assigned`, message: `${vendor.name} assigned`, type: 'info', jobId: job.id });
  }

  function handleNoteSubmit() {
    if (!job) return;
    if (!noteText.trim()) return;
    addNote(job.id, noteText.trim(), 'Staff — Dispatcher', isInternal);
    addNotification({ title: `${job.id} — Note Added`, message: isInternal ? 'Internal note added' : 'Note shared with vendor', type: 'info', jobId: job.id });
    setNoteText('');
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div style={{ background: '#0e2040', borderBottom: `3px solid ${stripe}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <button onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm mb-4 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            <ArrowLeft className="w-4 h-4" /> Back to Board
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <span className="text-xs font-mono px-2 py-0.5 rounded"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}>
                  {job.id}
                </span>
                <UrgencyBadge urgency={job.urgency} size="sm" />
                {/* SLA indicator */}
                {sla !== 'ok' && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1"
                    style={sla === 'over'
                      ? { background: 'rgba(232,64,26,0.2)', color: '#f87171', border: '1px solid rgba(232,64,26,0.3)' }
                      : { background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>
                    <AlertTriangle className="w-3 h-3" />
                    {sla === 'over' ? 'SLA Breached' : 'SLA Warning'}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-white">{job.serviceType}</h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {job.customerName} · {job.location}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.28)' }}>Open for</p>
                <p className="text-lg font-bold"
                  style={{ color: sla === 'over' ? '#f87171' : sla === 'warn' ? '#fbbf24' : 'rgba(255,255,255,0.7)' }}>
                  {elapsed}
                </p>
              </div>
              <StatusBadge status={job.status} size="lg" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto" style={{ background: '#eef2fb' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

          {/* LEFT PANEL */}
          <div className="space-y-4">

            {/* Customer */}
            <Panel title="Customer">
              <InfoRow icon={<User className="w-4 h-4" />} label="Name" value={job.customerName} />
              {/* Clickable phone */}
              <div className="flex items-start gap-3 py-1.5">
                <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: '#f0f4fb' }}>
                  <Phone className="w-4 h-4" style={{ color: '#94a3b8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#94a3b8' }}>Phone</p>
                  <a href={`tel:${job.customerPhone}`}
                    className="text-sm font-semibold hover:underline"
                    style={{ color: '#e8401a' }}>
                    {job.customerPhone}
                  </a>
                </div>
              </div>
              <InfoRow icon={<MapPin className="w-4 h-4" />} label="Location" value={job.location} />
              {/* Clickable address → Google Maps */}
              <div className="flex items-start gap-3 py-1.5">
                <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: '#f0f4fb' }}>
                  <MapPin className="w-4 h-4" style={{ color: '#94a3b8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#94a3b8' }}>Address</p>
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm font-semibold flex items-center gap-1 hover:underline"
                    style={{ color: '#0e2040' }}>
                    {job.address}
                    <ExternalLink className="w-3 h-3 shrink-0" style={{ color: '#94a3b8' }} />
                  </a>
                </div>
              </div>
            </Panel>

            {/* Job Info */}
            <Panel title="Job Details">
              <div className="flex items-start gap-3 py-1.5">
                <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: '#f0f4fb' }}>
                  <Clock className="w-4 h-4" style={{ color: '#94a3b8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#94a3b8' }}>Created</p>
                  <p className="text-sm font-semibold" style={{ color: '#0e2040' }}>{job.createdAt}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{elapsed} ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 py-1.5">
                <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: '#f0f4fb' }}>
                  <Building2 className="w-4 h-4" style={{ color: '#94a3b8' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#94a3b8' }}>Description</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{job.description}</p>
                </div>
              </div>
            </Panel>

            {/* Status Workflow */}
            <Panel title="Job Workflow">
              {/* Pipeline progress */}
              <div className="flex items-center mb-4">
                {STATUS_PIPELINE.map((s, i) => {
                  const done    = i <= curIdx;
                  const current = i === curIdx;
                  return (
                    <div key={s} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={current
                            ? { background: '#0e2040', color: 'white' }
                            : done
                            ? { background: '#10b981', color: 'white' }
                            : { background: '#e2e9f7', color: '#94a3b8' }}>
                          {done && !current
                            ? <CheckCircle2 className="w-3.5 h-3.5" />
                            : <span className="text-[10px] font-bold">{i + 1}</span>
                          }
                        </div>
                        <span className="text-[9px] font-medium whitespace-nowrap"
                          style={{ color: current ? '#0e2040' : done ? '#10b981' : '#94a3b8' }}>
                          {s}
                        </span>
                      </div>
                      {i < STATUS_PIPELINE.length - 1 && (
                        <div className="flex-1 h-px mx-1 mb-3"
                          style={{ background: i < curIdx ? '#10b981' : '#e2e9f7' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-xs mb-3" style={{ color: '#64748b' }}>{STAGE_DESC[job.status]}</p>

              {/* Primary action */}
              {nextStep && job.status !== 'New' && (
                <button onClick={() => handleStatusChange(nextStep)}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white mb-2 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ background: '#0e2040' }}>
                  Advance to {nextStep} <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {job.status === 'Completed' && (
                <div className="flex items-center gap-2 text-sm font-medium py-1" style={{ color: '#10b981' }}>
                  <CheckCircle2 className="w-4 h-4" /> Resolved & Closed
                </div>
              )}

              {/* Force override */}
              {job.status !== 'Completed' && (
                <>
                  <button onClick={() => setShowForce(v => !v)}
                    className="text-xs hover:underline"
                    style={{ color: '#94a3b8' }}>
                    {showForce ? 'Hide' : 'Force status override'}
                  </button>
                  {showForce && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {STATUS_PIPELINE.filter(s => s !== job.status).map(s => (
                        <button key={s} onClick={() => handleStatusChange(s)}
                          className="px-2.5 py-1 rounded text-xs font-medium transition-colors hover:border-gray-400"
                          style={{ background: '#f0f4fb', color: '#64748b', border: '1px solid #e2e9f7' }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </Panel>

            {/* Vendor Assignment */}
            <Panel title={job.assignedVendor ? 'Assigned Vendor' : 'Assign Vendor'}>
              {job.assignedVendor && (
                <div className="flex items-center gap-3 p-3 rounded-lg mb-3" style={{ background: '#f0f4fb', border: '1px solid #e2e9f7' }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                    style={{ background: '#e2e9f7', color: '#0e2040' }}>
                    {job.assignedVendor.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#0e2040' }}>{job.assignedVendor}</p>
                    <p className="text-xs" style={{ color: '#94a3b8' }}>
                      {vendors.find(v => v.id === job.assignedVendorId)?.phone ?? ''}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: '#94a3b8' }}>
                {job.assignedVendor ? 'Reassign to' : 'Select vendor'}
              </p>
              <div className="space-y-1.5">
                {vendors.map(v => {
                  const load     = vendorLoad[v.id] ?? 0;
                  const isActive = job.assignedVendorId === v.id;
                  return (
                    <button key={v.id} onClick={() => handleVendorAssign(v.id)}
                      className="w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors hover:border-slate-300"
                      style={{
                        background: isActive ? '#f0f4fb' : '#fff',
                        border: `1px solid ${isActive ? '#0e2040' : '#e2e9f7'}`,
                      }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                        style={isActive ? { background: '#0e2040', color: 'white' } : { background: '#f0f4fb', color: '#64748b' }}>
                        {v.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: '#0e2040' }}>{v.name}</p>
                        <p className="text-[10px] truncate" style={{ color: '#94a3b8' }}>{v.specialty[0]}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={load === 0
                          ? { background: '#ecfdf5', color: '#059669' }
                          : load >= 3
                          ? { background: '#fff0ed', color: '#e8401a' }
                          : { background: '#fffbeb', color: '#92400e' }}>
                        {load === 0 ? 'Free' : `${load} active`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Panel>
          </div>

          {/* RIGHT PANEL */}
          <div className="space-y-4">

            <Panel title="Activity Timeline">
              <Timeline events={job.timeline} />
            </Panel>

            <Panel title="Notes">
              {job.notes.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {[...job.notes].reverse().map(note => (
                    <div key={note.id} className="p-3 rounded-lg text-sm leading-relaxed"
                      style={note.isInternal
                        ? { background: '#fffbeb', border: '1px solid #fde68a' }
                        : { background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                      <div className="flex items-center gap-2 mb-1">
                        {note.isInternal
                          ? <Lock className="w-3 h-3" style={{ color: '#d97706' }} />
                          : <Globe className="w-3 h-3" style={{ color: '#3b82f6' }} />}
                        <span className="text-xs font-semibold" style={{ color: '#334155' }}>{note.author}</span>
                        <span className="text-xs ml-auto" style={{ color: '#94a3b8' }}>{note.timestamp}</span>
                        {note.isInternal && (
                          <span className="text-[10px] font-semibold" style={{ color: '#d97706' }}>Internal</span>
                        )}
                      </div>
                      <p style={{ color: '#334155' }}>{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>No notes yet</p>
              )}

              <div className="rounded-lg overflow-hidden" style={{ border: '1px solid #dde5f5' }}>
                <textarea
                  value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note…" rows={3}
                  className="w-full px-3 py-2.5 text-sm resize-none outline-none"
                  style={{ background: '#fff', color: '#0e2040', borderBottom: '1px solid #dde5f5' }}
                />
                <div className="flex items-center justify-between px-3 py-2" style={{ background: '#f5f8ff' }}>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div onClick={() => setIsInternal(i => !i)}
                      className="w-8 h-4 rounded-full relative transition-colors"
                      style={{ background: isInternal ? '#f59e0b' : '#3b82f6' }}>
                      <div className="absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all"
                        style={{ left: isInternal ? '2px' : '18px' }} />
                    </div>
                    <span className="text-xs font-medium flex items-center gap-1" style={{ color: '#64748b' }}>
                      {isInternal
                        ? <><Lock className="w-3 h-3" style={{ color: '#f59e0b' }} /> Internal only</>
                        : <><Globe className="w-3 h-3" style={{ color: '#3b82f6' }} /> Visible to vendor</>}
                    </span>
                  </label>
                  <button onClick={handleNoteSubmit} disabled={!noteText.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-white disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: '#0e2040' }}>
                    <Send className="w-3 h-3" /> Add Note
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e9f7' }}>
      <div className="px-4 py-2.5" style={{ background: '#f8faff', borderBottom: '1px solid #eef2fb' }}>
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: '#f0f4fb' }}>
        <div style={{ color: '#94a3b8' }}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#94a3b8' }}>{label}</p>
        <p className="text-sm font-semibold" style={{ color: '#0e2040' }}>{value}</p>
      </div>
    </div>
  );
}
