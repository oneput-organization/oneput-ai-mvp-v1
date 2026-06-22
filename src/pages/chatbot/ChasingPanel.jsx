import { useState } from 'react';
import { useAssistant } from '../../contexts/AssistantContext';
import { Send, AlertTriangle, CalendarClock, Play, Sparkles, Trash2 } from 'lucide-react';

const kindIcon = {
  request: <CalendarClock size={14} />,
  nudge: <Send size={14} />,
  escalate: <AlertTriangle size={14} />,
};

const isOverdue = (dueDate) => !!dueDate && new Date(dueDate).getTime() < Date.now();

export default function ChasingPanel() {
  const { dataRequests, activityLog, ownerName, pendingForOwner, planRequests, sendNudge, escalate, runChase, clearLog } = useAssistant();
  const [due, setDue] = useState('');
  const [busy, setBusy] = useState(false);

  const withBusy = async (fn) => { setBusy(true); try { await fn(); } finally { setBusy(false); } };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Data Chasing</h1>
          <p>Oneput AI requests ESG data from each owner and follows up until it's submitted.</p>
        </div>
        <div className="page-header-actions">
          <input
            type="date"
            className="form-input"
            value={due}
            onChange={e => setDue(e.target.value)}
            title="Due date for requests"
            style={{ width: 160 }}
          />
          <button className="btn btn-secondary" onClick={() => planRequests(due)}>
            <Sparkles size={16} /> Plan requests
          </button>
          <button className="btn btn-primary" disabled={busy || dataRequests.length === 0} onClick={() => withBusy(runChase)}>
            <Play size={16} /> Run chase
          </button>
        </div>
      </div>

      {/* Requests */}
      <div className="table-container" style={{ marginBottom: 'var(--space-6)' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Owner</th>
              <th style={{ width: 120 }}>Requested</th>
              <th style={{ width: 120 }}>Outstanding</th>
              <th style={{ width: 130 }}>Due</th>
              <th style={{ width: 200 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataRequests.map(r => {
              const outstanding = pendingForOwner(r.ownerId).length;
              const overdue = isOverdue(r.dueDate);
              return (
                <tr key={r.id}>
                  <td style={{ fontWeight: 500 }}>{ownerName(r.ownerId)}</td>
                  <td>{r.metricIds.length}</td>
                  <td>
                    <span className={`status-badge ${outstanding === 0 ? 'approved' : 'submitted'}`}>
                      {outstanding === 0 ? 'complete' : `${outstanding} left`}
                    </span>
                  </td>
                  <td style={{ color: overdue ? 'var(--error-600)' : undefined, fontSize: 'var(--font-sm)' }}>
                    {r.dueDate || '—'}{overdue ? ' (overdue)' : ''}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button className="btn btn-ghost btn-sm" disabled={busy || outstanding === 0} onClick={() => withBusy(() => sendNudge(r.ownerId))}>
                        <Send size={13} /> Nudge
                      </button>
                      <button className="btn btn-ghost btn-sm" disabled={busy || outstanding === 0} onClick={() => withBusy(() => escalate(r.ownerId))}>
                        <AlertTriangle size={13} /> Escalate
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {dataRequests.length === 0 && (
        <div className="empty-state" style={{ marginBottom: 'var(--space-6)' }}>
          <div className="empty-state-icon"><CalendarClock size={28} /></div>
          <h3>No data requests yet</h3>
          <p>Assign metrics to owners in Data Collection, then click "Plan requests".</p>
        </div>
      )}

      {/* Activity log */}
      <div className="card" style={{ padding: 'var(--space-4) var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h4 style={{ fontSize: 'var(--font-sm)' }}>Activity log</h4>
          {activityLog.length > 0 && (
            <button className="btn btn-ghost btn-sm" onClick={clearLog}><Trash2 size={13} /> Clear</button>
          )}
        </div>
        {activityLog.length === 0 ? (
          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-400)' }}>No activity yet. Plan requests and run a chase to see follow-ups here.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {activityLog.slice().reverse().map(ev => (
              <li key={ev.id} style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', fontSize: 'var(--font-sm)' }}>
                <span style={{ color: 'var(--neutral-400)', marginTop: 2 }}>{kindIcon[ev.kind]}</span>
                <span>
                  <span style={{ color: 'var(--neutral-400)', fontSize: 'var(--font-xs)' }}>{new Date(ev.ts).toLocaleString()} · </span>
                  {ev.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
