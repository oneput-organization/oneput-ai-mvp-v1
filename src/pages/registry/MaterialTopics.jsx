import { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Layers, Plus, Trash2 } from 'lucide-react';

export default function MaterialTopics() {
  const { materialTopics, addTopic, updateTopic, deleteTopic, allMetrics } = useData();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const submit = () => {
    if (!name.trim()) return;
    addTopic({ name: name.trim(), description: description.trim(), metricIds: [] });
    setName(''); setDescription('');
  };

  const setMembership = (topicId, options) => {
    const metricIds = Array.from(options).filter(o => o.selected).map(o => o.value);
    updateTopic(topicId, { metricIds });
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Material Topics</h1>
          <p>Group related GRI metrics into the material topics that matter to your organization.</p>
        </div>
      </div>

      <div className="card" style={{ padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Topic name</label>
            <input className="form-input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Climate Change" />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Description</label>
            <input className="form-input" value={description} onChange={e => setDescription(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
          </div>
        </div>
        <div style={{ marginTop: 'var(--space-3)' }}>
          <button className="btn btn-primary" disabled={!name.trim()} onClick={submit}><Plus size={15} /> Add topic</button>
        </div>
      </div>

      {materialTopics.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Layers size={28} /></div>
          <h3>No material topics yet</h3>
          <p>Create a topic, then select the metrics that belong to it.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {materialTopics.map(t => (
            <div key={t.id} className="card" style={{ padding: 'var(--space-4) var(--space-5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                <div>
                  <h4 style={{ fontSize: 'var(--font-base)' }}>{t.name} <span className="badge badge-gray" style={{ fontSize: 'var(--font-xs)' }}>{t.metricIds.length} metric(s)</span></h4>
                  {t.description && <p style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-500)' }}>{t.description}</p>}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => deleteTopic(t.id)}><Trash2 size={14} /></button>
              </div>
              <label className="form-label">Metrics in this topic (ctrl/cmd-click to multi-select)</label>
              <select
                multiple
                className="form-select"
                value={t.metricIds}
                onChange={e => setMembership(t.id, e.target.options)}
                style={{ height: 140 }}
              >
                {allMetrics.map(m => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
