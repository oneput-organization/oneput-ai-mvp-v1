---
name: audit-log
description: Add and surface an audit log of every meaningful action in the Oneput AI app (data edits, submissions, approvals/rejections, comments, role/standard changes, exports, publishes). Use when recording actions for traceability or building the audit-trail view consumed by Reviewers and External Auditors.
---

# Audit log

Every meaningful action should be recorded so Reviewers and External Auditors can see what happened,
by whom, and when. Not yet implemented. It underpins the evidence package (Module 6) and assurance.

## When to use this skill

- Recording an action (data change, status transition, comment, role/standard change, export, publish).
- Building the audit-trail view.
- Producing the audit trail portion of the evidence package.

## Model (persist via oneput-data-layer, key `oneput_auditEvents`)

```js
auditEvent = {
  id,
  actor,        // userId / role (from rbac-roles; 'Admin' until users exist)
  action,       // e.g. 'data.update' | 'data.submit' | 'data.approve' | 'data.reject'
                //      'comment.add' | 'role.change' | 'standard.change'
                //      'report.section.approve' | 'export.create' | 'report.publish'
  target,       // { type: 'metric'|'report'|'user'|'setting', id, code? }
  before, after,// minimal diff where relevant (e.g. value/status old → new)
  timestamp,    // ISO string
}
```

## How to implement (centralize — don't sprinkle logging)

1. Add a `logEvent(event)` action on a context (extend DataContext or a small AuditContext) that
   appends to `auditEvents` and persists. Follow the functional-update + persist pattern.
2. Call `logEvent` from the existing context **actions** (e.g. inside `updateDataEntry`,
   status-transition handlers, `addComment`, role/standard setters, export/publish) — one place per
   mutation, so coverage is automatic and components don't each remember to log.
3. Record a minimal `before/after` for value/status changes so the trail is meaningful, not noisy.

## View

- A read-only, filterable timeline (by actor, action, target, date). Use `oneput-ui-kit`.
- Reviewer and External Auditor must be able to read it (gate via `rbac-roles`); it is append-only —
  no editing or deleting events from the UI.

## Rules

- Append-only. Never mutate or delete audit events from the app.
- Log at the data-layer action level, not in each component, so nothing is missed.
- Keep entries small; store diffs, not whole objects, where practical.
