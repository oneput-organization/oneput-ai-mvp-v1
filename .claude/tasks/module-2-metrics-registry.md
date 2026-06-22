# Module 2 — ESG Metrics Registry

**MVP scope: GRI only.** Keep the registry GRI-only. No multi-standard mapping/filtering in the MVP.

**Status:** Built. Central registry with GRI 2021 metrics, industry mapping, and an activation UI
(`pages/registry/MetricsRegistry.jsx`, `data/gri-metrics.js`, `data/gri-industry-mapping.js`,
`data/gri-metric-forms.js`).

**Goal of remaining work:** make the GRI registry Admin-editable per the spec ("Central Registry",
yearly changes). Multi-standard mapping is **deferred** — skip it.

## Remaining steps

1. **Admin create/edit GRI metrics.** Per the Admin role ("create and edit ESG Metrics"), add UI to
   add/edit a metric (code, name, category, unit, dataType, validationRules). Tag new metrics
   `framework: ['GRI']`.
   - Skill: **`oneput-data-layer`** — persist custom metrics (e.g. merge a `customMetrics` list with
     `GRI_METRICS`); keep `id` stable and immutable.
   - Skill: **`esg-metric-registry`** — follow registry shape + category/status constraints.
   - Skill: **`esg-data-validation`** — define each metric's `validationRules` as part of create/edit.
   - Skill: **`rbac-roles`** — gate create/edit to Admin.
2. **Versioning note.** GRI changes yearly — keep a `version` tag so old data stays valid. Document
   any schema change in `.claude/overview/data-model.md`.
3. **Material topics (optional MVP+).** Admin "create/edit Material Topics" — model topics that group
   metrics if in scope.
   - Skill: **`esg-metric-registry`**, **`oneput-data-layer`**.

## Acceptance criteria

- [x] Admin can add/edit a GRI metric with validation rules; non-admins cannot. _(`MetricForm` modal gated by `can('metric:manage')` (Admin via `*`); `addMetric`/`updateMetric`/`deleteMetric` in DataContext, audited.)_
- [x] Custom metrics persist and appear in activation + data collection. _(`oneput_customMetrics` merged into `allMetrics`; new metrics auto-activated and flow into registry/collection/reports.)_
- [x] No multi-standard UI; stable `id`s preserved; lint passes; data-model doc updated if schema changed. _(Custom ids `custom-<ts>` immutable; bundled GRI subset can be replaced by the real standard via `loadGriMetrics()` / `VITE_GRI_REGISTRY_API_URL`; data-model updated; lint green.)_
