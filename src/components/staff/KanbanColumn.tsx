import type { JobStatus, Job } from '../../types';
import StaffJobCard from './StaffJobCard';
import { useNavigate } from 'react-router-dom';

const COLUMN_META: Record<JobStatus, { dot: string; accent: string }> = {
  'New':         { dot: '#38bdf8', accent: '#0ea5e9' },
  'Assigned':    { dot: '#a78bfa', accent: '#8b5cf6' },
  'Accepted':    { dot: '#fbbf24', accent: '#f59e0b' },
  'In Progress': { dot: '#fb923c', accent: '#f97316' },
  'Completed':   { dot: '#34d399', accent: '#10b981' },
};

interface Props { status: JobStatus; jobs: Job[]; }

export default function KanbanColumn({ status, jobs }: Props) {
  const navigate = useNavigate();
  const meta     = COLUMN_META[status];
  const sorted   = [...jobs].sort((a, b) => {
    const o: Record<string, number> = { Critical: 0, High: 1, Medium: 2, Low: 3 };
    return o[a.urgency] - o[b.urgency];
  });

  return (
    <div
      className="flex flex-col rounded-xl min-w-[256px] max-w-[256px] overflow-hidden"
      style={{
        background: '#f5f7fc',
        border: '1px solid #e2e9f7',
      }}
    >
      {/* Column header */}
      <div className="px-3.5 py-2.5 flex items-center justify-between shrink-0 bg-white"
        style={{ borderBottom: '1px solid #e8edf7' }}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.dot }} />
          <span className="text-sm font-semibold" style={{ color: '#0e2040' }}>{status}</span>
        </div>
        <span className="text-xs font-semibold tabular-nums" style={{ color: '#94a3b8' }}>
          {jobs.length}
        </span>
      </div>

      {/* Cards */}
      <div
        className="flex-1 overflow-y-auto p-2.5 space-y-2"
        style={{ minHeight: '120px', maxHeight: 'calc(100vh - 290px)' }}
      >
        {sorted.length === 0 ? (
          <div className="flex items-center justify-center py-10 rounded-lg border border-dashed"
            style={{ borderColor: '#dde5f5', color: '#c4cfe0' }}>
            <span className="text-xs">No jobs</span>
          </div>
        ) : (
          sorted.map(job => (
            <StaffJobCard key={job.id} job={job} onClick={() => navigate(`/jobs/${job.id}`)} />
          ))
        )}
      </div>
    </div>
  );
}
