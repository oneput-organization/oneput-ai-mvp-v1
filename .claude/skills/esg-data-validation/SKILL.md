---
name: esg-data-validation
description: Validate ESG data entries and CSV imports against per-metric rules in the Oneput AI app. Use when collecting data, importing CSV, defining metric validation rules, or showing validation errors — extends utils/validation.js, never re-implements ad-hoc checks.
---

# ESG data validation

Every value collected must be validated against its metric's rules before it can move through the
review flow. Validation logic is centralized in `utils/validation.js` — extend it, don't scatter
checks across components.

## When to use this skill

- Building or extending data entry (manual or CSV).
- Defining/adjusting a metric's `validationRules`.
- Adding a new validation kind (e.g. enum, regex, unit consistency, cross-field).
- Surfacing validation errors in the UI.

## Existing helpers (`utils/validation.js`)

- `validateMetricValue(value, metric)` → `string[]` of error messages. Handles `required`, numeric
  `min`/`max`, text `minLength`/`maxLength`, type checks driven by `metric.dataType`.
- `validateCSVRow(row, metrics)` → `{ valid, errors, metric }`. Maps `row.metric_code` to a metric,
  then runs `validateMetricValue`.
- `parseCSV(text)` → `{ headers, rows }` (rows carry `_rowIndex` for error reporting).
- `generateCSVTemplate(metrics)` → CSV string with columns
  `metric_code, metric_name, value, unit, notes`.

## Validation rule shape (on each metric in the registry)

```js
validationRules: { required?, min?, max?, minLength?, maxLength? }
```

## How to add a new validation kind

1. Add the rule key to the metric's `validationRules` in the registry (see `esg-metric-registry`).
2. Extend `validateMetricValue` to interpret it and push a clear, user-facing message. Keep it pure
   (input → `string[]`), no side effects.
3. If CSV needs it, it flows automatically through `validateCSVRow`.
4. Reuse `validateMetricValue` everywhere — manual entry and CSV both call it; do not duplicate logic.

## CSV contract

- Columns: `metric_code, metric_name, value, unit, notes`. `metric_code` matches `metric.code`.
- Always offer `generateCSVTemplate` for download so users get the exact format.
- Validate every row, collect per-row errors keyed by `_rowIndex`, and show a review screen before
  committing. Only import rows that pass; report the rest.

## Rules

- Validation must run before an entry's status can advance past `in-progress`.
- Keep error messages specific and human ("Maximum value is 100.", not "invalid").
- Don't bypass `validateMetricValue` with inline checks in pages.
