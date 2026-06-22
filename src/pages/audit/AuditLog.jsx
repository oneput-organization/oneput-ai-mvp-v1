import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { GRI_METRICS } from '../../data/gri-metrics';
import { Search, History } from 'lucide-react';

// Friendly label for an audit event's target.
function targetLabel(target) {
  if (!target) return '—';
  if (target.type === 'metric') {
    const m = GRI_METRICS.find(x => x.id === target.id);
    return m ? m.code : target.id;
  }
  if (target.type === 'report') return 'Report';
  if (target.type === 'user') return 'User';
  if (target.type === 'setting') return 'Setting';
  return target.id || target.type;
}

export default function AuditLog() {
  const { auditEvents } = useData();

  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');
  const [actorFilter, setActorFilter] = useState('All');

  const actions = ['All', ...Array.from(new Set(auditEvents.map(e => e.action)))];
  const actors = ['All', ...Array.from(new Set(auditEvents.map(e => e.actor?.name).filter(Boolean)))];

  const filtered = auditEvents
    .filter(e => actionFilter === 'All' || e.action === actionFilter)
    .filter(e => actorFilter === 'All' || e.actor?.name === actorFilter)
    .filter(e => {
      if (!search) return true;
      const hay = `${e.action} ${targetLabel(e.target)} ${e.actor?.name || ''} ${e.before ?? ''} ${e.after ?? ''}`.toLowerCase();
      return hay.includes(search.toLowerCase());
    })
    .slice()
    .reverse();

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Audit Trail</h1>
          <p>Read-only, append-only record of every action — who did what, and when.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} />
          <input type="text" placeholder="Search the trail..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-select" value={actionFilter} onChange={e => setActionFilter(e.target.value)} style={{ height: 34, maxWidth: 220 }}>
          {actions.map(a => <option key={a} value={a}>{a === 'All' ? 'All actions' : a}</option>)}
        </select>
        <select className="form-select" value={actorFilter} onChange={e => setActorFilter(e.target.value)} style={{ height: 34, maxWidth: 220 }}>
          {actors.map(a => <option key={a} value={a}>{a === 'All' ? 'All actors' : a}</option>)}
        </select>
        <span style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)', alignSelf: 'center' }}>{filtered.length} event(s)</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><History size={28} /></div>
          <h3>No audit events{auditEvents.length > 0 ? ' match your filters' : ' yet'}</h3>
          <p>Actions across data, reports, and chasing are recorded here automatically.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 180 }}>When</th>
                <th style={{ width: 180 }}>Actor</th>
                <th style={{ width: 170 }}>Action</th>
                <th style={{ width: 110 }}>Target</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id}>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)' }}>{new Date(e.timestamp).toLocaleString()}</td>
                  <td style={{ fontSize: 'var(--font-sm)' }}>
                    {e.actor?.name || 'Unknown'}
                    {e.actor?.role && <span style={{ color: 'var(--neutral-400)', fontSize: 'var(--font-xs)' }}> · {e.actor.role}</span>}
                  </td>
                  <td><span className="badge badge-gray" style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>{e.action}</span></td>
                  <td style={{ fontSize: 'var(--font-sm)' }}>{targetLabel(e.target)}</td>
                  <td style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-600)' }}>
                    {e.before != null && e.after != null
                      ? `${e.before} → ${e.after}`
                      : e.after != null
                      ? String(e.after).slice(0, 80)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
