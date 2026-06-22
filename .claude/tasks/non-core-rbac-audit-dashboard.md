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
- [ ] Five roles exist; current user/role selectable.
- [ ] Permissions are data-driven via `can()`; routes/UI/actions gated accordingly.
- [ ] Data visibility scoped per role; setup gate still works; lint passes.

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
- [ ] Every meaningful action is logged once, centrally, append-only.
- [ ] Trail view filters by actor/action/target/date; gated to allowed roles.
- [ ] Feeds the Module 6 evidence package; lint passes.

## Part C — Dashboard polish

**Status:** Basic dashboard exists (`pages/Dashboard.jsx`).

**Goal:** simple, easy-to-read progress + status (spec: "ดูง่ายไม่เยอะเหมือนอันเก่า").

Steps:
1. Show completion %, status breakdown, and pending/overdue at a glance — keep it minimal.
   - Skill: **`oneput-ui-kit`** (recharts, kept uncluttered), **`oneput-data-layer`** (`stats`).
2. Role-aware view (e.g. Approver sees compliance status; Contributor sees their items).
   - Skill: **`rbac-roles`**.

Acceptance:
- [ ] Dashboard is uncluttered and shows progress + status clearly.
- [ ] View adapts to role; reads from `stats`; lint passes.
