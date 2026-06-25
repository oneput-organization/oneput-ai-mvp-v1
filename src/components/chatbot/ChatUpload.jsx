import { useState, useRef } from 'react';
import { Paperclip, X, Loader2, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import { extractEntries } from '../../services/assistant';
import { validateMetricValue } from '../../utils/validation';

// Resolve an extracted row to an active metric by GRI code first, then by name.
function resolveMetric(row, activeMetrics) {
  const code = (row.code || '').trim().toLowerCase();
  if (code) {
    const byCode = activeMetrics.find(m => m.code.toLowerCase() === code);
    if (byCode) return byCode;
  }
  const name = (row.name || '').trim().toLowerCase();
  if (name) {
    // exact, then a contains-match either direction (fuzzy)
    const byName = activeMetrics.find(m => m.name.toLowerCase() === name)
      || activeMetrics.find(m => m.name.toLowerCase().includes(name) || name.includes(m.name.toLowerCase()));
    if (byName) return byName;
    // a code embedded in the name cell, e.g. "GRI 305-1 — Direct emissions"
    const embedded = activeMetrics.find(m => name.includes(m.code.toLowerCase()));
    if (embedded) return embedded;
  }
  return null;
}

function mapRows(rows, activeMetrics, dataEntries) {
  return rows.map((row, i) => {
    const metric = resolveMetric(row, activeMetrics);
    const errors = metric ? validateMetricValue(row.value, metric) : [];
    const existing = metric ? dataEntries[metric.id]?.value : undefined;
    const valid = !!metric && errors.length === 0;
    return {
      key: i,
      raw: row,
      metric,
      value: row.value,
      unit: row.unit || metric?.unit || '',
      valid,
      errors,
      overwrite: existing !== undefined && existing !== '' && existing !== null,
      selected: valid, // pre-select only rows we can safely write
    };
  });
}

// Attach control + extract → review → confirm → fill. Renders a button (for the
// chat input area) and, when a file is dropped in, a confirmation modal.
// `onFilled(summaryText)` lets each chat surface push a grounded bot message.
export default function ChatUpload({ onFilled }) {
  const { activeMetrics, dataEntries, bulkUpdateEntries, logEvent } = useData();
  const { can } = useUser();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(null); // { fileName, rows[], notes }

  // Only data owners/contributors (or Admin via '*') may fill data points.
  if (!can('data:csv')) return null;

  const handleFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const { rows, notes } = await extractEntries(file, { activeMetrics });
      if (rows.length === 0) {
        onFilled?.(notes || `I couldn't read any rows from **${file.name}**.`);
        return;
      }
      setPreview({ fileName: file.name, rows: mapRows(rows, activeMetrics, dataEntries), notes });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const toggleRow = (key) =>
    setPreview(p => ({ ...p, rows: p.rows.map(r => (r.key === key ? { ...r, selected: !r.selected } : r)) }));

  const confirmFill = () => {
    const chosen = preview.rows.filter(r => r.selected && r.metric && r.valid);
    if (chosen.length > 0) {
      bulkUpdateEntries(chosen.map(r => ({
        metricId: r.metric.id,
        data: { value: r.value, notes: `Filled via chat upload (${preview.fileName})`, status: 'submitted' },
      })));
      chosen.forEach(r =>
        logEvent('data.upload', { type: 'metric', id: r.metric.id, code: r.metric.code }, null, String(r.value))
      );
    }
    const filled = chosen.length;
    const skipped = preview.rows.length - filled;
    onFilled?.(
      `📥 **Uploaded ${preview.fileName}** — filled **${filled}** data point${filled === 1 ? '' : 's'}` +
      `${skipped ? `, skipped **${skipped}** (unmatched or invalid)` : ''}.` +
      `${filled ? '\n\nThese are now **submitted** for review — open **Data Collection** to check them.' : ''}`
    );
    setPreview(null);
  };

  const selectable = preview?.rows.filter(r => r.metric && r.valid).length || 0;
  const selectedCount = preview?.rows.filter(r => r.selected && r.metric && r.valid).length || 0;

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        hidden
        onChange={e => handleFile(e.target.files[0])}
      />
      <button
        type="button"
        className="chat-attach-btn"
        title="Upload a data file to fill metrics"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
      >
        {busy ? <Loader2 size={16} className="spin" /> : <Paperclip size={16} />}
      </button>

      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review extracted data</h2>
              <button className="modal-close" onClick={() => setPreview(null)}><X size={18} /></button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: 'var(--font-sm)', color: 'var(--neutral-500)', marginBottom: 'var(--space-4)' }}>
                From <strong>{preview.fileName}</strong> — {selectable} of {preview.rows.length} row(s) match an active
                metric and pass validation. Confirm which to fill. Nothing is saved until you apply.
              </p>

              <div className="upload-preview">
                <table className="upload-preview-table">
                  <thead>
                    <tr>
                      <th style={{ width: 32 }}></th>
                      <th>Metric</th>
                      <th>Value</th>
                      <th>Unit</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map(r => (
                      <tr key={r.key} className={!r.metric || !r.valid ? 'is-skipped' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={r.selected}
                            disabled={!r.metric || !r.valid}
                            onChange={() => toggleRow(r.key)}
                          />
                        </td>
                        <td>
                          {r.metric
                            ? <><strong>{r.metric.code}</strong> — {r.metric.name}</>
                            : <span style={{ color: 'var(--neutral-400)' }}>{r.raw.code || r.raw.name || '(unidentified)'}</span>}
                        </td>
                        <td>{r.value === '' || r.value == null ? '—' : String(r.value)}</td>
                        <td style={{ color: 'var(--neutral-500)' }}>{r.unit || '—'}</td>
                        <td>
                          {!r.metric ? (
                            <span className="upload-tag warn"><HelpCircle size={12} /> No match</span>
                          ) : !r.valid ? (
                            <span className="upload-tag warn" title={r.errors.join(' ')}><AlertTriangle size={12} /> Invalid</span>
                          ) : r.overwrite ? (
                            <span className="upload-tag info"><AlertTriangle size={12} /> Overwrites</span>
                          ) : (
                            <span className="upload-tag ok"><CheckCircle2 size={12} /> Ready</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setPreview(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmFill} disabled={selectedCount === 0}>
                Fill {selectedCount} data point{selectedCount === 1 ? '' : 's'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
