import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, MapPin, Tag, AlertCircle } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { getVendorCategory, CATEGORY_STYLE } from '../components/vendor/VendorCard';
import VendorJobsTable from '../components/vendor/VendorJobsTable';

const ACTIVE_STATUSES = new Set(['New', 'Assigned', 'Accepted', 'In Progress']);

export default function VendorDetail() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const navigate     = useNavigate();
  const { vendors, jobs } = useJobs();

  const vendor     = vendors.find(v => v.id === vendorId);
  const vendorJobs = useMemo(() => jobs.filter(j => j.assignedVendorId === vendorId), [jobs, vendorId]);
  const activeCount    = useMemo(() => vendorJobs.filter(j => ACTIVE_STATUSES.has(j.status)).length, [vendorJobs]);
  const completedCount = useMemo(() => vendorJobs.filter(j => j.status === 'Completed').length, [vendorJobs]);
  const inProgressJob  = vendorJobs.find(j => j.status === 'In Progress');

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 py-24" style={{ background: '#f0f4fb' }}>
        <AlertCircle className="w-8 h-8" style={{ color: '#c4cfe0' }} />
        <p className="text-sm font-semibold" style={{ color: '#0e2040' }}>Vendor not found</p>
        <button onClick={() => navigate('/vendors')}
          className="text-xs font-semibold px-4 py-2 rounded-lg"
          style={{ background: '#0e2040', color: 'white' }}>
          Back to Vendors
        </button>
      </div>
    );
  }

  const category = getVendorCategory(vendor.specialty);
  const cat      = CATEGORY_STYLE[category] ?? CATEGORY_STYLE.General;
  const initials = vendor.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ background: '#f0f4fb' }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ background: '#0e2040' }}>
        <div style={{ height: '2px', background: cat.stripe }} />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 sm:pt-5 pb-5 sm:pb-6">
          <button onClick={() => navigate('/vendors')}
            className="flex items-center gap-1.5 text-xs font-medium mb-5 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.35)' }}>
            <ArrowLeft className="w-3.5 h-3.5" /> All Vendors
          </button>

          {/* Profile row */}
          <div className="flex flex-wrap items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-16 h-16 rounded-xl flex items-center justify-center text-xl font-bold"
                style={{ background: `${cat.stripe}20`, color: cat.stripe }}>
                {initials}
              </div>
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2"
                  style={{ background: '#22c55e', borderColor: '#0e2040' }} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-xl font-bold text-white">{vendor.name}</h1>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{ background: cat.bg, color: cat.text }}>
                  {category}
                </span>
                {inProgressJob && (
                  <span className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    On site — {inProgressJob.serviceType}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1 mb-3">
                <Tag className="w-3 h-3 shrink-0" style={{ color: 'rgba(255,255,255,0.18)' }} />
                {vendor.specialty.map(s => (
                  <span key={s} className="text-[11px] px-2 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-4">
                <a href={`tel:${vendor.phone}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-white hover:opacity-75 transition-opacity">
                  <Phone className="w-3.5 h-3.5" style={{ color: cat.stripe }} />{vendor.phone}
                </a>
                <a href={`mailto:${vendor.email}`}
                  className="flex items-center gap-1.5 text-sm hover:opacity-75 transition-opacity"
                  style={{ color: 'rgba(255,255,255,0.45)' }}>
                  <Mail className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.2)' }} />{vendor.email}
                </a>
                <span className="flex items-center gap-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <MapPin className="w-3.5 h-3.5" style={{ color: 'rgba(255,255,255,0.15)' }} />{vendor.location}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col items-end gap-2.5 shrink-0">
              <div className="flex gap-2.5">
                <StatPill label="Total" value={vendorJobs.length} color="rgba(255,255,255,0.7)" />
                <StatPill label="Active" value={activeCount} color={activeCount > 0 ? '#f97316' : 'rgba(255,255,255,0.25)'} />
                <StatPill label="Done" value={completedCount} color="#34d399" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Jobs table ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <VendorJobsTable jobs={vendorJobs} />
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-2.5 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', minWidth: '58px' }}>
      <span className="text-2xl font-bold leading-none" style={{ color }}>{value}</span>
      <span className="text-[10px] font-medium uppercase tracking-wide mt-1" style={{ color: 'rgba(255,255,255,0.28)' }}>{label}</span>
    </div>
  );
}
