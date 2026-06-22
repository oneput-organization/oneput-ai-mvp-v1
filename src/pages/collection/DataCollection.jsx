import { useState, useRef } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import { CATEGORIES, STATUSES } from '../../data/gri-metrics';
import {
  METRIC_FORMS,
  parseMetricValue,
  serializeMetricValue,
  getDisplayValue,
  validateStructuredForm,
} from '../../data/gri-metric-forms';
import { validateMetricValue, parseCSV, generateCSVTemplate } from '../../utils/validation';
import {
  Search, Filter, Upload, Download, X, Send,
  CheckCircle2, XCircle, Clock, AlertTriangle,
  FileSpreadsheet, ChevronRight, MessageSquare, Info,
} from 'lucide-react';

export default function DataCollection() {
  const { activeMetrics, dataEntries, updateDataEntry, bulkUpdateEntries, addComment } = useData();
  const { can } = useUser();
  const canEnter = can('data:enter');   // Contributor / Admin — create & submit data
  const canReview = can('data:review'); // Reviewer / Admin — start review, approve, reject
  const canComment = can('comment:create') || can('comment:reply');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [showCSVUpload, setShowCSVUpload] = useState(false);

  const filtered = activeMetrics.filter(m => {
    const entry = dataEntries[m.id] || {};
    const matchSearch = !search ||
      m.code.toLowerCase().includes(search.toLowerCase()) ||
      m.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = categoryFilter === 'All' || m.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || (entry.status || 'pending') === statusFilter;
    return matchSearch && matchCategory && matchStatus;
  });

  const statusCounts = {};
  STATUSES.forEach(s => { statusCounts[s.key] = 0; });
  activeMetrics.forEach(m => {
    const status = (dataEntries[m.id] || {}).status || 'pending';
    if (statusCounts[status] !== undefined) statusCounts[status]++;
  });

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Data Collection</h1>
          <p>Enter, review, and approve ESG metric data for your reporting period.</p>
        </div>
        <div className="page-header-actions">
          {can('data:csv') && (
            <button className="btn btn-secondary" onClick={() => setShowCSVUpload(true)}>
              <Upload size={16} /> Import CSV
            </button>
          )}
          <button className="btn btn-secondary" onClick={() => {
            const csv = generateCSVTemplate(activeMetrics);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'gri_metrics_template.csv'; a.click();
            URL.revokeObjectURL(url);
          }}>
            <Download size={16} /> Download Template
          </button>
        </div>
      </div>

      {/* Status overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        {STATUSES.map(s => (
          <div
            key={s.key}
            className="card"
            style={{ padding: 'var(--space-3) var(--space-4)', cursor: 'pointer', borderColor: statusFilter === s.key ? 'var(--primary-500)' : undefined }}
            onClick={() => setStatusFilter(statusFilter === s.key ? 'All' : s.key)}
          >
            <div style={{ fontSize: 'var(--font-xl)', fontWeight: 700 }}>{statusCounts[s.key]}</div>
            <div className={`status-badge ${s.key}`} style={{ marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search metrics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            className={`filter-chip ${categoryFilter === cat.key ? 'active' : ''}`}
            onClick={() => setCategoryFilter(categoryFilter === cat.key ? 'All' : cat.key)}
          >
            {cat.label}
          </button>
        ))}
        {statusFilter !== 'All' && (
          <button className="filter-chip active" onClick={() => setStatusFilter('All')}>
            {statusFilter} <X size={12} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table table-clickable">
          <thead>
            <tr>
              <th style={{ width: 100 }}>Code</th>
              <th>Metric</th>
              <th style={{ width: 120 }}>Category</th>
              <th style={{ width: 160 }}>Value</th>
              <th style={{ width: 130 }}>Status</th>
              <th style={{ width: 40 }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(metric => {
              const entry = dataEntries[metric.id] || {};
              const status = entry.status || 'pending';
              const display = getDisplayValue(metric.id, entry.value, metric.unit);
              const categoryBadge = metric.category === 'Environmental' ? 'badge-env' : metric.category === 'Social' ? 'badge-social' : 'badge-gov';
              return (
                <tr key={metric.id} onClick={() => setSelectedMetric(metric)}>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--primary-500)', fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}>
                      {metric.code}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{metric.name}</div>
                    {metric.required === false && (
                      <span style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-400)' }}>Recommended</span>
                    )}
                  </td>
                  <td><span className={`badge ${categoryBadge}`}>{metric.category}</span></td>
                  <td>
                    <span style={{ fontWeight: display ? 600 : 400, color: display ? 'var(--neutral-800)' : 'var(--neutral-400)', fontSize: 'var(--font-sm)' }}>
                      {display || '—'}
                    </span>
                  </td>
                  <td><span className={`status-badge ${status}`}>{status.replace('-', ' ')}</span></td>
                  <td><ChevronRight size={16} style={{ color: 'var(--neutral-400)' }} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Filter size={28} /></div>
          <h3>No metrics match your filters</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {selectedMetric && (
        <MetricEntryModal
          metric={selectedMetric}
          entry={dataEntries[selectedMetric.id] || {}}
          canEnter={canEnter}
          canReview={canReview}
          canComment={canComment}
          onClose={() => setSelectedMetric(null)}
          onSave={(data) => updateDataEntry(selectedMetric.id, data)}
          onAddComment={(text) => addComment(selectedMetric.id, text)}
        />
      )}

      {showCSVUpload && (
        <CSVUploadModal
          metrics={activeMetrics}
          onClose={() => setShowCSVUpload(false)}
          onImport={(entries) => { bulkUpdateEntries(entries); setShowCSVUpload(false); }}
        />
      )}
    </div>
  );
}

// ─── METRIC ENTRY MODAL ───────────────────────────────────────────────────────

function MetricEntryModal({ metric, entry, canEnter, canReview, canComment, onClose, onSave, onAddComment }) {
  const form = METRIC_FORMS[metric.id];
  const initialVals = form ? parseMetricValue(entry.value) : {};

  const [fieldValues, setFieldValues] = useState(initialVals);
  const [simpleValue, setSimpleValue] = useState(entry.value || '');
  const [notes, setNotes] = useState(entry.notes || '');
  const [fieldErrors, setFieldErrors] = useState({});
  const [simpleErrors, setSimpleErrors] = useState([]);
  const [commentText, setCommentText] = useState('');
  const comments = entry.comments || [];
  const status = entry.status || 'pending';

  const setField = (key, val) => {
    setFieldValues(prev => ({ ...prev, [key]: val }));
    setFieldErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const validate = () => {
    if (form) {
      const errors = validateStructuredForm(metric.id, fieldValues);
      setFieldErrors(errors);
      return Object.keys(errors).length === 0;
    }
    const errs = validateMetricValue(simpleValue, metric);
    setSimpleErrors(errs);
    return errs.length === 0;
  };

  const handleSubmit = (newStatus) => {
    if (!validate()) return;
    const value = form ? serializeMetricValue(fieldValues) : simpleValue;
    onSave({ value, notes, status: newStatus });
    onClose();
  };

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    onAddComment(commentText.trim());
    setCommentText('');
  };

  const categoryBadge = metric.category === 'Environmental' ? 'badge-env' : metric.category === 'Social' ? 'badge-social' : 'badge-gov';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" style={{ maxWidth: 760 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: 'var(--font-lg)' }}>{metric.code} — {metric.name}</h2>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              <span className={`badge ${categoryBadge}`}>{metric.category}</span>
              <span className="badge badge-gray">{metric.subcategory}</span>
              <span className={`status-badge ${status}`}>{status.replace('-', ' ')}</span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* GRI description */}
          <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'var(--neutral-50)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-5)', display: 'flex', gap: 'var(--space-3)' }}>
            <Info size={15} style={{ color: 'var(--neutral-400)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-600)', lineHeight: 1.6 }}>
              {metric.description}
            </p>
          </div>

          {/* Structured form OR simple input */}
          {form ? (
            <StructuredMetricForm
              form={form}
              values={fieldValues}
              errors={fieldErrors}
              onChange={setField}
            />
          ) : (
            <SimpleMetricInput
              metric={metric}
              value={simpleValue}
              errors={simpleErrors}
              onChange={v => { setSimpleValue(v); setSimpleErrors([]); }}
            />
          )}

          {/* Notes */}
          <div className="form-group" style={{ marginTop: 'var(--space-5)' }}>
            <label className="form-label">Notes / Evidence</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Add supporting notes, data sources, or methodology references..."
            />
          </div>

          {/* Comments */}
          {comments.length > 0 && (
            <div className="comment-thread" style={{ marginTop: 'var(--space-4)' }}>
              <h4 style={{ fontSize: 'var(--font-sm)', marginBottom: 'var(--space-3)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <MessageSquare size={14} /> Comments ({comments.length})
              </h4>
              {comments.map(c => (
                <div key={c.id} className="comment">
                  <div className="comment-avatar">{c.author[0]}</div>
                  <div className="comment-body">
                    <div className="comment-author">{c.author}</div>
                    <div className="comment-text">{c.text}</div>
                    <div className="comment-time">{new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {canComment && (
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              <input
                className="form-input"
                placeholder="Add a comment..."
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
              />
              <button className="btn btn-ghost" onClick={handleAddComment}><Send size={16} /></button>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>

          {canEnter && (status === 'pending' || status === 'in-progress' || status === 'rejected') && (
            <button className="btn btn-secondary" onClick={() => handleSubmit('in-progress')}>
              Save Draft
            </button>
          )}
          {canEnter && (status === 'pending' || status === 'in-progress' || status === 'rejected') && (
            <button className="btn btn-primary" onClick={() => handleSubmit('submitted')}>
              <Send size={16} /> Submit for Review
            </button>
          )}
          {canReview && status === 'submitted' && (
            <button className="btn btn-primary" onClick={() => handleSubmit('under-review')}>
              <Clock size={16} /> Start Review
            </button>
          )}
          {canReview && status === 'under-review' && (
            <>
              <button className="btn btn-danger" onClick={() => handleSubmit('rejected')}>
                <XCircle size={16} /> Reject
              </button>
              <button className="btn btn-primary" style={{ background: 'var(--success-600)' }} onClick={() => handleSubmit('approved')}>
                <CheckCircle2 size={16} /> Approve
              </button>
            </>
          )}
          {canReview && status === 'approved' && (
            <button className="btn btn-secondary" onClick={() => handleSubmit('in-progress')}>Reopen</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── STRUCTURED FORM ─────────────────────────────────────────────────────────

function StructuredMetricForm({ form, values, errors, onChange }) {
  return (
    <div>
      {form.sections.map((section, si) => (
        <div key={si} style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{
            fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--neutral-500)',
            marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-2)',
            borderBottom: '1px solid var(--neutral-200)',
          }}>
            {section.label}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
            {section.fields.map(field => (
              <FieldInput
                key={field.key}
                field={field}
                value={values[field.key] ?? ''}
                error={errors[field.key]}
                onChange={val => onChange(field.key, val)}
                fullWidth={field.type === 'textarea' || field.type === 'text' && field.placeholder?.length > 40}
              />
            ))}
          </div>
        </div>
      ))}

      {form.computed && form.computed.length > 0 && (
        <div style={{ marginTop: 'var(--space-2)' }}>
          <div style={{
            fontSize: 'var(--font-xs)', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.06em', color: 'var(--neutral-500)',
            marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-2)',
            borderBottom: '1px solid var(--neutral-200)',
          }}>
            Calculated Values
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            {form.computed.map(comp => {
              const result = comp.formula(values);
              return (
                <div key={comp.key} style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--primary-50)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--primary-100)',
                }}>
                  <div style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)', marginBottom: 2 }}>
                    {comp.label}
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: 'var(--font-lg)' }}>
                    {result !== '' && result !== null && result !== undefined ? `${result} ${comp.unit}` : '—'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FieldInput({ field, value, error, onChange, fullWidth }) {
  const inputStyle = {
    gridColumn: fullWidth ? '1 / -1' : undefined,
  };

  return (
    <div className="form-group" style={inputStyle}>
      <label className="form-label" style={{ fontSize: 'var(--font-xs)' }}>
        {field.label}
        {field.unit && (
          <span style={{ fontWeight: 400, color: 'var(--neutral-400)', marginLeft: 4 }}>({field.unit})</span>
        )}
        {field.required && <span style={{ color: 'var(--error-500)', marginLeft: 2 }}>*</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          className={`form-textarea ${error ? 'error' : ''}`}
          rows={3}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || ''}
        />
      ) : field.type === 'select' ? (
        <select
          className={`form-select ${error ? 'error' : ''}`}
          value={value}
          onChange={e => onChange(e.target.value)}
        >
          <option value="">Select...</option>
          {field.options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : (
        <input
          className={`form-input ${error ? 'error' : ''}`}
          type="number"
          step={field.step ?? 'any'}
          min={field.min ?? 0}
          max={field.max}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder || `Enter value${field.unit ? ` in ${field.unit}` : ''}...`}
        />
      )}

      {field.helpText && !error && (
        <div style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-400)', marginTop: 'var(--space-1)' }}>
          {field.helpText}
        </div>
      )}
      {error && <div className="form-error">{error}</div>}
    </div>
  );
}

// ─── SIMPLE INPUT (text / plain number metrics) ───────────────────────────────

function SimpleMetricInput({ metric, value, errors, onChange }) {
  return (
    <div className="form-group">
      <label className="form-label">
        Value
        {metric.unit !== 'text' && (
          <span style={{ color: 'var(--neutral-400)', fontWeight: 400 }}> ({metric.unit})</span>
        )}
      </label>
      {metric.dataType === 'text' ? (
        <textarea
          className={`form-textarea ${errors.length > 0 ? 'error' : ''}`}
          rows={5}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={`Enter ${metric.name.toLowerCase()}...`}
        />
      ) : (
        <input
          className={`form-input ${errors.length > 0 ? 'error' : ''}`}
          type="number"
          step="any"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={`Enter value in ${metric.unit}...`}
        />
      )}
      {errors.map((err, i) => <div key={i} className="form-error">{err}</div>)}
    </div>
  );
}

// ─── CSV UPLOAD MODAL ─────────────────────────────────────────────────────────

function CSVUploadModal({ metrics, onClose, onImport }) {
  const [csvData, setCsvData] = useState(null);
  const [errors, setErrors] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const { headers, rows } = parseCSV(e.target.result);
      const validationErrors = [];
      const validRows = [];

      rows.forEach(row => {
        const metric = metrics.find(m => m.code === row.metric_code);
        if (!metric) {
          validationErrors.push(`Row ${row._rowIndex}: Unknown metric code "${row.metric_code}"`);
          return;
        }
        const valErrors = validateMetricValue(row.value, metric);
        if (valErrors.length > 0) {
          validationErrors.push(`Row ${row._rowIndex} (${row.metric_code}): ${valErrors.join(', ')}`);
        } else {
          validRows.push({ metricId: metric.id, data: { value: row.value, notes: row.notes || '', status: 'submitted' } });
        }
      });

      setCsvData({ headers, rows, validRows });
      setErrors(validationErrors);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Import CSV Data</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal-body">
          {!csvData ? (
            <div
              className={`csv-dropzone ${dragOver ? 'dragover' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <div className="csv-dropzone-icon"><FileSpreadsheet size={24} /></div>
              <h3 style={{ marginBottom: 'var(--space-2)' }}>Drop your CSV file here</h3>
              <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--font-sm)' }}>
                or click to browse. Download the template first for the correct format.
              </p>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])} />
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
                  <h4>Preview</h4>
                  <span style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)' }}>
                    {csvData.rows.length} rows • {csvData.validRows.length} valid
                  </span>
                </div>
                <div className="table-container" style={{ maxHeight: 300, overflow: 'auto' }}>
                  <table className="table">
                    <thead>
                      <tr>{csvData.headers.map(h => <th key={h}>{h}</th>)}<th>Status</th></tr>
                    </thead>
                    <tbody>
                      {csvData.rows.slice(0, 20).map((row, i) => {
                        const hasError = errors.some(e => e.startsWith(`Row ${row._rowIndex}`));
                        return (
                          <tr key={i} style={{ background: hasError ? 'var(--error-50)' : undefined }}>
                            {csvData.headers.map(h => <td key={h}>{row[h]}</td>)}
                            <td>{hasError
                              ? <span className="badge badge-red">Error</span>
                              : <span className="badge badge-green">Valid</span>}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
              {errors.length > 0 && (
                <div style={{ background: 'var(--error-50)', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
                    <AlertTriangle size={16} style={{ color: 'var(--error-600)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--error-600)', fontSize: 'var(--font-sm)' }}>
                      {errors.length} validation error{errors.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <ul style={{ fontSize: 'var(--font-xs)', color: 'var(--error-600)', paddingLeft: 'var(--space-5)' }}>
                    {errors.slice(0, 10).map((e, i) => <li key={i}>{e}</li>)}
                    {errors.length > 10 && <li>...and {errors.length - 10} more</li>}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => csvData ? (setCsvData(null), setErrors([])) : onClose()}>
            {csvData ? 'Upload Different File' : 'Cancel'}
          </button>
          {csvData && csvData.validRows.length > 0 && (
            <button className="btn btn-primary" onClick={() => onImport(csvData.validRows)}>
              <Upload size={16} /> Import {csvData.validRows.length} Entries
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
