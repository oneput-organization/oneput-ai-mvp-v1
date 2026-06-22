import { useState, Fragment } from 'react';
import { CATEGORIES } from '../../data/gri-metrics';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import {
  Search, ChevronDown, ChevronUp, Filter, Plus, Pencil, Trash2, X,
} from 'lucide-react';

const categoryBadgeClass = (cat) =>
  cat === 'Environmental' ? 'badge-env' : cat === 'Social' ? 'badge-social' : 'badge-gov';

export default function MetricsRegistry() {
  const { allMetrics, activeMetricIds, toggleMetricActive, setAllMetricsActive, addMetric, updateMetric, deleteMetric, registrySource } = useData();
  const { can } = useUser();
  const canManage = can('metric:manage'); // Admin (via '*')

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [editing, setEditing] = useState(null); // metric being edited, or 'new'

  const filtered = allMetrics.filter(m => {
    const matchSearch = !search ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || m.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const activeCount = filtered.filter(m => activeMetricIds.includes(m.id)).length;

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>ESG Metrics Registry</h1>
          <p>
            Browse and manage GRI 2021 disclosure metrics. Toggle metrics on/off for your organization.
            <span style={{ color: 'var(--neutral-400)', fontSize: 'var(--font-xs)' }}>
              {' '}· Source: {registrySource === 'api' ? 'live GRI registry API' : 'bundled GRI 2021 subset'}
            </span>
          </p>
        </div>
        <div className="page-header-actions">
          {canManage && (
            <button className="btn btn-primary btn-sm" onClick={() => setEditing('new')}>
              <Plus size={15} /> Add metric
            </button>
          )}
          <button className="btn btn-secondary btn-sm" onClick={() => setAllMetricsActive(activeCount < filtered.length)}>
            {activeCount === filtered.length ? 'Deactivate All' : 'Activate All'}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} />
          <input type="text" placeholder="Search metrics by code or name..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button className={`filter-chip ${categoryFilter === 'All' ? 'active' : ''}`} onClick={() => setCategoryFilter('All')}>
          All ({allMetrics.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = allMetrics.filter(m => m.category === cat.key).length;
          return (
            <button key={cat.key} className={`filter-chip ${categoryFilter === cat.key ? 'active' : ''}`} onClick={() => setCategoryFilter(cat.key)}>
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-500)' }}>
          Showing {filtered.length} metrics • {activeCount} active
        </span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>Active</th>
              <th style={{ width: 120 }}>Code</th>
              <th>Metric Name</th>
              <th style={{ width: 120 }}>Category</th>
              <th style={{ width: 100 }}>Unit</th>
              <th style={{ width: 110 }}>Subcategory</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(metric => {
              const isActive = activeMetricIds.includes(metric.id);
              const isExpanded = expandedId === metric.id;
              return (
                <Fragment key={metric.id}>
                  <tr style={{ cursor: 'pointer' }} onClick={() => setExpandedId(isExpanded ? null : metric.id)}>
                    <td onClick={e => e.stopPropagation()}>
                      <label className="toggle">
                        <input type="checkbox" checked={isActive} onChange={() => toggleMetricActive(metric.id)} />
                        <span className="toggle-slider"></span>
                      </label>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--primary-500)', fontFamily: 'monospace' }}>{metric.code}</span>
                      {metric.custom && <span className="badge badge-blue" style={{ marginLeft: 6, fontSize: 'var(--font-xs)' }}>custom</span>}
                    </td>
                    <td><span style={{ fontWeight: 500 }}>{metric.name}</span></td>
                    <td><span className={`badge ${categoryBadgeClass(metric.category)}`}>{metric.category}</span></td>
                    <td><span style={{ color: 'var(--neutral-500)', fontSize: 'var(--font-xs)' }}>{metric.unit}</span></td>
                    <td><span style={{ color: 'var(--neutral-500)', fontSize: 'var(--font-xs)' }}>{metric.subcategory}</span></td>
                    <td>{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={7} style={{ background: 'var(--neutral-50)', padding: 'var(--space-5)' }}>
                        <div style={{ maxWidth: 700 }}>
                          <p style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-600)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }}>
                            {metric.description || '—'}
                          </p>
                          <div style={{ display: 'flex', gap: 'var(--space-6)', fontSize: 'var(--font-xs)', flexWrap: 'wrap' }}>
                            <div><span style={{ color: 'var(--neutral-400)', fontWeight: 600 }}>Data Type:</span> {metric.dataType}</div>
                            <div><span style={{ color: 'var(--neutral-400)', fontWeight: 600 }}>Framework:</span> <span className="badge badge-blue">{metric.framework.join(', ')}</span></div>
                            {metric.validationRules?.min !== undefined && <div><span style={{ color: 'var(--neutral-400)', fontWeight: 600 }}>Min:</span> {metric.validationRules.min}</div>}
                            {metric.validationRules?.max !== undefined && <div><span style={{ color: 'var(--neutral-400)', fontWeight: 600 }}>Max:</span> {metric.validationRules.max}</div>}
                          </div>
                          {canManage && metric.custom && (
                            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
                              <button className="btn btn-ghost btn-sm" onClick={() => setEditing(metric)}><Pencil size={13} /> Edit</button>
                              <button className="btn btn-ghost btn-sm" onClick={() => deleteMetric(metric.id)}><Trash2 size={13} /> Delete</button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Filter size={28} /></div>
          <h3>No metrics found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {editing && (
        <MetricForm
          metric={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSave={(data) => {
            if (editing === 'new') addMetric(data);
            else updateMetric(editing.id, data);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function MetricForm({ metric, onClose, onSave }) {
  const [form, setForm] = useState({
    code: metric?.code || '',
    name: metric?.name || '',
    description: metric?.description || '',
    category: metric?.category || 'Environmental',
    subcategory: metric?.subcategory || '',
    unit: metric?.unit || '',
    dataType: metric?.dataType || 'number',
    required: !!metric?.validationRules?.required,
    min: metric?.validationRules?.min ?? '',
    max: metric?.validationRules?.max ?? '',
    minLength: metric?.validationRules?.minLength ?? '',
    maxLength: metric?.validationRules?.maxLength ?? '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.code.trim() && form.name.trim();

  const submit = () => {
    if (!valid) return;
    const validationRules = {};
    if (form.required) validationRules.required = true;
    if (form.dataType === 'number') {
      if (form.min !== '') validationRules.min = Number(form.min);
      if (form.max !== '') validationRules.max = Number(form.max);
    } else {
      if (form.minLength !== '') validationRules.minLength = Number(form.minLength);
      if (form.maxLength !== '') validationRules.maxLength = Number(form.maxLength);
    }
    onSave({
      code: form.code.trim(),
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      subcategory: form.subcategory.trim(),
      unit: form.unit.trim() || (form.dataType === 'text' ? 'text' : ''),
      dataType: form.dataType,
      validationRules,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: 'var(--font-lg)' }}>{metric ? 'Edit metric' : 'Add GRI metric'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="form-group"><label className="form-label">Code *</label><input className="form-input" value={form.code} onChange={e => set('code', e.target.value)} placeholder="e.g. GRI 305-7" /></div>
          <div className="form-group"><label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
              {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="form-group" style={{ gridColumn: '1 / -1' }}><label className="form-label">Description</label><textarea className="form-textarea" rows={2} value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Subcategory</label><input className="form-input" value={form.subcategory} onChange={e => set('subcategory', e.target.value)} /></div>
          <div className="form-group"><label className="form-label">Unit</label><input className="form-input" value={form.unit} onChange={e => set('unit', e.target.value)} placeholder="e.g. tCO2e, %, count" /></div>
          <div className="form-group"><label className="form-label">Data type</label>
            <select className="form-select" value={form.dataType} onChange={e => set('dataType', e.target.value)}>
              <option value="number">number</option>
              <option value="text">text</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--font-sm)' }}>
              <input type="checkbox" checked={form.required} onChange={e => set('required', e.target.checked)} /> Required
            </label>
          </div>
          {form.dataType === 'number' ? (
            <>
              <div className="form-group"><label className="form-label">Min</label><input className="form-input" type="number" value={form.min} onChange={e => set('min', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Max</label><input className="form-input" type="number" value={form.max} onChange={e => set('max', e.target.value)} /></div>
            </>
          ) : (
            <>
              <div className="form-group"><label className="form-label">Min length</label><input className="form-input" type="number" value={form.minLength} onChange={e => set('minLength', e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Max length</label><input className="form-input" type="number" value={form.maxLength} onChange={e => set('maxLength', e.target.value)} /></div>
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}>{metric ? 'Save changes' : 'Add metric'}</button>
        </div>
      </div>
    </div>
  );
}
