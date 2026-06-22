import { useState } from 'react';
import { useReports } from '../../contexts/ReportContext';
import { useData } from '../../contexts/DataContext';
import { useUser } from '../../contexts/UserContext';
import { GRI_METRICS } from '../../data/gri-metrics';
import { metricById } from '../../data/report-templates';
import {
  FileText, Plus, Trash2, Send, CheckCircle2, XCircle, Eye, MessageSquare,
} from 'lucide-react';

// Render a section body, resolving {{metric:id}} tokens to collected values.
// Missing values render as a visible placeholder so authors see gaps.
function ResolvedBody({ body, dataEntries }) {
  const parts = body.split(/(\{\{metric:[a-z0-9-]+\}\})/gi);
  return (
    <div style={{ whiteSpace: 'pre-wrap', fontSize: 'var(--font-sm)', lineHeight: 1.7 }}>
      {parts.map((part, i) => {
        const match = part.match(/^\{\{metric:([a-z0-9-]+)\}\}$/i);
        if (!match) return <span key={i}>{part}</span>;
        const id = match[1];
        const metric = metricById(id);
        const entry = dataEntries[id];
        const hasValue = entry && entry.value !== '' && entry.value != null;
        if (hasValue) {
          const unit = metric && metric.unit !== 'text' ? ` ${metric.unit}` : '';
          return <strong key={i} style={{ color: 'var(--primary-700)' }}>{`${entry.value}${unit}`}</strong>;
        }
        return (
          <span key={i} style={{ background: 'var(--error-50)', color: 'var(--error-600)', padding: '0 4px', borderRadius: 3, fontSize: 'var(--font-xs)' }}>
            [{metric?.code || id}: not collected]
          </span>
        );
      })}
    </div>
  );
}

