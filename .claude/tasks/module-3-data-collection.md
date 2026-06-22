# Module 3 — Data Collection

**Status:** Partial. Manual entry + CSV import + validation exist (`pages/collection/DataCollection.jsx`,
`utils/validation.js`). **Missing:** assignment to owners, and the Owner → Reviewer → Approved flow.

**Goal:** complete the spec's collection flow — assign each metric to a data owner (auto by role or
manual), collect (manual/CSV/API), always validate, and route Data Owner → Reviewer → Approved.

> Do RBAC first (`non-core-rbac-audit-dashboard.md`, RBAC part) — assignment and the review flow
> depend on users/roles.

## Steps

1. **Assignment.** Assign each active metric to an owner — automatically by role or manually.
   - Skill: **`rbac-roles`** — users/roles; Contributor sees only assigned metrics.
   - Skill: **`oneput-data-layer`** — store assignment (extend `dataEntries[].assignee` to a user ref,
     or an `assignments` map); add a `setAssignee`/bulk-assign action.
   - Skill: **`oneput-ui-kit`** — assignment UI (owner picker, bulk assign, "assigned to me" filter).
2. **Validate-on-entry/import (already partly done — harden it).** Block advancing an entry past
   `in-progress` unless it passes validation; show clear per-field / per-row errors.
   - Skill: **`esg-data-validation`** — reuse `validateMetricValue` / `validateCSVRow`; add any new rules.
3. **Owner → Reviewer → Approved flow.** Implement status transitions with role gating:
   `pending → in-progress → submitted → under-review → approved` (or `rejected` back to owner).
   - Skill: **`rbac-roles`** — only Contributor submits; only Reviewer approves/rejects.
   - Skill: **`oneput-data-layer`** — transition actions on `DataContext` (extend `updateDataEntry`).
   - Skill: **`audit-log`** — log every transition + comment via the centralized `logEvent`.
   - Reviewer comments use the existing `addComment`; surface the thread per metric.
4. **API integration stub.** Per spec (ERP/SAP/Oracle), add an "import via API" entry point behind a
   single function boundary; for the MVP it can be a mock/connector placeholder.
   - Skill: **`oneput-data-layer`** (write imported values through `bulkUpdateEntries`).
5. **Status visibility.** Contributors see their submission status; Reviewers see their queue.
   - Skill: **`oneput-ui-kit`** (status badges from `STATUSES`), **`rbac-roles`** (scoped views).

## Acceptance criteria

- [x] Each active metric can be assigned (auto-by-role or manual) to an owner. _(Owner column; Admin "Auto-assign" round-robin across Contributors; per-metric assignee select in the modal; `assignMetric`.)_
- [x] Every value is validated; invalid data cannot be submitted. _(`validate()` blocks `handleSubmit`; structured + simple inputs via `validateMetricValue`/`validateStructuredForm`.)_
- [x] Full status lifecycle works with correct role gating; reject returns to owner with comments. _(Footer actions gated by `can()`; reject → `rejected`, owner re-edits/resubmits; comments thread.)_
- [x] All transitions and comments appear in the audit log. _(`setEntryStatus`/`assignMetric`/`addComment` call `logEvent`; per-metric History shown in the modal.)_
- [x] CSV import still works; API import boundary exists. Lint passes. _(CSV untouched; `services/apiImport.js` stub + "Import via API" button; `npm run lint` green.)_

> Scoped out of this task (deferred): a global, filterable audit-trail **view** (non-core Audit task)
> and full per-assignee read-only enforcement of input fields (foundation is in place; review-only
> roles already cannot persist changes since their action buttons are gated).
