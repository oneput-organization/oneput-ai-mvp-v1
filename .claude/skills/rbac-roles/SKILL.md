---
name: rbac-roles
description: Implement and enforce Oneput AI's role-based access control and permission matrix (Admin, Contributor, Reviewer/Internal Auditor, Approver, External Auditor). Use when adding users/roles, gating routes/UI/actions by permission, or wiring the Owner→Reviewer→Approver data and report flows.
---

# RBAC & roles

The product defines five roles with a permission matrix. Today the app only gates on "setup complete"
(`ProtectedRoute` + `isSetupComplete`). This skill introduces real role-based access.

## When to use this skill

- Introducing users and a current-user concept.
- Gating a route, page section, button, or action by role/permission.
- Building the review/approve workflow (who can submit, review, approve, reject).
- Restricting data visibility (e.g. Contributor sees only assigned items; External Auditor read-only).

## The roles (see `.claude/overview/project-overview.md` for the full matrix)

| Role | Access | Key abilities |
|------|--------|---------------|
| `Admin` | everything | manage users/roles, standards, metrics, templates, export, publish |
| `Contributor` | assigned items only | enter data, upload CSV, edit before approval, draft report content, reply to comments |
| `Reviewer` (Internal Auditor) | assigned-for-review | approve/reject data & report sections, comment back |
| `Approver` | everything, read-only | view dashboards/compliance, approve/reject final report, comment |
| `ExternalAuditor` | read-only in scope | view source data + audit trail, download evidence package, log findings |

## How to implement

1. **Model users + current user** via `oneput-data-layer`: add a `UserContext` (or extend AppContext)
   holding `users[]` and `currentUser` with a `role`. Persist under `oneput_users` / `oneput_currentUser`.
   For the MVP a role switcher (no real auth) is acceptable — keep auth as a future seam.
2. **Define a permission map** as data, e.g. `data/permissions.js`:
   ```js
   export const PERMISSIONS = {
     Admin: ['*'],
     Contributor: ['data:enter', 'data:csv', 'data:edit-own', 'report:write', 'comment:reply'],
     Reviewer: ['data:review', 'report:review', 'comment:create'],
     Approver: ['report:approve', 'dashboard:view', 'comment:create'],
     ExternalAuditor: ['data:view', 'audit:view', 'evidence:download', 'finding:create'],
   };
   export const can = (role, perm) =>
     PERMISSIONS[role]?.includes('*') || PERMISSIONS[role]?.includes(perm);
   ```
3. **Gate UI** with a `can(currentUser.role, 'perm')` check — hide/disable controls the role can't use.
   Reuse `ProtectedRoute` (extend it to accept a `permission` prop) for route-level gating.
4. **Scope data visibility:** filter `dataEntries`/reports by `assignee`/assignment for Contributor and
   review-assignment for Reviewer. Approver/ExternalAuditor get read-only views.
5. **Wire the status flow to roles:** only Contributor advances `pending → submitted`; only Reviewer
   moves `under-review → approved|rejected`; Approver acts on the final report. See data-model lifecycle.

## Rules

- Permissions are data (`PERMISSIONS` map), not scattered `if (role === ...)` strings — check via `can()`.
- Gating is defense-in-depth at route + component + action level, but the MVP has no server, so treat
  it as UX/role-simulation, not security. Document that real enforcement belongs server-side later.
- Don't break the existing setup gate; layer role gating on top of `isSetupComplete`.
