---
name: export-compliance
description: Build Oneput AI's export and compliance module — export reports to PDF/Word and auto-generate the supporting disclosure/evidence package from platform data. Use when implementing report export, file generation, or the evidence/audit package that backs each disclosed number.
---

# Export & Compliance (Module 6)

Exports the finished report to PDF/Word/other formats, and automatically builds a supporting
disclosure (evidence) package that references the platform data behind every disclosed number. Not
yet built. Depends on the Report Builder (Module 5).

## When to use this skill

- Exporting a report to PDF / Word.
- Generating the evidence/disclosure package.
- Producing the source-data references / audit trail that back disclosures.

## Export

- Render a finished `report` (sections with variables resolved to current metric values) to:
  - **PDF** — client-side generation is fine for the MVP; keep the lib isolated behind one
    `export(report, format)` function so a server-side renderer can replace it later.
  - **Word (.docx)** and "other" via the same function boundary.
- Resolve all variable references at export time using `DataContext` (see `report-builder`); a number
  must never appear without a backing entry.

## Evidence / disclosure package (the compliance differentiator)

For every disclosed value, emit a reference back to its source on the platform:

```js
evidenceItem = {
  metricCode, value, unit,
  enteredBy, approvedBy,        // from the data entry's owner/reviewer (rbac-roles)
  status,                       // should be 'approved'
  submittedAt, approvedAt,
  sourceNotes, comments,        // from the entry
}
```
Assemble these into a package (a structured document + index) so an External Auditor can trace each
report number to the approved entry, who entered/approved it, and when. Pull from `dataEntries`,
report variable usage, and (once built) the audit log.

## Compliance checks before export

- Block/warn export of disclosures whose backing entries are not `approved`.
- Flag required metrics (per `isMetricRequired` + the standard's template) that are missing.
- Surface a pre-export checklist so Admin/Approver sees gaps before publishing.

## Roles

- **Admin** exports and publishes; **Approver** must have approved the report first; **External
  Auditor** can download the evidence package read-only. Gate via `rbac-roles`.

## Rules

- Every exported number traces to an approved entry — no orphan figures.
- Keep file generation behind one function so the renderer is swappable (client → server).
- The evidence package is generated from platform data, never hand-assembled.
