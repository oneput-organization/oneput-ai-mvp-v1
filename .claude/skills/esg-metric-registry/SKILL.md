---
name: esg-metric-registry
description: Add, edit, or map ESG metrics and reporting standards in the central registry (data/gri-metrics.js, gri-industry-mapping.js, gri-metric-forms.js). Use when a task touches metrics, disclosures, standards/frameworks (GRI, IFRS S1/S2, SEC 56-1), industry mapping, or which metrics are active for a company.
---

# ESG metric registry

The registry is the single source of truth for what can be collected. Standards change yearly, so
everything is data-driven — screens read the registry, they never hard-code metric lists.

> **MVP scope: GRI only.** Build everything against GRI 2021. Adding other standards (IFRS S1/S2,
> SEC 56-1) is deferred — the section below is kept for the future but is **out of scope for the MVP**.
> Tag all metrics `framework: ['GRI']` and don't build multi-standard UI now.

## When to use this skill

- Adding/editing a GRI metric or disclosure.
- Changing which metrics auto-activate for an industry.
- Defining a metric's input form.
- (Deferred) Mapping a metric to additional standards / adding a new standard.

## The three data files (`src/data/`)

1. **`gri-metrics.js`** — `GRI_METRICS` array (the registry), plus `GRI_FRAMEWORK`, `CATEGORIES`,
   `STATUSES`. Metric shape is in `.claude/overview/data-model.md`.
2. **`gri-industry-mapping.js`** — `UNIVERSAL_METRIC_IDS`, `INDUSTRY_METRIC_MAP[industry] =
   { label, sectorStandard, required[], recommended[] }`, and helpers `getMetricIdsForIndustry`,
   `isMetricRequired`.
3. **`gri-metric-forms.js`** — per-metric input form field definitions.

## How to add a metric

1. Append to `GRI_METRICS` with a **stable `id`** (`<standard>-<ref>`, e.g. `gri-305-1`) and human
   `code`. Set `category` (must be one of `CATEGORIES`), `subcategory`, `unit`, `dataType`
   (`number`|`text`), `framework` (array), and `validationRules`.
2. If it should auto-activate for industries, add its `id` to the relevant `required`/`recommended`
   lists in `INDUSTRY_METRIC_MAP` (or `UNIVERSAL_METRIC_IDS` if it always applies).
3. Add its form definition to `gri-metric-forms.js` if it needs structured input.
4. Do not touch pages — `MetricsRegistry` and `DataCollection` render from this data automatically.

## How to add a new standard/framework (e.g. IFRS S1) — DEFERRED, post-MVP

1. Keep one flat `GRI_METRICS`-style registry, but use the `framework` array on each metric to tag
   which standards it satisfies (`framework: ['GRI', 'IFRS S1']`). One metric → many standards is the
   whole point of a central registry; do not duplicate metrics per standard.
2. Add a framework descriptor object alongside `GRI_FRAMEWORK` and expose the new framework as a
   selectable option in `setup/FrameworkSetup.jsx`.
3. If the standard introduces metrics not already present, add them to the registry tagged with that
   framework, and map them into industries as needed.
4. Filter by `framework` where the active standard matters (registry view, report templates).

## Rules

- `id` is immutable once data exists against it. Never renumber.
- Categories must stay within `CATEGORIES`; statuses within `STATUSES`.
- Industry keys must match `Company.industry` values (keys of `INDUSTRY_METRIC_MAP`).
- Changing active metrics for a company goes through `DataContext` actions
  (`applyIndustryMetrics`, `toggleMetricActive`) — see the `oneput-data-layer` skill.
