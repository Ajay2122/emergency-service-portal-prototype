import { useState } from 'react';
import { X, User, Phone, MapPin, FileText, Wrench, AlertOctagon } from 'lucide-react';
import type { Urgency } from '../../types';

const SERVICE_TYPES = [
  'Emergency Plumbing',
  'Pipe Burst',
  'Frozen Pipes',
  'Sewage Backup',
  'Water Damage Restoration',
  'Flood Damage',
  'HVAC Emergency',
  'Heating Failure',
  'Cooling Failure',
  'Emergency Electrical',
  'Panel Failure',
  'Gas Leak',
  'Roof Leak Emergency',
  'Mold Remediation',
  'Other',
];

const URGENCY_OPTIONS: { value: Urgency; label: string; desc: string; bg: string; border: string; active: string; dot: string }[] = [
  { value: 'Critical', label: 'Critical', desc: 'Life/safety risk — immediate dispatch', bg: '#fff0ed', border: '#fecdbd', active: '#e8401a', dot: '#e8401a' },
  { value: 'High',     label: 'High',     desc: 'Significant damage, urgent response',  bg: '#fff7ed', border: '#fed7aa', active: '#f97316', dot: '#f97316' },
  { value: 'Medium',   label: 'Medium',   desc: 'Moderate issue, same-day response',    bg: '#fffbeb', border: '#fde68a', active: '#f59e0b', dot: '#f59e0b' },
  { value: 'Low',      label: 'Low',      desc: 'Non-urgent, schedule when available',  bg: '#f8faff', border: '#dde5f5', active: '#6366f1', dot: '#94a3b8' },
];

interface FormState {
  customerName: string;
  customerPhone: string;
  serviceType: string;
  urgency: Urgency | '';
  location: string;
  address: string;
  description: string;
}

interface Props {
  onClose: () => void;
  onSubmit: (data: Omit<FormState, 'urgency'> & { urgency: Urgency }) => void;
}

const EMPTY: FormState = {
  customerName: '', customerPhone: '', serviceType: '',
  urgency: '', location: '', address: '', description: '',
};

