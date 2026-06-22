# Module 6 — Export & Compliance

**Status:** Not built. Depends on Report Builder (Module 5), approved data (Module 3), and ideally
the audit log.

**Goal:** export the finished report to PDF/Word/other, and auto-generate a supporting
disclosure/evidence package that traces every disclosed number back to platform data.

> Primary skill: **`export-compliance`**.

## Steps

1. **Export function.** One `export(report, format)` boundary rendering a finished report (variables
   resolved) to PDF and Word; keep the renderer isolated so it can move server-side later.
   - Skill: **`export-compliance`**, **`report-builder`** (resolve variables at export time).
2. **Pre-export compliance checks.** Block/warn on disclosures whose entries aren't `approved`; flag
   missing required metrics; show a checklist.
   - Skill: **`export-compliance`**, **`esg-metric-registry`** (`isMetricRequired` + template),
     **`rbac-roles`** (Approver must have approved).
3. **Evidence/disclosure package.** For each disclosed value emit a reference: metric, value, who
   entered/approved, timestamps, notes, comments — assembled into a traceable package.
   - Skill: **`export-compliance`** (evidence item shape), **`oneput-data-layer`** (read entries),
     **`audit-log`** (audit trail portion).
4. **Roles.** Admin exports/publishes; External Auditor downloads the evidence package read-only.
   - Skill: **`rbac-roles`**.
5. **Log it.** Record `export.create` / `report.publish` events.
   - Skill: **`audit-log`**.

## Acceptance criteria

- [ ] Report exports to PDF and Word with all variables resolved.
- [ ] Export is blocked/warned when backing data isn't approved or required metrics are missing.
- [ ] Evidence package generated from platform data traces every number to an approved entry + actors.
- [ ] Export/publish are audited; correct role gating; lint passes.
