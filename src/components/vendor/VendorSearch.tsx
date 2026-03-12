import { Search } from 'lucide-react';

const CATEGORIES = ['All', 'Plumbing', 'HVAC', 'Electrical', 'Gas'];

interface Props {
  query: string;
  onQuery: (v: string) => void;
  category: string;
  onCategory: (v: string) => void;
}

export default function VendorSearch({ query, onQuery, category, onCategory }: Props) {
  return (
    <div className="flex flex-col gap-3">
      {/* Search input */}
      <div className="relative">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: '#94a3b8' }}
        />
        <input
          type="text"
          value={query}
          onChange={e => onQuery(e.target.value)}
          placeholder="Search by name, specialty, or location…"
          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
          style={{
            background: '#ffffff',
            border: '1px solid #e2e9f7',
            color: '#0e2040',
            boxShadow: '0 1px 3px rgba(14,32,64,0.04)',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
          onBlur={e => { e.currentTarget.style.borderColor = '#e2e9f7'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(14,32,64,0.04)'; }}
        />
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {CATEGORIES.map(cat => {
          const active = category === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategory(cat)}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={
                active
                  ? { background: '#0e2040', color: '#ffffff', boxShadow: '0 2px 8px rgba(14,32,64,0.25)' }
                  : { background: '#ffffff', color: '#64748b', border: '1px solid #e2e9f7' }
              }
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
