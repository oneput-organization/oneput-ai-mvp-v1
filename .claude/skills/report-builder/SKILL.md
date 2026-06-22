---
name: report-builder
description: Build the Oneput AI Report Builder — standard-compliant report templates, a rich text editor for authoring/editing sections, and pulling metric values into report text via variables. Use when working on report templates, the report editor, variable interpolation, or report section review/approval.
---

# Report Builder (Module 5)

Lets users generate a GRI-compliant report (MVP scope: GRI only), edit it in a text editor on the
platform, and pull live numbers from collected metrics into the prose. Not yet built.

## When to use this skill

- Creating report templates per standard.
- Building the report editor (rich text) and section structure.
- Implementing variable references that resolve to metric values.
- Wiring report-section review/approval into the role flow.

## Data model (define following data-model.md conventions, persist via oneput-data-layer)

```js
// oneput_reports
report = { id, name, templateId, framework, sections: [section], status, updatedAt }
section = { id, title, body, /* rich text */ status, comments: [], requiredMetricIds: [] }
```
A **variable reference** is a token in `body` that resolves to a metric's current value, e.g.
`{{metric:gri-305-1}}` or `{{metric:gri-305-1.value}}`. Resolve by looking up `dataEntries[id].value`
from `DataContext`; show the metric `code`/`unit` for context. Unresolved/empty variables render as a
visible placeholder so authors see gaps.

## Templates

- One template per standard, as data (e.g. `data/report-templates.js`), listing ordered sections and,
  per section, which metric IDs it expects. Build templates from the registry's `framework` tag so the
  right disclosures appear (see `esg-metric-registry`).
- "Generate report" = instantiate a template into a `report` with sections pre-filled with boilerplate
  + variable references for that standard's disclosures.

## Editor

- Rich text authoring with a variable-insert affordance (pick a metric → inserts `{{metric:id}}`).
- Keep it dependency-light; if a rich-text lib is needed, prefer a small one and isolate it. Reuse
  `oneput-ui-kit` tokens/classes for chrome.
- Live-preview mode resolves variables to current values; edit mode shows the tokens.

## Roles & flow

- **Contributor** writes/edits section content and inserts data (`report:write`).
- **Reviewer** reviews and approves/rejects sections, comments back (`report:review`).
- **Approver** approves/rejects the final report (`report:approve`).
- Mirror the section `status` on the same lifecycle idea as data entries. Gate actions via `rbac-roles`.

## Rules

- Numbers in reports must come from variable references resolving to real entries — never re-typed.
  This keeps the report consistent with collected data and feeds the Module 6 evidence package.
- Templates and the variable resolver are data/util driven; screens render from them.
- Add a route + sidebar entry under a "Report" section, behind setup + role gating.
