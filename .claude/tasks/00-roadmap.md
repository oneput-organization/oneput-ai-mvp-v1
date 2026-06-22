# MVP Roadmap & Skill Map

How to use this folder: pick the next task in order, open its file, and invoke the skills it names
at the steps it names. Each task file lists status, goal, ordered steps (with the skill to load at
each), and acceptance criteria. Conventions live in `/CLAUDE.md` and `.claude/overview/`.

## Build order (by dependency)

| Order | Task | Module | Status | Why here |
|------:|------|--------|--------|----------|
| 1 | `non-core-rbac-audit-dashboard.md` (RBAC part) | Roles | foundational | Everything else gates on roles & the review/approve flow |
| 2 | `module-3-data-collection.md` | 3 | finish | Add assignment + Owner→Reviewer→Approver flow on top of existing entry/CSV |
| 3 | `module-4-chatbot.md` | 4 | replace mock | Real Oneput AI: prompt, tools, data-request + chasing |
| 4 | `module-5-report-builder.md` | 5 | build | Needs approved data + roles |
| 5 | `module-6-export-compliance.md` | 6 | build | Needs reports + approved data + (ideally) audit log |
| 6 | `non-core-rbac-audit-dashboard.md` (Audit + Dashboard parts) | non-core | build | Audit log threads through all actions; dashboard polishes |

Modules 1 and 2 (`module-1-framework-setup.md`, `module-2-metrics-registry.md`) are already built for
GRI; their task files cover **light GRI-only polish** (verify setup flow; Admin metric edit), do them
opportunistically.

> **MVP scope: GRI only.** GRI 2021 is the sole framework. IFRS S1/S2 and SEC 56-1 are deferred — do
> not build multi-standard selection or mapping. See `/CLAUDE.md` and `.claude/overview/`.

## Skill → where it's used

| Skill | Used by tasks |
|-------|---------------|
| `oneput-data-layer` | every task that persists state (all of them) |
| `oneput-ui-kit` | every task with UI |
| `esg-metric-registry` | Module 1 (frameworks), Module 2, Module 5 (templates) |
| `esg-data-validation` | Module 3 |
| `rbac-roles` | non-core RBAC, Modules 3/5/6 (gating + flow) |
| `oneput-ai-assistant` | Module 4 |
| `report-builder` | Module 5 |
| `export-compliance` | Module 6 |
| `audit-log` | non-core Audit, threaded into Modules 3/5/6 actions |

Supporting library skills (load when relevant): `claude-api` (Module 4 real model call),
`react-expert` / `javascript-pro` (component work), `prompt-engineer` (refining the assistant prompt),
`code-review` (before wrapping a task).

## Working agreement for every task

1. Read the task file + the overview docs it points to.
2. Before each implementation step, **invoke the skill named for that step** and follow it.
3. Persist only through contexts (`oneput-data-layer`); style only through `oneput-ui-kit`.
4. Keep backend/AI seams clean (one function boundary) — no direct `localStorage`/model calls in pages.
5. Run `npm run lint` and `npm run dev` to verify; update `.claude/overview/data-model.md` if you add an entity.
6. Tick the task's acceptance criteria before moving on.
7. **When the task is done and verified, commit it:** `git add -A` then
   `git commit -m "<module/task>: <what changed>"`. One focused commit per completed task (or per
   meaningful step), only after lint passes and acceptance criteria are met — never commit broken code.
   End the commit message with the required `Co-Authored-By` trailer.
