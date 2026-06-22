// Export & Compliance (Module 6). File generation is isolated here behind exportReport() so a
// server-side renderer can replace it later. Every disclosed number is resolved from a backing
// entry at export time — no orphan figures. The evidence package traces each number to its source.

import { metricById } from '../data/report-templates';
import { GRI_METRICS } from '../data/gri-metrics';

const TOKEN = /\{\{metric:([a-z0-9-]+)\}\}/gi;

const download = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// All metric ids a report depends on: variable refs in bodies + each section's required ids.
export function referencedMetricIds(report) {
  const ids = new Set();
  report.sections.forEach(s => {
    (s.requiredMetricIds || []).forEach(id => ids.add(id));
    for (const m of s.body.matchAll(TOKEN)) ids.add(m[1]);
  });
  return [...ids];
}

// Pre-export compliance: which disclosures are missing or not yet approved.
export function checkCompliance(report, dataEntries) {
  const ids = referencedMetricIds(report);
  const missing = [];
  const unapproved = [];
  ids.forEach(id => {
    const entry = dataEntries[id];
    const hasValue = entry && entry.value !== '' && entry.value != null;
    if (!hasValue) missing.push(id);
    else if (entry.status !== 'approved') unapproved.push(id);
  });
  const reportApproved = report.status === 'approved' || report.status === 'published';
  return {
    referencedIds: ids,
    missing,
    unapproved,
    reportApproved,
    ready: missing.length === 0 && unapproved.length === 0 && reportApproved,
  };
}

// Resolve {{metric:id}} tokens to values (HTML). Missing → visible placeholder.
function resolveToHtml(body, dataEntries) {
  return esc(body)
    .replace(TOKEN, (_, id) => {
      const metric = metricById(id);
      const entry = dataEntries[id];
      const hasValue = entry && entry.value !== '' && entry.value != null;
      if (hasValue) {
        const unit = metric && metric.unit !== 'text' ? ` ${metric.unit}` : '';
        return `<strong>${esc(entry.value)}${esc(unit)}</strong>`;
      }
      return `<span style="color:#b91c1c">[${esc(metric?.code || id)}: not collected]</span>`;
    })
    .replace(/\n/g, '<br/>');
}

function buildReportHtml(report, dataEntries) {
  const sections = report.sections.map(s =>
    `<section><h2>${esc(s.title)}</h2><p>${resolveToHtml(s.body, dataEntries)}</p></section>`
  ).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(report.name)}</title>
<style>body{font-family:Georgia,serif;max-width:780px;margin:40px auto;color:#1a1a1a;line-height:1.7}
h1{font-size:24px}h2{font-size:18px;margin-top:28px;border-bottom:1px solid #ddd;padding-bottom:4px}
.meta{color:#666;font-size:13px;margin-bottom:24px}</style></head>
<body><h1>${esc(report.name)}</h1>
<div class="meta">Framework: ${esc(report.framework)} · Status: ${esc(report.status)} · Generated ${new Date().toLocaleString()}</div>
${sections}</body></html>`;
}

/**
 * The single export boundary. Resolves variables, then emits the chosen format.
 * @param format 'pdf' | 'word' | 'html'
 * @returns {{ ok: boolean, reason?: string }}
 */
export function exportReport(report, format, dataEntries) {
  const html = buildReportHtml(report, dataEntries);
  const safeName = report.name.replace(/[^\w-]+/g, '_');

  if (format === 'word') {
    download(new Blob(['﻿', html], { type: 'application/msword' }), `${safeName}.doc`);
    return { ok: true };
  }
  if (format === 'html') {
    download(new Blob([html], { type: 'text/html' }), `${safeName}.html`);
    return { ok: true };
  }
  // pdf — render in a hidden iframe (srcdoc) and trigger the browser print dialog;
  // the user's "Save as PDF" produces the file. Swappable for a server renderer later.
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  iframe.srcdoc = html;
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 1000);
  };
  document.body.appendChild(iframe);
  return { ok: true };
}

// Evidence package: one traceable item per disclosed metric, drawn from platform data.
export function buildEvidencePackage(report, dataEntries, users = []) {
  const nameOf = (id) => users.find(u => u.id === id)?.name || id || null;
  return referencedMetricIds(report).map(id => {
    const metric = metricById(id) || GRI_METRICS.find(m => m.id === id);
    const entry = dataEntries[id] || {};
    return {
      metricCode: metric?.code || id,
      metricName: metric?.name || '',
      value: entry.value ?? null,
      unit: metric?.unit || '',
      status: entry.status || 'pending',
      enteredBy: nameOf(entry.assignee),
      updatedAt: entry.updatedAt || null,
      notes: entry.notes || '',
      comments: (entry.comments || []).map(c => ({ author: c.author, text: c.text, at: c.createdAt })),
    };
  });
}

export function downloadEvidence(report, dataEntries, users) {
  const pkg = {
    report: { name: report.name, framework: report.framework, status: report.status },
    generatedAt: new Date().toISOString(),
    disclosures: buildEvidencePackage(report, dataEntries, users),
  };
  const safeName = report.name.replace(/[^\w-]+/g, '_');
  download(new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' }), `${safeName}_evidence.json`);
}
