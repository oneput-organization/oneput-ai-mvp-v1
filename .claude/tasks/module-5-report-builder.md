# Module 5 — Report Builder

**Status:** Not built. Depends on approved data (Module 3) and roles (RBAC).

**Goal:** generate standard-compliant reports from templates, edit them in a text editor on the
platform, and pull metric values into the prose via variables.

> Primary skill: **`report-builder`**.

## Steps

1. **Route + shell.** Add a "Report" sidebar section and route, behind setup + role gating.
   - Skill: **`oneput-ui-kit`** (route/section), **`rbac-roles`** (gating).
2. **Templates per standard.** Define ordered sections + expected metric IDs per standard as data.
   - Skill: **`report-builder`** (template shape), **`esg-metric-registry`** (build from `framework` tag),
     **`oneput-data-layer`** (persist).
3. **Generate a report.** Instantiate a template into a `report` with boilerplate + variable references.
   - Skill: **`report-builder`**, **`oneput-data-layer`** (`oneput_reports`).
4. **Editor + variables.** Rich text editing per section with an insert-variable affordance
   (`{{metric:id}}`); live preview resolves variables to current `dataEntries` values; missing values
   render as visible placeholders.
   - Skill: **`report-builder`** (resolver), **`oneput-ui-kit`** (editor chrome), **`oneput-data-layer`**.
5. **Section review/approval.** Contributor writes; Reviewer approves/rejects sections; Approver
   approves the final report; comments thread per section.
   - Skill: **`rbac-roles`** (permissions + flow), **`audit-log`** (log section transitions).

## Acceptance criteria

- [x] User can generate a report from a standard template and edit sections in-app. _("Generate GRI report" from `data/report-templates.js`; per-section textarea editor with insert-variable picker.)_
- [x] Numbers in the report come only from variable references resolving to real entries. _(`{{metric:id}}` tokens resolve to `dataEntries[id].value`+unit in preview; missing → visible placeholder. No re-typed numbers.)_
- [x] Section review/approval works with correct role gating and comments. _(Contributor writes (`report:write`); Reviewer approves/rejects sections (`report:review`); Approver approves/rejects the report (`report:approve`); per-section comments.)_
- [x] Report state persists; transitions are audited; lint passes. _(`ReportContext` → `oneput_reports`; all transitions/comments call `logEvent`; `npm run lint` green, build passes.)_
