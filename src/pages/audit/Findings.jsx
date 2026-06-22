import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { ClipboardList, Plus } from 'lucide-react';

const SEVERITIES = ['low', 'medium', 'high'];
const sevBadge = (s) => (s === 'high' ? 'badge-red' : s === 'low' ? 'badge-gray' : 'badge-amber');

export default function Findings() {
  const { findings, addFinding, setFindingStatus } = useData();
  const [text, setText] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [scope, setScope] = useState('');

  const submit = () => {
    if (!text.trim()) return;
    addFinding({ text: text.trim(), severity, scope: scope.trim() });
    setText(''); setScope(''); setSeverity('medium');
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Audit Findings</h1>
          <p>Record observations and findings against source data and the audit trail.</p>
        </div>
      </div>

      {/* New finding */}
      <div className="card" style={{ padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', gap: 'var(--space-3)', alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Observation / finding</label>
            <input className="form-input" value={text} onChange={e => setText(e.target.value)} placeholder="Describe the observation..." onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Scope</label>
            <input className="form-input" value={scope} onChange={e => setScope(e.target.value)} placeholder="e.g. GRI 305-1" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Severity</label>
            <select className="form-select" value={severity} onChange={e => setSeverity(e.target.value)}>
              {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <button className="btn btn-primary" disabled={!text.trim()} onClick={submit}><Plus size={15} /> Log finding</button>
        </div>
      </div>

      {findings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><ClipboardList size={28} /></div>
          <h3>No findings logged</h3>
          <p>Observations you record appear here and in the audit trail.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>Severity</th>
                <th>Finding</th>
                <th style={{ width: 120 }}>Scope</th>
                <th style={{ width: 160 }}>Logged by</th>
                <th style={{ width: 110 }}>Status</th>
                <th style={{ width: 120 }}></th>
              </tr>
            </thead>
            <tbody>
              {findings.slice().reverse().map(f => (
                <tr key={f.id}>
                  <td><span className={`badge ${sevBadge(f.severity)}`}>{f.severity}</span></td>
                  <td style={{ fontSize: 'var(--font-sm)' }}>{f.text}</td>
                  <td style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)' }}>{f.scope || '—'}</td>
                  <td style={{ fontSize: 'var(--font-xs)' }}>{f.author?.name || 'Unknown'}<br /><span style={{ color: 'var(--neutral-400)' }}>{new Date(f.createdAt).toLocaleDateString()}</span></td>
                  <td><span className={`status-badge ${f.status === 'closed' ? 'approved' : 'submitted'}`}>{f.status}</span></td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => setFindingStatus(f.id, f.status === 'open' ? 'closed' : 'open')}>
                      {f.status === 'open' ? 'Close' : 'Reopen'}
                    </button>
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