export default function CreateJobModal({ onClose, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function set(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.customerName.trim()) e.customerName = 'Required';
    if (!form.customerPhone.trim()) e.customerPhone = 'Required';
    if (!form.serviceType) e.serviceType = 'Select a service type';
    if (!form.urgency) e.urgency = 'Select urgency level';
    if (!form.location.trim()) e.location = 'Required';
    if (!form.address.trim()) e.address = 'Required';
    if (!form.description.trim()) e.description = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(form as Omit<FormState, 'urgency'> & { urgency: Urgency });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(9,21,43,0.65)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: 'white', boxShadow: '0 32px 80px rgba(9,21,43,0.35)' }}
      >
        {/* Header */}
        <div
          className="shrink-0 px-7 py-5 flex items-center justify-between"
          style={{ background: '#0e2040', borderBottom: '3px solid #e8401a' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(232,64,26,0.25)' }}>
              <AlertOctagon className="w-4 h-4" style={{ color: '#f97316' }} />
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-tight">New Job Request</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Fill in all fields — job will appear in the New column</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(232,64,26,0.3)'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.5)'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-7 py-6 space-y-6">

            {/* Customer section */}
            <div>
              <SectionLabel icon={<User className="w-3.5 h-3.5" />} label="Customer Information" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <Field label="Full Name" error={errors.customerName}>
                  <input
                    type="text"
                    placeholder="e.g. Sarah Chen"
                    value={form.customerName}
                    onChange={e => set('customerName', e.target.value)}
                    className="field-input"
                    style={fieldStyle(!!errors.customerName)}
                  />
                </Field>
                <Field label="Phone Number" error={errors.customerPhone}>
                  <input
                    type="tel"
                    placeholder="e.g. (416) 555-0123"
                    value={form.customerPhone}
                    onChange={e => set('customerPhone', e.target.value)}
                    className="field-input"
                    style={fieldStyle(!!errors.customerPhone)}
                  />
                </Field>
              </div>
            </div>

            {/* Location */}
            <div>
              <SectionLabel icon={<MapPin className="w-3.5 h-3.5" />} label="Location" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                <Field label="City / Province" error={errors.location}>
                  <input
                    type="text"
                    placeholder="e.g. Toronto, ON"
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    className="field-input"
                    style={fieldStyle(!!errors.location)}
                  />
                </Field>
                <Field label="Full Address" error={errors.address}>
                  <input
                    type="text"
                    placeholder="e.g. 220 King St W, Toronto"
                    value={form.address}
                    onChange={e => set('address', e.target.value)}
                    className="field-input"
                    style={fieldStyle(!!errors.address)}
                  />
                </Field>
              </div>
            </div>

            {/* Service type */}
            <div>
              <SectionLabel icon={<Wrench className="w-3.5 h-3.5" />} label="Service Type" />
              <div className="mt-3">
                <Field label="" error={errors.serviceType}>
                  <select
                    value={form.serviceType}
                    onChange={e => set('serviceType', e.target.value)}
                    style={{ ...fieldStyle(!!errors.serviceType), background: 'white', cursor: 'pointer' }}
                    className="w-full appearance-none"
                  >
                    <option value="">Select service type…</option>
                    {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
            </div>

            {/* Urgency */}
            <div>
              <SectionLabel icon={<AlertOctagon className="w-3.5 h-3.5" />} label="Urgency Level" />
              {errors.urgency && <p className="text-xs mt-1" style={{ color: '#e8401a' }}>{errors.urgency}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
                {URGENCY_OPTIONS.map(opt => {
                  const selected = form.urgency === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => set('urgency', opt.value)}
                      className="text-left rounded-2xl p-3 transition-all"
                      style={{
                        background: selected ? opt.bg : '#f8faff',
                        border: `2px solid ${selected ? opt.active : '#e2e9f7'}`,
                        boxShadow: selected ? `0 4px 12px ${opt.active}30` : 'none',
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: selected ? opt.active : '#c8d3e8' }} />
                        <span className="text-xs font-extrabold" style={{ color: selected ? opt.active : '#64748b' }}>{opt.label}</span>
                      </div>
                      <p className="text-[10px] leading-tight" style={{ color: selected ? opt.active : '#94a3b8', opacity: 0.85 }}>
                        {opt.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Description */}
            <div>
              <SectionLabel icon={<FileText className="w-3.5 h-3.5" />} label="Description" />
              <div className="mt-3">
                <Field label="" error={errors.description}>
                  <textarea
                    placeholder="Describe the issue in detail — what the customer reported, what has been tried, any safety concerns…"
                    value={form.description}
                    onChange={e => set('description', e.target.value)}
                    rows={4}
                    className="w-full resize-none"
                    style={{ ...fieldStyle(!!errors.description) }}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            className="shrink-0 px-7 py-4 flex items-center justify-between gap-3"
            style={{ background: '#f8faff', borderTop: '1.5px solid #eef2fb' }}
          >
            <p className="text-xs" style={{ color: '#94a3b8' }}>
              Job will be created with <strong style={{ color: '#0e2040' }}>New</strong> status and appear on the board immediately.
            </p>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                style={{ border: '1.5px solid #dde5f5', color: '#64748b', background: 'white' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#0e2040'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#dde5f5'}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #0e2040, #1a3461)', boxShadow: '0 4px 14px rgba(14,32,64,0.3)' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #e8401a, #f97316)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'linear-gradient(135deg, #0e2040, #1a3461)'}
              >
                Create Job
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function fieldStyle(hasError: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '10px',
    border: `1.5px solid ${hasError ? '#fca28a' : '#dde5f5'}`,
    background: hasError ? '#fff5f3' : 'white',
    color: '#0e2040',
    fontSize: '14px',
    outline: 'none',
  };
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ color: '#94a3b8' }}>{icon}</div>
      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#94a3b8' }}>{label}</span>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold mb-1.5" style={{ color: '#64748b' }}>{label}</label>}
      {children}
      {error && <p className="text-xs mt-1" style={{ color: '#e8401a' }}>{error}</p>}
    </div>
  );
}
