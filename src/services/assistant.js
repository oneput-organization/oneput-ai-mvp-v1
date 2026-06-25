// Oneput AI assistant — the single responder both chat surfaces use.
//
// The model call is isolated behind respond(): if a backend/proxy is configured
// (VITE_ASSISTANT_API_URL), it POSTs there to run a real Claude call server-side
// (model claude-opus-4-8, adaptive thinking, the tools below). With no backend —
// the MVP default — it falls back to a grounded local engine. NO API KEY ever
// lives in the client; the real model call belongs server-side.

import { GRI_METRICS } from '../data/gri-metrics';
import { parseCSV } from '../utils/validation';

export const MODEL = 'claude-opus-4-8';

// Tool schemas for the backend Claude call. Tool outputs are the ONLY source of
// numbers the model may state — everything is grounded in the registry + entries.
export const ASSISTANT_TOOLS = [
  { name: 'get_progress', description: 'Return collection stats and completion %.', input_schema: { type: 'object', properties: {}, additionalProperties: false } },
  { name: 'list_pending', description: 'List active metrics still missing data, optionally by category.', input_schema: { type: 'object', properties: { category: { type: 'string' } }, additionalProperties: false } },
  { name: 'explain_metric', description: 'Explain a GRI metric by its code, e.g. "GRI 305-1".', input_schema: { type: 'object', properties: { code: { type: 'string' } }, required: ['code'], additionalProperties: false } },
  { name: 'create_data_request', description: 'Record which metrics an owner owes and by when.', input_schema: { type: 'object', properties: { metricIds: { type: 'array', items: { type: 'string' } }, ownerId: { type: 'string' }, dueDate: { type: 'string' } }, required: ['metricIds', 'ownerId'], additionalProperties: false } },
  { name: 'send_nudge', description: 'Send a reminder to a data owner.', input_schema: { type: 'object', properties: { ownerId: { type: 'string' }, message: { type: 'string' } }, required: ['ownerId'], additionalProperties: false } },
  { name: 'escalate', description: "Escalate an overdue item to the owner's manager.", input_schema: { type: 'object', properties: { ownerId: { type: 'string' } }, required: ['ownerId'], additionalProperties: false } },
];

export function buildSystemPrompt({ company = {}, settings = {}, stats = {} } = {}) {
  return [
    `You are Oneput AI, an ESG-reporting teammate for ${company.name || 'this company'} (${company.industry || 'unknown industry'}),`,
    `reporting under ${settings.framework || 'GRI'}. Reporting period: ${company.reportingPeriodStart || '?'}–${company.reportingPeriodEnd || '?'}.`,
    '',
    'Your job is to collect ESG data across departments, not to write the report. You tell each owner',
    'which metrics they owe and by when, chase politely until data is submitted and approved, explain',
    'any GRI metric in plain language, and report accurate progress using ONLY the provided context.',
    '',
    'Rules: ground every number in the provided context (active metrics, entries, stats) — never invent',
    'values; if you lack it, say so and offer to help collect it. Reference metrics by code and name.',
    'Only nudge the assigned owner; escalate to a manager only when overdue. Name the exact app screen',
    'when the user can act (Data Collection, Metrics Registry, Data Chasing). Be a concise, friendly colleague.',
    '',
    `Current progress: ${stats.collected ?? 0}/${stats.totalMetrics ?? 0} collected, ${stats.approved ?? 0} approved.`,
  ].join('\n');
}

// Compact, grounded snapshot handed to the backend (keeps payload + cost small).
function summarizeContext({ activeMetrics = [], dataEntries = {}, stats = {} } = {}) {
  return {
    stats,
    metrics: activeMetrics.map(m => ({
      code: m.code, name: m.name, category: m.category,
      status: dataEntries[m.id]?.status || 'pending',
      hasValue: !!dataEntries[m.id]?.value,
    })),
  };
}

