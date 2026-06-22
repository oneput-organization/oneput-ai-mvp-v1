---
name: oneput-data-layer
description: Add or extend client state in the Oneput AI app via React Context + localStorage. Use whenever a task needs to read, write, or introduce persisted app state (company, settings, active metrics, data entries, or new entities like users/reports/audit events) — never touch localStorage from a component.
---

# Oneput data layer

State in this app lives in two React Contexts and is persisted to `localStorage`. Components and
pages **must not** call `localStorage` directly. Any new persisted state goes through a context.

## When to use this skill

- A task says "store X", "persist", "track", "load", or introduces a new entity (User, Report,
  AuditEvent, Assignment, DataRequest, etc.).
- You need to read existing state (`company`, `settings`, `activeMetricIds`, `dataEntries`, `stats`).

## The two contexts

- `contexts/AppContext.jsx` → `company`, `settings`, setup state. Hook: `useApp()`.
- `contexts/DataContext.jsx` → `activeMetricIds`, `dataEntries`, computed `stats`. Hook: `useData()`.

`DataProvider` is nested inside `AppProvider` (see `App.jsx`), so DataContext may read AppContext.

## How to add a new piece of state (follow this pattern exactly)

1. Pick the right context (company/settings → AppContext; metric/entry/collection → DataContext). If
   the entity is genuinely new and cross-cutting (e.g. `users`, `auditEvents`, `reports`), create a
   new provider file `contexts/<Name>Context.jsx` and nest it in `App.jsx`'s provider tree.
2. Choose a `localStorage` key (no prefix in code — `storage` adds `oneput_`). Lazy-seed state:

   ```js
   const [users, setUsersState] = useState(() => storage.get('users', []));
   ```
3. Every setter updates React state **and** persists immediately:

   ```js
   const setUsers = (next) => { setUsersState(next); storage.set('users', next); };
   ```
   For functional updates that derive from previous state, persist inside the updater (see
   `updateDataEntry`/`bulkUpdateEntries`/`addComment` in `DataContext` for the canonical form, and
   reuse them rather than reimplementing).
4. Expose values + actions through the provider's `value={{ ... }}` object and the `use*` hook.
5. Add `updatedAt: new Date().toISOString()` to mutable records, as existing entries do.

## Rules

- Never read/write `localStorage` from a component — only from a context.
- Keep setter signatures stable; this is the seam where a real backend will replace `storage` calls
  with API calls. Do not leak `localStorage` specifics into pages.
- Reuse `storage.get/set/remove/clear` from `utils/storage.js`. Don't add a second persistence helper.
- Match shapes documented in `.claude/overview/data-model.md`; update that doc when you add an entity.

## Reference

- `utils/storage.js` — the only persistence helper.
- `contexts/DataContext.jsx` — canonical examples of seed + persist + functional update + derived stats.
