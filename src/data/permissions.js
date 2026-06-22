// Role & permission matrix (see .claude/overview/project-overview.md).
// Permissions are DATA — gate UI/actions via can(role, perm), never scattered role string checks.
// MVP note: there is no backend, so this is UX/role-simulation, not security. Real enforcement
// belongs server-side later.

export const ROLES = [
  { key: 'Admin', label: 'Admin', description: 'Platform owner — full access to every module.' },
  { key: 'Contributor', label: 'Contributor', description: 'Submits ESG data and drafts report content.' },
  { key: 'Reviewer', label: 'Reviewer / Internal Auditor', description: 'Reviews and approves/rejects data.' },
  { key: 'Approver', label: 'Approver', description: 'Final report sign-off. Read-only on data.' },
  { key: 'ExternalAuditor', label: 'External Auditor', description: 'External assurance. Read-only within scope.' },
];

export const PERMISSIONS = {
  Admin: ['*'],
  Contributor: [
    // 'data:view' (own) — sees only metrics assigned to them, no 'data:view-all'
    'data:view', 'data:enter', 'data:csv', 'data:edit-own',
    'report:write', 'comment:reply', 'comment:create', 'dashboard:view',
  ],
  Reviewer: [
    'data:view', 'data:view-all', 'data:review', 'report:review', 'comment:create', 'dashboard:view',
  ],
  Approver: [
    'data:view', 'data:view-all', 'report:view', 'report:approve', 'comment:create', 'dashboard:view',
  ],
  ExternalAuditor: [
    'data:view', 'data:view-all', 'report:view', 'audit:view', 'evidence:download', 'finding:create',
  ],
};

export const can = (role, perm) =>
  !!PERMISSIONS[role] && (PERMISSIONS[role].includes('*') || PERMISSIONS[role].includes(perm));

export const getRole = (key) => ROLES.find(r => r.key === key);
export const roleLabel = (key) => getRole(key)?.label ?? key;
