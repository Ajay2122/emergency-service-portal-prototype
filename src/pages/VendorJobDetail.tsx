import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, Phone, Clock, User, CheckCircle2,
  Wrench, UserCheck, Send, AlertTriangle, XCircle,
  FileText, ChevronRight, ExternalLink, Timer, Camera,
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useNotifications } from '../context/NotificationContext';
import StatusBadge from '../components/common/StatusBadge';
import UrgencyBadge from '../components/common/UrgencyBadge';
import Timeline from '../components/common/Timeline';
import type { JobStatus } from '../types';

const PIPELINE: JobStatus[] = ['Assigned', 'Accepted', 'In Progress', 'Completed'];

const URGENCY_STRIPE: Record<string, string> = {
  Critical: '#e8401a', High: '#f97316', Medium: '#f59e0b', Low: '#6366f1',
};

function fmtDate(dt: string) {
  const [date, time] = dt.split(' ');
  const [, m, d] = date.split('-');
  const months = ['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[+m]} ${+d}, ${time}`;
}

function elapsed(ts: string) {
  const ms  = Date.now() - new Date(ts.replace(' ', 'T') + ':00').getTime();
  const min = Math.floor(ms / 60000);
  const hr  = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (day > 0) return `${day}d ${hr % 24}h`;
  if (hr > 0)  return `${hr}h ${min % 60}m`;
  return `${min}m`;
}

export default function VendorJobDetail() {
  const { vendorId, jobId } = useParams<{ vendorId: string; jobId: string }>();
  const navigate = useNavigate();
  const { getJob, updateJobStatus, declineJob, addNote } = useJobs();
  const { addNotification } = useNotifications();

  const job = getJob(jobId ?? '');

  // Action flow state
  const [showAcceptFlow,  setShowAcceptFlow]  = useState(false);
  const [etaChoice,       setEtaChoice]       = useState('');
  const [showDeclineFlow, setShowDeclineFlow] = useState(false);
  const [declineReason,   setDeclineReason]   = useState('');
  const [showCompleteFlow, setShowCompleteFlow] = useState(false);
  const [completeNote,     setCompleteNote]     = useState('');
  const [noteText,         setNoteText]         = useState('');

  if (!job) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4">
        <AlertTriangle className="w-10 h-10" style={{ color: '#e8401a' }} />
        <p className="text-lg font-bold" style={{ color: '#0e2040' }}>Job not found</p>
        <button onClick={() => navigate(`/vendor/${vendorId}`)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: '#e8401a' }}>
          <ArrowLeft className="w-4 h-4" /> Back to My Jobs
        </button>
      </div>
    );
  }

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleAcceptWithEta() {
    if (!etaChoice.trim()) return;
    updateJobStatus(job.id, 'Accepted', job.assignedVendor ?? 'Vendor');
    addNote(job.id, `ETA to site: ${etaChoice}`, job.assignedVendor ?? 'Vendor', false);
    addNotification({ title: `${job.id} — Accepted`, message: `${job.assignedVendor} accepted — ETA ${etaChoice}`, type: 'success', jobId: job.id });
    setShowAcceptFlow(false);
    setEtaChoice('');
  }

  function handleDecline() {
    if (!declineReason.trim()) return;
    declineJob(job.id, declineReason.trim(), job.assignedVendor ?? 'Vendor');
    addNotification({ title: `${job.id} — Declined`, message: `${job.assignedVendor} declined — returned to queue`, type: 'warning', jobId: job.id });
    navigate(`/vendor/${vendorId}`);
  }

  function handleArrival() {
    updateJobStatus(job.id, 'In Progress', job.assignedVendor ?? 'Vendor');
    addNotification({ title: `${job.id} — On Site`, message: `${job.assignedVendor} has arrived and started work`, type: 'info', jobId: job.id });
  }

  function handleComplete() {
    if (!completeNote.trim()) return;
    addNote(job.id, completeNote.trim(), job.assignedVendor ?? 'Vendor', false);
    updateJobStatus(job.id, 'Completed', job.assignedVendor ?? 'Vendor');
    addNotification({ title: `${job.id} — Completed`, message: `${job.assignedVendor} closed out the job`, type: 'success', jobId: job.id });
    setShowCompleteFlow(false);
    navigate(`/vendor/${vendorId}`);
  }

  function handleAddNote() {
    if (!noteText.trim()) return;
    addNote(job.id, noteText.trim(), job.assignedVendor ?? 'Vendor', false);
    addNotification({ title: `${job.id} — Note Added`, message: 'Vendor added a note', type: 'info', jobId: job.id });
    setNoteText('');
  }

  // ── Derived values ──────────────────────────────────────────────────────────

  const currentStep  = PIPELINE.indexOf(job.status);
  const isCompleted  = job.status === 'Completed';
  const stripe       = URGENCY_STRIPE[job.urgency] ?? '#6366f1';
  const mapsUrl      = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(job.address)}`;

  // ETA the vendor committed to on acceptance (stored as a note)
  const etaNote      = job.notes.find(n => !n.isInternal && n.content.startsWith('ETA to site:'));
  const committedEta = etaNote?.content.replace('ETA to site: ', '') ?? null;

  // Timeline event for when the vendor physically arrived
  const arrivedEvent = job.timeline.find(e => e.type === 'status_update' && e.message.includes('on site'));

  // Staff instructions visible to vendor (exclude system ETA notes)
  const staffNotes   = job.notes.filter(n => !n.isInternal && !n.content.startsWith('ETA to site:'));

  // Job open duration shown in header
  const openElapsed  = elapsed(job.createdAt);

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ background: '#eef2fb' }}>

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="shrink-0" style={{ background: '#0e2040' }}>
        <div style={{ height: '3px', background: stripe }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <button onClick={() => navigate(`/vendor/${vendorId}`)}
            className="flex items-center gap-1.5 text-sm mb-4 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            <ArrowLeft className="w-4 h-4" /> My Jobs
          </button>

          <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-mono px-2.5 py-1 rounded"
                  style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}>
                  {job.id}
                </span>
                <UrgencyBadge urgency={job.urgency} size="sm" />
                <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  {openElapsed} open
                </span>
                {/* Show committed ETA in header when en route */}
                {job.status === 'Accepted' && committedEta && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded flex items-center gap-1"
                    style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)' }}>
                    <Clock className="w-3 h-3" /> ETA {committedEta}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-bold text-white leading-tight">{job.serviceType}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <MapPin className="w-3.5 h-3.5 shrink-0" />{job.address}
              </p>
            </div>
            <StatusBadge status={job.status} size="lg" />
          </div>

          {/* Pipeline */}
          <div className="rounded-xl px-5 py-4"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <p className="text-[10px] font-semibold uppercase tracking-widest mb-3"
              style={{ color: 'rgba(255,255,255,0.25)' }}>
              Job Progress
            </p>
            <div className="flex items-center">
              {PIPELINE.map((step, i) => {
                const done  = i <= currentStep;
                const isNow = i === currentStep;
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                        style={isNow
                          ? { background: stripe, color: 'white' }
                          : done
                          ? { background: '#10b981', color: 'white' }
                          : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.22)' }}>
                        {done && !isNow ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                      </div>
                      <span className="text-[10px] font-medium mt-1.5 whitespace-nowrap"
                        style={{ color: isNow ? stripe : done ? '#34d399' : 'rgba(255,255,255,0.2)' }}>
                        {step}
                      </span>
                    </div>
                    {i < PIPELINE.length - 1 && (
                      <div className="flex-1 h-px mx-2 mb-4 rounded-full"
                        style={{ background: i < currentStep ? '#10b981' : 'rgba(255,255,255,0.1)' }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

          {/* LEFT col */}
          <div className="space-y-4">

            {/* ── Action card ─────────────────────────────────────────── */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e9f7' }}>
              <div className="px-5 py-3 flex items-center gap-2"
                style={{ background: '#f8faff', borderBottom: '1px solid #eef2fb' }}>
                <div className="w-1.5 h-1.5 rounded-full"
                  style={{ background: isCompleted ? '#10b981' : stripe }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  {isCompleted ? 'Job Closed' : 'Your Next Step'}
                </p>
              </div>

              <div className="p-5">

                {/* ── ASSIGNED: default view ── */}
                {job.status === 'Assigned' && !showAcceptFlow && !showDeclineFlow && (
                  <div className="space-y-3">

                    {/* Urgency callout */}
                    {(job.urgency === 'Critical' || job.urgency === 'High') && (
                      <div className="flex items-start gap-2.5 p-3 rounded-lg"
                        style={{
                          background: job.urgency === 'Critical' ? '#fef2f2' : '#fff7ed',
                          border: `1px solid ${job.urgency === 'Critical' ? '#fecaca' : '#fed7aa'}`,
                        }}>
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5"
                          style={{ color: job.urgency === 'Critical' ? '#dc2626' : '#ea580c' }} />
                        <p className="text-xs font-semibold leading-snug"
                          style={{ color: job.urgency === 'Critical' ? '#dc2626' : '#ea580c' }}>
                          {job.urgency === 'Critical'
                            ? 'Critical priority — immediate response required. Please accept or decline now.'
                            : 'High priority — prompt response expected.'}
                        </p>
                      </div>
                    )}

                    {/* Staff instructions (latest visible note from staff) */}
                    {staffNotes.length > 0 && (
                      <div className="p-3 rounded-lg" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-1"
                          style={{ color: '#3b82f6' }}>
                          Staff Instructions
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: '#1e40af' }}>
                          {staffNotes[staffNotes.length - 1].content}
                        </p>
                      </div>
                    )}

                    <p className="text-sm" style={{ color: '#64748b' }}>
                      You've been dispatched for <strong style={{ color: '#0e2040' }}>{job.serviceType}</strong> at {job.customerName}'s location. Review the details, then accept or decline.
                    </p>

                    <button onClick={() => setShowAcceptFlow(true)}
                      className="w-full py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      style={{ background: '#0e2040' }}>
                      <UserCheck className="w-4 h-4" /> Accept This Job <ChevronRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => setShowDeclineFlow(true)}
                      className="w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
                      style={{ background: 'white', border: '1px solid #fecaca', color: '#dc2626' }}>
                      <XCircle className="w-4 h-4" /> I Can't Take This Job
                    </button>
                  </div>
                )}

                {/* ── ASSIGNED: ETA step ── */}
                {job.status === 'Assigned' && showAcceptFlow && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: '#0e2040' }}>
                        When can you be on site? <span style={{ color: '#e8401a' }}>*</span>
                      </p>
                      <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>
                        Your ETA is shared with dispatch staff as soon as you confirm.
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {['Now — leaving immediately', '15 min', '30 min', '1 hour', '2+ hours'].map(opt => (
                          <button key={opt} onClick={() => setEtaChoice(opt)}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                            style={etaChoice === opt
                              ? { background: '#e2e9f7', color: '#0e2040', border: '1px solid #0e2040' }
                              : { background: '#f8faff', color: '#64748b', border: '1px solid #e2e9f7' }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text" value={etaChoice} onChange={e => setEtaChoice(e.target.value)}
                        placeholder="Or type a custom ETA…"
                        className="w-full px-3 py-2.5 text-sm rounded-lg outline-none"
                        style={{
                          background: '#f8faff',
                          border: `1px solid ${etaChoice.trim() ? '#0e2040' : '#dde5f5'}`,
                          color: '#0e2040',
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setShowAcceptFlow(false); setEtaChoice(''); }}
                        className="flex-1 py-2.5 text-sm font-medium rounded-lg"
                        style={{ border: '1px solid #e2e9f7', color: '#64748b', background: 'white' }}>
                        Back
                      </button>
                      <button onClick={handleAcceptWithEta} disabled={!etaChoice.trim()}
                        className="flex-[2] py-2.5 text-sm font-semibold rounded-lg text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: '#0e2040' }}>
                        <UserCheck className="w-4 h-4" /> Confirm Acceptance
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ASSIGNED: decline step ── */}
                {job.status === 'Assigned' && showDeclineFlow && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: '#0e2040' }}>
                        Reason for declining <span style={{ color: '#e8401a' }}>*</span>
                      </p>
                      <p className="text-xs mb-3" style={{ color: '#94a3b8' }}>
                        Dispatch will be notified and can reassign this job immediately.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {['Not available', 'Out of service area', 'Wrong specialty', 'Equipment unavailable'].map(r => (
                        <button key={r} onClick={() => setDeclineReason(r)}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg"
                          style={declineReason === r
                            ? { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' }
                            : { background: '#f8faff', color: '#64748b', border: '1px solid #e2e9f7' }}>
                          {r}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={declineReason} onChange={e => setDeclineReason(e.target.value)}
                      placeholder="Or describe why you're unable to take this job…"
                      rows={2} className="w-full px-3 py-2.5 text-sm rounded-lg resize-none outline-none"
                      style={{
                        background: '#f8faff',
                        border: `1px solid ${declineReason.trim() ? '#fca5a5' : '#dde5f5'}`,
                        color: '#0e2040',
                      }}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => { setShowDeclineFlow(false); setDeclineReason(''); }}
                        className="flex-1 py-2.5 text-sm font-medium rounded-lg"
                        style={{ border: '1px solid #e2e9f7', color: '#64748b', background: 'white' }}>
                        Cancel
                      </button>
                      <button onClick={handleDecline} disabled={!declineReason.trim()}
                        className="flex-[2] py-2.5 text-sm font-semibold rounded-lg text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: '#dc2626' }}>
                        <XCircle className="w-4 h-4" /> Confirm Decline
                      </button>
                    </div>
                  </div>
                )}

                {/* ── ACCEPTED: en-route view ── */}
                {job.status === 'Accepted' && (
                  <div className="space-y-3">
                    {committedEta && (
                      <div className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: '#dcfce7' }}>
                          <Clock className="w-4 h-4" style={{ color: '#16a34a' }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide"
                            style={{ color: '#16a34a' }}>
                            Your Committed ETA
                          </p>
                          <p className="text-sm font-bold" style={{ color: '#14532d' }}>
                            {committedEta}
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      Head to <strong style={{ color: '#0e2040' }}>{job.address}</strong>. Press the button below only once you have physically arrived at the site.
                    </p>
                    <button onClick={handleArrival}
                      className="w-full py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      style={{ background: '#e8401a' }}>
                      <MapPin className="w-4 h-4" /> I've Arrived — Start Work
                    </button>
                  </div>
                )}

                {/* ── IN PROGRESS: on-site view ── */}
                {job.status === 'In Progress' && !showCompleteFlow && (
                  <div className="space-y-3">
                    {arrivedEvent && (
                      <div className="flex items-center gap-3 p-3 rounded-lg"
                        style={{ background: '#fff7ed', border: '1px solid #fed7aa' }}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                          style={{ background: '#ffedd5' }}>
                          <Timer className="w-4 h-4" style={{ color: '#ea580c' }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wide"
                            style={{ color: '#ea580c' }}>
                            On Site
                          </p>
                          <p className="text-xs font-semibold" style={{ color: '#9a3412' }}>
                            Arrived {fmtDate(arrivedEvent.timestamp)} · {elapsed(arrivedEvent.timestamp)} elapsed
                          </p>
                        </div>
                      </div>
                    )}
                    <p className="text-sm" style={{ color: '#64748b' }}>
                      Work underway. Mark complete once the issue is fully resolved and the site is clear.
                    </p>
                    <button onClick={() => setShowCompleteFlow(true)}
                      className="w-full py-3 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                      style={{ background: '#059669' }}>
                      <CheckCircle2 className="w-4 h-4" /> Mark Job Complete
                    </button>
                  </div>
                )}

                {/* ── IN PROGRESS: completion report ── */}
                {job.status === 'In Progress' && showCompleteFlow && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold mb-0.5" style={{ color: '#0e2040' }}>
                        Completion report <span style={{ color: '#e8401a' }}>*</span>
                      </p>
                      <p className="text-xs mb-2" style={{ color: '#94a3b8' }}>
                        Required — describe work performed, parts used, and any follow-up needed.
                      </p>
                    </div>
                    <textarea
                      value={completeNote} onChange={e => setCompleteNote(e.target.value)}
                      placeholder="e.g. Replaced faulty control board, tested heat output, advised tenant on thermostat settings…"
                      rows={4} className="w-full px-3 py-2.5 text-sm rounded-lg resize-none outline-none"
                      style={{
                        background: '#f8faff',
                        border: `1px solid ${completeNote.trim() ? '#0e2040' : '#dde5f5'}`,
                        color: '#0e2040',
                      }}
                    />
                    <p className="text-[10px]" style={{ color: completeNote.trim() ? '#10b981' : '#94a3b8' }}>
                      {completeNote.trim()
                        ? `${completeNote.trim().length} chars — ready to submit`
                        : 'Enter completion details to proceed'}
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowCompleteFlow(false)}
                        className="flex-1 py-2.5 text-sm font-medium rounded-lg"
                        style={{ border: '1px solid #e2e9f7', color: '#64748b', background: 'white' }}>
                        Cancel
                      </button>
                      <button onClick={handleComplete} disabled={!completeNote.trim()}
                        className="flex-[2] py-2.5 text-sm font-semibold rounded-lg text-white flex items-center justify-center gap-2 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: '#059669' }}>
                        <CheckCircle2 className="w-4 h-4" /> Confirm Complete
                      </button>
                    </div>
                  </div>
                )}

                {/* ── COMPLETED ── */}
                {isCompleted && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 rounded-lg"
                      style={{ background: '#ecfdf5', border: '1px solid #6ee7b7' }}>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: '#10b981' }}>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#065f46' }}>Job Closed Out</p>
                        <p className="text-xs mt-0.5" style={{ color: '#059669' }}>
                          {job.serviceType} — resolved successfully.
                        </p>
                      </div>
                    </div>
                    {arrivedEvent && (
                      <div className="flex items-center gap-2 px-1">
                        <Timer className="w-3.5 h-3.5 shrink-0" style={{ color: '#94a3b8' }} />
                        <p className="text-xs" style={{ color: '#94a3b8' }}>
                          Total time on site:{' '}
                          <strong style={{ color: '#64748b' }}>
                            {elapsed(arrivedEvent.timestamp)}
                          </strong>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Job details ─────────────────────────────────────────── */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e9f7' }}>
              <div className="px-5 py-3" style={{ background: '#f8faff', borderBottom: '1px solid #eef2fb' }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  Job Details
                </p>
              </div>
              <div className="p-5 space-y-4">
                <InfoRow icon={<User className="w-4 h-4" />} label="Customer" value={job.customerName} />

                {/* Tap-to-call */}
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: '#f0f4fb' }}>
                    <Phone className="w-4 h-4" style={{ color: '#94a3b8' }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5"
                      style={{ color: '#94a3b8' }}>Contact</p>
                    <a href={`tel:${job.customerPhone}`}
                      className="text-sm font-semibold hover:underline"
                      style={{ color: '#e8401a' }}>
                      {job.customerPhone}
                    </a>
                  </div>
                </div>

                {/* Tap-to-navigate */}
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: '#f0f4fb' }}>
                    <MapPin className="w-4 h-4" style={{ color: '#94a3b8' }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5"
                      style={{ color: '#94a3b8' }}>Address</p>
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold flex items-center gap-1 hover:underline"
                      style={{ color: '#0e2040' }}>
                      {job.address}
                      <ExternalLink className="w-3 h-3 shrink-0" style={{ color: '#94a3b8' }} />
                    </a>
                  </div>
                </div>

                <InfoRow icon={<Clock className="w-4 h-4" />} label="Opened" value={fmtDate(job.createdAt)} />
              </div>
              <div className="px-5 py-4" style={{ borderTop: '1px solid #eef2fb' }}>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: '#94a3b8' }}>Description</p>
                <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{job.description}</p>
              </div>
              <div className="px-5 py-3 flex items-center gap-2" style={{ borderTop: '1px solid #eef2fb' }}>
                <StatusBadge status={job.status} />
                <UrgencyBadge urgency={job.urgency} />
              </div>
            </div>
          </div>

          {/* RIGHT col */}
          <div className="space-y-4">

            {/* ── Add note ────────────────────────────────────────────── */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e9f7' }}>
              <div className="px-5 py-3 flex items-center gap-2"
                style={{ background: '#f8faff', borderBottom: '1px solid #eef2fb' }}>
                <FileText className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  Add a Note
                </p>
                <span className="text-[11px] ml-auto" style={{ color: '#94a3b8' }}>
                  Visible to dispatch staff
                </span>
              </div>
              <div className="p-4 flex gap-3">
                <textarea
                  value={noteText} onChange={e => setNoteText(e.target.value)}
                  placeholder="Update dispatch on progress, parts needed, or next steps…"
                  rows={2} className="flex-1 px-3 py-2.5 text-sm rounded-lg resize-none outline-none"
                  style={{ background: '#f8faff', border: '1px solid #dde5f5', color: '#0e2040' }}
                />
                <button onClick={handleAddNote} disabled={!noteText.trim()}
                  className="self-end flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-lg text-white disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  style={{ background: '#0e2040' }}>
                  <Send className="w-4 h-4" /> Send
                </button>
              </div>
            </div>

            {/* ── Notes from staff / vendor ────────────────────────────── */}
            {staffNotes.length > 0 && (
              <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e9f7' }}>
                <div className="px-5 py-3 flex items-center justify-between"
                  style={{ background: '#f8faff', borderBottom: '1px solid #eef2fb' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                    Notes
                  </p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: '#eff6ff', color: '#2563eb' }}>
                    {staffNotes.length}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {staffNotes.map(note => (
                    <div key={note.id} className="p-4 rounded-lg"
                      style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px]"
                          style={{ background: '#2563eb', color: 'white' }}>
                          {note.author.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold" style={{ color: '#0e2040' }}>
                          {note.author}
                        </span>
                        <span className="text-[10px] ml-auto" style={{ color: '#94a3b8' }}>
                          {fmtDate(note.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed pl-8" style={{ color: '#334155' }}>
                        {note.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Photo documentation ─────────────────────────────────── */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e9f7' }}>
              <div className="px-5 py-3 flex items-center gap-2"
                style={{ background: '#f8faff', borderBottom: '1px solid #eef2fb' }}>
                <Camera className="w-3.5 h-3.5" style={{ color: '#94a3b8' }} />
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  Photo Documentation
                </p>
                <span className="text-[10px] ml-auto" style={{ color: '#c4cfe0' }}>Optional</span>
              </div>
              <div className="p-4">
                <label className="flex flex-col items-center justify-center gap-2 py-7 rounded-xl border-2 border-dashed cursor-pointer transition-colors hover:bg-slate-50"
                  style={{ borderColor: '#dde5f5' }}>
                  <input type="file" accept="image/*" multiple className="sr-only" disabled />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#f0f4fb' }}>
                    <Camera className="w-5 h-5" style={{ color: '#94a3b8' }} />
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#64748b' }}>Tap to add photos</p>
                  <p className="text-xs text-center" style={{ color: '#94a3b8' }}>Site condition, damage, completed work</p>
                </label>
              </div>
            </div>

            {/* ── Activity log ────────────────────────────────────────── */}
            <div className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #e2e9f7' }}>
              <div className="px-5 py-3 flex items-center justify-between"
                style={{ background: '#f8faff', borderBottom: '1px solid #eef2fb' }}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#94a3b8' }}>
                  Activity Log
                </p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: '#f0f4fb', color: '#64748b' }}>
                  {job.timeline.length} events
                </span>
              </div>
              <div className="p-5">
                <Timeline events={job.timeline} />
              </div>
            </div>

            <div className="h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-1.5 rounded-lg shrink-0 mt-0.5" style={{ background: '#f0f4fb' }}>
        <div style={{ color: '#94a3b8' }}>{icon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#94a3b8' }}>
          {label}
        </p>
        <p className="text-sm font-semibold" style={{ color: '#0e2040' }}>{value}</p>
      </div>
    </div>
  );
}