/**
 * The one model-call boundary. Both chat surfaces call this.
 * @param messages chat history: [{ type: 'user'|'bot', text }]
 * @param context  { company, settings, activeMetrics, dataEntries, stats }
 * @returns {Promise<{ text: string, actions: object[] }>}
 */
export async function respond(messages, context) {
  const lastUser = [...messages].reverse().find(m => (m.type || m.role) === 'user');
  const text = lastUser?.text ?? lastUser?.content ?? '';

  const apiUrl = import.meta.env?.VITE_ASSISTANT_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: MODEL,
          thinking: { type: 'adaptive' },
          system: buildSystemPrompt(context),
          tools: ASSISTANT_TOOLS,
          messages: messages.map(m => ({
            role: (m.type || m.role) === 'bot' ? 'assistant' : 'user',
            content: m.text ?? m.content ?? '',
          })),
          context: summarizeContext(context),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { text: data.text ?? '', actions: data.actions ?? [] };
      }
    } catch {
      // Backend unreachable — fall back to the grounded local engine below.
    }
  }

  return { text: localRespond(text, context), actions: [] };
}

/**
 * The one data-extraction boundary. Reads an uploaded file and returns raw rows
 * to be mapped to metrics + validated + confirmed before anything is written.
 *
 * MVP: CSV is parsed locally (reusing utils/validation `parseCSV`). Richer formats
 * (image / PDF / xlsx) need a real Claude document/vision read, which happens
 * server-side when VITE_ASSISTANT_API_URL is set — the file is POSTed there. NO
 * API KEY in the client; non-CSV without a backend returns an explanatory note.
 *
 * @param file    a browser File (from an <input type="file">)
 * @param context { activeMetrics } — used by the backend to ground the extraction
 * @returns {Promise<{ rows: {code,name,value,unit,notes}[], notes: string }>}
 */
export async function extractEntries(file, context = {}) {
  const isCsv = /\.csv$/i.test(file.name) || file.type === 'text/csv';
  const apiUrl = import.meta.env?.VITE_ASSISTANT_API_URL;

  // Non-CSV (image/PDF/xlsx) — only the backend can read these. Try it; if it's
  // not configured or unreachable, say so rather than silently failing.
  if (!isCsv) {
    if (apiUrl) {
      try {
        const form = new FormData();
        form.append('file', file);
        form.append('model', MODEL);
        form.append('metrics', JSON.stringify(
          (context.activeMetrics || []).map(m => ({ code: m.code, name: m.name, unit: m.unit }))
        ));
        const res = await fetch(`${apiUrl.replace(/\/$/, '')}/extract`, { method: 'POST', body: form });
        if (res.ok) {
          const data = await res.json();
          return { rows: data.rows ?? [], notes: data.notes ?? '' };
        }
      } catch {
        // fall through to the unsupported note
      }
    }
    return {
      rows: [],
      notes: `I can read **CSV** files directly. To extract from ${file.name} (image/PDF/Excel) the extraction backend must be configured.`,
    };
  }

  // CSV — parse locally. metric_code/value/unit/notes mirror the import template.
  const text = await file.text();
  const { rows } = parseCSV(text);
  return {
    rows: rows.map(r => ({
      code: r.metric_code || r.code || '',
      name: r.metric_name || r.name || '',
      value: r.value ?? '',
      unit: r.unit || '',
      notes: r.notes || '',
    })),
    notes: '',
  };
}

/**
 * Channel-agnostic sender boundary (LINE first, then email/Slack). Real delivery
 * is server-side; here it resolves to a logged "would send" so the chasing
 * workflow is demonstrable offline.
 */
export async function notify(channel, recipient, message) {
  const apiUrl = import.meta.env?.VITE_NOTIFY_API_URL;
  if (apiUrl) {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, recipient, message }),
      });
      if (res.ok) return { sent: true, simulated: false };
    } catch {
      // fall through to simulated
    }
  }
  return { sent: true, simulated: true, channel, recipient, message };
}