export default function ReportBuilder() {
  const { reports, generateReport, updateSection, setSectionStatus, addSectionComment, setReportStatus, deleteReport } = useReports();
  const { dataEntries } = useData();
  const { can } = useUser();

  const canWrite = can('report:write');
  const canReview = can('report:review');
  const canApprove = can('report:approve');
  const canComment = can('comment:create') || can('comment:reply');

  const [selectedId, setSelectedId] = useState(reports[0]?.id || null);
  const report = reports.find(r => r.id === selectedId) || reports[0] || null;

  const handleGenerate = () => {
    const r = generateReport();
    setSelectedId(r.id);
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div className="page-header-text">
          <h1>Report Builder</h1>
          <p>Generate a GRI-compliant report and pull collected metric values into the prose.</p>
        </div>
        <div className="page-header-actions">
          {canWrite && (
            <button className="btn btn-primary" onClick={handleGenerate}>
              <Plus size={16} /> Generate GRI report
            </button>
          )}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FileText size={28} /></div>
          <h3>No reports yet</h3>
          <p>{canWrite ? 'Click "Generate GRI report" to start from the GRI Standards 2021 template.' : 'No reports have been created yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'var(--space-5)' }}>
          {/* Report list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {reports.map(r => (
              <button
                key={r.id}
                className={`card ${r.id === report?.id ? 'active' : ''}`}
                onClick={() => setSelectedId(r.id)}
                style={{ textAlign: 'left', padding: 'var(--space-3) var(--space-4)', borderColor: r.id === report?.id ? 'var(--primary-500)' : undefined, cursor: 'pointer' }}
              >
                <div style={{ fontWeight: 500, fontSize: 'var(--font-sm)' }}>{r.name}</div>
                <span className={`status-badge ${r.status === 'approved' ? 'approved' : r.status === 'rejected' ? 'rejected' : r.status === 'in-review' ? 'under-review' : 'pending'}`} style={{ marginTop: 4 }}>
                  {r.status}
                </span>
              </button>
            ))}
          </div>

          {/* Selected report */}
          {report && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <h2 style={{ fontSize: 'var(--font-lg)' }}>{report.name}</h2>
                  <span className={`status-badge ${report.status === 'approved' ? 'approved' : report.status === 'rejected' ? 'rejected' : report.status === 'in-review' ? 'under-review' : 'pending'}`}>{report.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {canWrite && report.status === 'draft' && (
                    <button className="btn btn-secondary" onClick={() => setReportStatus(report.id, 'in-review')}>
                      <Send size={15} /> Submit for review
                    </button>
                  )}
                  {canApprove && report.status === 'in-review' && (
                    <>
                      <button className="btn btn-danger" onClick={() => setReportStatus(report.id, 'rejected')}><XCircle size={15} /> Reject</button>
                      <button className="btn btn-primary" style={{ background: 'var(--success-600)' }} onClick={() => setReportStatus(report.id, 'approved')}><CheckCircle2 size={15} /> Approve</button>
                    </>
                  )}
                  {canWrite && report.status === 'rejected' && (
                    <button className="btn btn-secondary" onClick={() => setReportStatus(report.id, 'draft')}>Reopen</button>
                  )}
                  {canWrite && (
                    <button className="btn btn-ghost" onClick={() => { deleteReport(report.id); setSelectedId(null); }}><Trash2 size={15} /></button>
                  )}
                </div>
              </div>

              {report.sections.map(section => (
                <SectionCard
                  key={section.id}
                  report={report}
                  section={section}
                  dataEntries={dataEntries}
                  canWrite={canWrite}
                  canReview={canReview}
                  canComment={canComment}
                  onChangeBody={(body) => updateSection(report.id, section.id, body)}
                  onSetStatus={(status) => setSectionStatus(report.id, section.id, status)}
                  onComment={(text) => addSectionComment(report.id, section.id, text)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionCard({ section, dataEntries, canWrite, canReview, canComment, onChangeBody, onSetStatus, onComment }) {
  const [preview, setPreview] = useState(false);
  const [comment, setComment] = useState('');

  const insertVariable = (id) => {
    if (!id) return;
    onChangeBody(`${section.body}{{metric:${id}}}`);
  };

  const submitComment = () => {
    if (!comment.trim()) return;
    onComment(comment.trim());
    setComment('');
  };

  return (
    <div className="card" style={{ padding: 'var(--space-4) var(--space-5)', marginBottom: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <h4 style={{ fontSize: 'var(--font-base)' }}>{section.title}</h4>
          <span className={`status-badge ${section.status === 'approved' ? 'approved' : section.status === 'rejected' ? 'rejected' : 'pending'}`}>{section.status}</span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPreview(p => !p)}>
            <Eye size={13} /> {preview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      {preview ? (
        <ResolvedBody body={section.body} dataEntries={dataEntries} />
      ) : canWrite ? (
        <>
          <textarea
            className="form-textarea"
            rows={5}
            value={section.body}
            onChange={e => onChangeBody(e.target.value)}
            style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-xs)', color: 'var(--neutral-500)' }}>Insert variable:</span>
            <select className="form-select" defaultValue="" onChange={e => { insertVariable(e.target.value); e.target.value = ''; }} style={{ height: 30, fontSize: 'var(--font-xs)', maxWidth: 320 }}>
              <option value="">Pick a metric…</option>
              {GRI_METRICS.map(m => <option key={m.id} value={m.id}>{m.code} — {m.name}</option>)}
            </select>
          </div>
        </>
      ) : (
        <ResolvedBody body={section.body} dataEntries={dataEntries} />
      )}

      {/* Reviewer actions */}
      {canReview && (
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
          <button className="btn btn-ghost btn-sm" disabled={section.status === 'rejected'} onClick={() => onSetStatus('rejected')}><XCircle size={13} /> Reject</button>
          <button className="btn btn-ghost btn-sm" disabled={section.status === 'approved'} onClick={() => onSetStatus('approved')}><CheckCircle2 size={13} /> Approve</button>
        </div>
      )}

      {/* Comments */}
      {(section.comments?.length > 0) && (
        <div className="comment-thread" style={{ marginTop: 'var(--space-3)' }}>
          {section.comments.map(c => (
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
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
          <input className="form-input" placeholder="Comment on this section..." value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && submitComment()} />
          <button className="btn btn-ghost" onClick={submitComment}><MessageSquare size={15} /></button>
        </div>
      )}
    </div>
  );
}
