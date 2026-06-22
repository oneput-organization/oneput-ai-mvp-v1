# Data Model

All entities are currently client-side objects persisted to `localStorage` (prefix `oneput_`).
Shapes below are the contract the UI relies on; keep them stable, and when a backend arrives mirror
these as the API/DB schema.

## Company (`oneput_company`)

```js
{
  name, industry, employeeCount, revenueRange,
  reportingPeriodStart, reportingPeriodEnd, country,
  description,
}
```
Required for "company complete": `name, industry, employeeCount, revenueRange,
reportingPeriodStart, reportingPeriodEnd, country`.
`industry` must be a key of `INDUSTRY_METRIC_MAP` (e.g. `Energy`, `Financials`, `Other`).

## Settings (`oneput_settings`)

```js
{ framework: 'gri-2021' | null, setupComplete: boolean, sidebarCollapsed: boolean }
```

## Metric (registry, `data/gri-metrics.js`)

```js
{
  id,            // stable key, e.g. 'gri-305-1'
  code,          // display code, e.g. 'GRI 305-1'
  name,
  description,
  category,      // 'Environmental' | 'Social' | 'Governance'
  subcategory,   // e.g. 'Emissions'
  unit,          // e.g. 'tCO2e', '%', 'count', 'text'
  dataType,      // 'number' | 'text'
  framework,     // string[] of standards this maps to, e.g. ['GRI']  (one metric -> many standards)
  validationRules, // { required?, min?, max?, minLength?, maxLength? }
}
```
`CATEGORIES` and `STATUSES` are exported from the same file.

**MVP is GRI-only** — every metric is tagged `framework: ['GRI']` and `settings.framework` is
`'gri-2021'`. The `framework` field is kept as an array so additional standards (IFRS S1/S2, SEC 56-1)
can be added later without changing the entry shape, but multi-standard support is out of scope now.

## Industry mapping (`data/gri-industry-mapping.js`)

- `UNIVERSAL_METRIC_IDS` — always required (GRI 2 series)
- `INDUSTRY_METRIC_MAP[industry] = { label, sectorStandard, required[], recommended[] }`
- `getMetricIdsForIndustry(industry)` → metric IDs to auto-activate (`null` ⇒ all metrics)
- `isMetricRequired(metricId, industry)` → boolean

## Active metrics (`oneput_activeMetricIds`)

`string[]` of metric `id`s in scope for this company. Seeded from the industry mapping at first load.

## Data entry (`oneput_dataEntries`)

```js
dataEntries[metricId] = {
  value,                 // string | number, '' when empty
  status,                // see STATUSES
  notes,
  assignee,              // owner User id (e.g. 'u-contributor'); '' when unassigned
  comments: [ { id, text, author, createdAt } ],  // author = current user's name
  updatedAt,             // ISO string
}
```

Assign via `assignMetric(metricId, userId)` (or `autoAssign` round-robin in the UI); advance status
via `setEntryStatus(metricId, newStatus, patch)`. Both log to the audit trail.

### Status lifecycle (Owner → Reviewer → Approved)

```
pending → in-progress → submitted → under-review → approved
                              �‍                ↓
                              └──────── rejected (back to owner)
```
`stats` in `DataContext` is computed from these statuses; `completionPercent = approved / total`.

## Implemented entities

- **User** (`oneput_users` + `oneput_currentUser`) — `{ id, name, email, role }`,
  `role ∈ {Admin, Contributor, Reviewer, Approver, ExternalAuditor}`. Managed by `UserContext`;
  permissions in `data/permissions.js` (`can(role, perm)`).
- **Assignment** — modelled as the `assignee` (User id) on each data entry; set via `assignMetric`.
- **AuditEvent** (`oneput_auditEvents`) — `{ id, actor, action, target, before, after, timestamp }`.
  Append-only, written by `logEvent` from DataContext actions (`data.status`, `data.update`,
  `data.assign`, `comment.add`) and by chasing (`chase.request`, `chase.nudge`, `chase.escalate`).
  Trail **view** (filterable timeline) is still to build — non-core Audit task.
- **DataRequest** (`oneput_dataRequests`) — `{ id, ownerId, metricIds[], dueDate, createdAt }`. Built
  per owner by `AssistantContext.planRequests`. Chasing activity is logged to `oneput_assistantLog`
  (`{ id, ts, kind, ownerId, text }`). The model call (`respond`) and channel send (`notify`) are
  isolated in `services/assistant.js` behind one function each — no client-side API key.
- **Report / ReportSection** (`oneput_reports`) — `report = { id, name, templateId, framework,
  status, sections[], createdAt, updatedAt }`; `section = { id, title, body, status,
  requiredMetricIds[], comments[] }`. Managed by `ReportContext`. Templates live in
  `data/report-templates.js`. **Variable references** are `{{metric:<id>}}` tokens in `body` that
  resolve to `dataEntries[id].value` at render/export (missing → visible placeholder). Report and
  section status mirror the entry lifecycle; transitions/comments log to the audit trail
  (`report.generate`, `report.section.update`, `report.section.status`, `report.status`, `report.comment`).
- **Export / EvidencePackage** — no stored entity; generated on demand by `services/exportReport.js`.
  `exportReport(report, format, dataEntries)` resolves variables and emits PDF (print)/Word/HTML behind
  one swappable boundary. `checkCompliance` gates publish (missing data + unapproved disclosures + report
  sign-off). `downloadEvidence` emits a JSON package tracing each disclosed number to its entry (value,
  status, owner, timestamps, notes, comments). Export/publish log `export.create` / `report.publish`.

## Entities to add (planned, not yet in code)

All core MVP entities are now implemented. Future, non-core additions (define following the same shape
conventions when built): a stored audit-trail **view**, material topics, and real backend persistence
replacing `localStorage`. See the matching skills in `.claude/skills/` for conventions.