// ─── Grounded local engine (MVP fallback; replaced by the backend when configured) ───
function localRespond(input, { stats = {}, activeMetrics = [], dataEntries = {}, company = {} } = {}) {
  const lower = (input || '').toLowerCase();

  if (lower.includes('progress') || lower.includes('status') || lower.includes('how are we doing')) {
    const pct = stats.totalMetrics > 0 ? Math.round((stats.approved / stats.totalMetrics) * 100) : 0;
    return `📊 **Current progress:**\n\n• **${stats.totalMetrics || 0}** active metrics\n• **${stats.collected || 0}** collected\n• **${stats.pendingReview || 0}** pending review\n• **${stats.approved || 0}** approved (${pct}%)\n• **${stats.rejected || 0}** rejected\n\n${pct < 50 ? "Early days — keep going! 💪" : pct < 100 ? 'Over halfway! 🎯' : 'All approved — ready to report! 🎉'}`;
  }

  if (lower.includes('pending') || lower.includes("what's left") || lower.includes('remaining') || lower.includes('todo')) {
    const pending = activeMetrics.filter(m => { const e = dataEntries[m.id]; return !e || e.status === 'pending'; });
    if (pending.length === 0) return '✅ No pending metrics — all data has been entered.';
    const list = pending.slice(0, 8).map(m => `• **${m.code}** — ${m.name}`).join('\n');
    return `📋 **${pending.length} metrics still pending:**\n\n${list}${pending.length > 8 ? `\n• ...and ${pending.length - 8} more` : ''}\n\nWant me to send data requests for these? Open **Data Chasing**.`;
  }

  if (lower.includes('help') || lower.includes('explain') || lower.includes('what is')) {
    const metric = GRI_METRICS.find(m => lower.includes(m.code.toLowerCase()) || lower.includes(m.name.toLowerCase().substring(0, 20)));
    if (metric) {
      return `📖 **${metric.code} — ${metric.name}**\n\n${metric.description}\n\n• **Category:** ${metric.category}\n• **Unit:** ${metric.unit}\n• **Data type:** ${metric.dataType}`;
    }
  }

  if (lower.includes('chase') || lower.includes('remind') || lower.includes('nudge') || lower.includes('request')) {
    return `📨 I can build **data requests** per owner and chase them on a schedule. Open **Data Chasing** to plan requests, send nudges, and escalate overdue items.`;
  }

  if (lower.includes('environment') || lower.includes('emission') || lower.includes('carbon') || lower.includes('energy')) {
    const env = activeMetrics.filter(m => m.category === 'Environmental');
    const collected = env.filter(m => dataEntries[m.id]?.value).length;
    return `🌱 **Environmental:** ${env.length} tracked, ${collected} collected.\nKey areas: Energy, GHG Emissions, Water, Waste.`;
  }

  if (lower.includes('social') || lower.includes('employee') || lower.includes('safety')) {
    const soc = activeMetrics.filter(m => m.category === 'Social');
    const collected = soc.filter(m => dataEntries[m.id]?.value).length;
    return `👥 **Social:** ${soc.length} tracked, ${collected} collected.\nKey areas: Employment, Health & Safety, Training, Diversity.`;
  }

  if (lower.includes('governance') || lower.includes('corruption')) {
    const gov = activeMetrics.filter(m => m.category === 'Governance');
    const collected = gov.filter(m => dataEntries[m.id]?.value).length;
    return `🏛️ **Governance:** ${gov.length} tracked, ${collected} collected.\nKey areas: General Disclosures, Anti-corruption.`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower === 'start') {
    return `👋 Hi ${company.name || 'there'}! I'm **Oneput AI**. Ask me about progress, pending metrics, any GRI disclosure, or say "chase" to set up data requests.`;
  }

  return `I can help with:\n• **"What's our progress?"**\n• **"Show pending metrics"**\n• **"Help with GRI 305-1"**\n• **"Chase the data owners"**\n\nJust ask! 🤖`;
}
