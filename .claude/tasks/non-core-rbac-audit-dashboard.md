# Non-core — RBAC, Audit Log, Dashboard

Cross-cutting features. **RBAC is foundational — do it first (before Modules 3–6).** Audit log and
dashboard polish come later.

## Part A — RBAC & roles (do first)

**Status:** Only a setup-complete gate exists (`ProtectedRoute`). No users/roles.

**Goal:** five roles with a permission matrix; gate routes/UI/actions; scope data visibility.

Steps:
1. Model `users[]` + `currentUser` (with `role`); MVP role switcher is fine (auth is a future seam).
   - Skill: **`oneput-data-layer`** (`oneput_users`, `oneput_currentUser`), **`rbac-roles`**.
2. Define permissions as data (`data/permissions.js`) with a `can(role, perm)` helper.
   - Skill: **`rbac-roles`**.
3. Gate routes (extend `ProtectedRoute` with a `permission` prop) and hide/disable UI via `can()`.
   - Skill: **`rbac-roles`**, **`oneput-ui-kit`**.
4. Scope data visibility (Contributor → assigned; Reviewer → review queue; Approver/External Auditor → read-only).
   - Skill: **`rbac-roles`**.

Acceptance:
- [x] Five roles exist; current user/role selectable. _(ROLES in `data/permissions.js`; role switcher in `TopBar`; `UserContext` with seed user per role.)_
- [x] Permissions are data-driven via `can()`; routes/UI/actions gated accordingly. _(`ProtectedRoute permission=`; `DataCollection` gates enter/review/comment + Import CSV by `can()`.)_
- [x] Data visibility scoped per role; setup gate still works; lint passes. _(Read-only roles can't edit/submit/approve; setup gate intact; `npm run lint` green. Per-assignee record scoping lands in Module 3 once assignment exists.)_

## Part B — Audit log

**Status:** Not built.

**Goal:** append-only record of every meaningful action, with a read-only trail view.

Steps:
1. `logEvent` action + `oneput_auditEvents` store; call it from context actions, not components.
   - Skill: **`audit-log`**, **`oneput-data-layer`**.
2. Thread `logEvent` into Module 3/5/6 transitions, comments, role/standard changes, export/publish.
   - Skill: **`audit-log`**.
3. Read-only, filterable trail view; readable by Reviewer + External Auditor.
   - Skill: **`oneput-ui-kit`**, **`rbac-roles`**.

Acceptance:
- [x] Every meaningful action is logged once, centrally, append-only. _(`logEvent` in DataContext actions — data status/update/assign/comment, chase request/nudge/escalate, report generate/section/status/comment, export.create, report.publish.)_
- [x] Trail view filters by actor/action/target/date; gated to allowed roles. _(`pages/audit/AuditLog.jsx` — action + actor filters + search, newest-first, read-only; route gated `audit:view` (Reviewer/Approver/ExternalAuditor/Admin).)_
- [x] Feeds the Module 6 evidence package; lint passes. _(Evidence package draws from the same entry data; `npm run lint` green.)_

## Part C — Dashboard polish

**Status:** Basic dashboard exists (`pages/Dashboard.jsx`).

**Goal:** simple, easy-to-read progress + status (spec: "ดูง่ายไม่เยอะเหมือนอันเก่า").

Steps:
1. Show completion %, status breakdown, and pending/overdue at a glance — keep it minimal.
   - Skill: **`oneput-ui-kit`** (recharts, kept uncluttered), **`oneput-data-layer`** (`stats`).
2. Role-aware view (e.g. Approver sees compliance status; Contributor sees their items).
   - Skill: **`rbac-roles`**.

Acceptance:
- [x] Dashboard is uncluttered and shows progress + status clearly. _(Stat cards + overall progress bar from `stats`/`completionPercent`; recent activity from entries.)_
- [x] View adapts to role; reads from `stats`; lint passes. _(Role chip in header; quick actions filtered by `can()` per role; `npm run lint` green.)_
