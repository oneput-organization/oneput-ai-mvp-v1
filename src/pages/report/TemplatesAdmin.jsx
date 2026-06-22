import { useState } from 'react';
import { useReports } from '../../contexts/ReportContext';
import { useData } from '../../contexts/DataContext';
import { FileText, Plus, Trash2, X } from 'lucide-react';

export default function TemplatesAdmin() {
  const { allTemplates, addTemplate, updateTemplate, deleteTemplate } = useReports();
  const { allMetrics } = useData();

  const [newName, setNewName] = useState('');
  const [selectedId, setSelectedId] = useState(allTemplates[0]?.id || null);
  const selected = allTemplates.find(t => t.id === selectedId) || allTemplates[0] || null;

  const createTemplate = () => {
    if (!newName.trim()) return;
    const t = addTemplate({ name: newName.trim() });
    setNewName('');
    setSelectedId(t.id);
  };

  // Section editing (custom templates only) — replace the sections array on each change.
  const setSections = (sections) => updateTemplate(selected.id, { sections });
  const editSection = (idx, patch) => setSections(selected.sections.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  const addSection = () => setSections([...selected.sections, { title: 'New section', boilerplate: '', requiredMetricIds: [] }]);
  const removeSection = (idx) => setSections(selected.sections.filter((_, i) => i !== idx));
  const insertVar = (idx, metricId) => { if (metricId) editSection(idx, { boilerplate: `${selected.sections[idx].boilerplate}{{metric:${metricId}}}` }); };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Report Templates</h1>
          <p>Manage the standard-compliant report templates used to generate reports.</p>
        </div>
        <div className="page-header-actions" style={{ gap: 'var(--space-2)' }}>
          <input className="form-input" placeholder="New template name…" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createTemplate()} style={{ width: 200 }} />
          <button className="btn btn-primary btn-sm" disabled={!newName.trim()} onClick={createTemplate}><Plus size={15} /> New template</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-5)' }}>
        {/* Template list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {allTemplates.map(t => (
            <button key={t.id} className="card" onClick={() => setSelectedId(t.id)}
              style={{ textAlign: 'left', padding: 'var(--space-3) var(--space-4)', borderColor: t.id === selected?.id ? 'var(--primary-500)' : undefined, cursor: 'pointer' }}>
              <div style={{ fontWeight: 500, fontSize: 'var(--font-sm)' }}>{t.name}</div>
              <span className={`badge ${t.custom ? 'badge-blue' : 'badge-gray'}`} style={{ marginTop: 4, fontSize: 'var(--font-xs)' }}>
                {t.custom ? 'custom' : 'bundled'} · {t.sections.length} section(s)
              </span>
            </button>
          ))}
        </div>

        {/* Editor */}
        {selected && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
              {selected.custom ? (
                <input className="form-input" value={selected.name} onChange={e => updateTemplate(selected.id, { name: e.target.value })} style={{ maxWidth: 360, fontWeight: 600 }} />
              ) : (
                <h2 style={{ fontSize: 'var(--font-lg)' }}>{selected.name}</h2>
              )}
              {selected.custom && (
                <button className="btn btn-ghost" onClick={() => { deleteTemplate(selected.id); setSelectedId(null); }}><Trash2 size={15} /> Delete</button>
              )}
            </div>

            {!selected.custom && (
              <div className="card" style={{ padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)', background: 'var(--neutral-50)' }}>
                <p style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-500)' }}>This is the bundled GRI template (read-only). Create a custom template to edit sections and variables.</p>
              </div>
            )}

            {selected.sections.map((section, idx) => (
              <div key={idx} className="card" style={{ padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                  {selected.custom ? (
                    <input className="form-input" value={section.title} onChange={e => editSection(idx, { title: e.target.value })} style={{ fontWeight: 600 }} />
                  ) : (
                    <h4 style={{ fontSize: 'var(--font-base)', flex: 1 }}>{section.title}</h4>
                  )}
                  {selected.custom && <button className="btn btn-ghost btn-sm" onClick={() => removeSection(idx)}><X size={14} /></button>}
                </div>
                <textarea
                  className="form-textarea"
                  rows={4}
                  value={section.boilerplate}
                  readOnly={!selected.custom}
                  onChange={e => editSection(idx, { boilerplate: e.target.value })}
                  style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}
                />
                {selected.custom && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)' }}>Insert variable:</span>
                    <select className="form-select" defaultValue="" onChange={e => { insertVar(idx, e.target.value); e.target.value = ''; }} style={{ height: 30, fontSize: 'var(--font-xs)', maxWidth: 320 }}>
                      <option value="">Pick a metric…</option>
                      {allMetrics.map(m => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
            ))}

            {selected.custom && (
              <button className="btn btn-secondary" onClick={addSection}><Plus size={15} /> Add section</button>
            )}

            {selected.sections.length === 0 && !selected.custom && (
              <div className="empty-state"><div className="empty-state-icon"><FileText size={28} /></div><h3>No sections</h3></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
