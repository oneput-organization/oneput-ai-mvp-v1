# Progress Tracker

Single source of truth for what's done. Update this whenever a task (or a meaningful step) completes.
Status values: `not-started` · `in-progress` · `done`.

## Definition of Done (a task is "done" only when ALL are true)

1. Every acceptance-criteria checkbox in the task file is ticked.
2. `npm run lint` passes and the change runs (`npm run dev`).
3. `.claude/overview/data-model.md` updated if an entity/shape was added.
4. Committed: `git add -A` && `git commit` (focused message + Co-Authored-By trailer).
5. This tracker's row is updated to `done` with the date + commit hash.

## Status

| Task file | Module | Status | Done date | Commit |
|-----------|--------|--------|-----------|--------|
| `module-1-framework-setup.md` | 1 Setup | not-started (built; verify only) | — | — |
| `module-2-metrics-registry.md` | 2 Registry | not-started (built; Admin edit left) | — | — |
| `non-core-rbac-audit-dashboard.md` (A: RBAC) | non-core | done | 2026-06-22 | 812c906 |
| `module-3-data-collection.md` | 3 Collection | done | 2026-06-22 | e5cd420 |
| `module-4-chatbot.md` | 4 Chatbot | done | 2026-06-22 | 767184e |
| `module-5-report-builder.md` | 5 Report | done | 2026-06-22 | f66514f |
| `module-6-export-compliance.md` | 6 Export | done | 2026-06-22 | 84b6662 |
| `non-core-rbac-audit-dashboard.md` (B: Audit) | non-core | not-started | — | — |
| `non-core-rbac-audit-dashboard.md` (C: Dashboard) | non-core | not-started | — | — |

## Log

_(append one line per completed task/step: `YYYY-MM-DD — <task> — <what shipped> — <commit>`)_

- 2026-06-22 — RBAC (Part A) — roles + permission matrix + UserContext + route/action gating; lint baseline fixed — 812c906
- 2026-06-22 — Module 3 — assignment (auto + manual), audited Owner→Reviewer→Approved flow, audit trail + logEvent, API import boundary — e5cd420
- 2026-06-22 — Module 4 — shared respond()/notify() boundaries (Claude via backend; grounded fallback), data chasing (requests/nudge/escalate) — 767184e
- 2026-06-22 — Module 5 — report builder: GRI template, variable references, live resolution, section/report review (audited) — f66514f
- 2026-06-22 — Module 6 — export (PDF/Word) + compliance checklist + evidence package; publish (audited, gated) — 84b6662
