# Oneput AI — ESG Reporting MVP

Oneput AI is an ESG (Environmental, Social, Governance) reporting platform. It helps companies
collect ESG data across departments, chase that data with an AI teammate, and produce
standard-compliant reports.

**MVP scope: GRI only.** This MVP targets the **GRI Standards (2021)** exclusively. The product spec
also names IFRS S1/S2 and SEC 56-1 — those are **out of scope for the MVP** and deferred. The metric
`framework` field stays an array so other standards can be added later, but do not build
multi-standard selection/mapping now. Keep all framework UI and seeding GRI-only.

The product vision and full module breakdown live in `product-specification.md`. Read it before
making product decisions — but apply the GRI-only scope above.

## Tech stack

- **Build:** Vite 8 (`type: module`)
- **UI:** React 19, **plain JSX (no TypeScript)**, function components + hooks
- **Routing:** react-router-dom v7
- **Charts:** recharts
- **Icons:** lucide-react
- **State + persistence:** React Context + `localStorage` (no backend yet — see below)
- **Lint:** ESLint flat config (`eslint.config.js`)
- **E2E:** Playwright (installed; tests not yet authored)

There is **no backend, database, or real AI integration yet.** All data persists to `localStorage`
under the `oneput_` prefix, and the chatbot is a keyword-matching mock. Treat real backend / Claude
integration as future work, gated behind the data layer so the UI does not need to change.

## Commands

```bash
npm run dev      # start Vite dev server (HMR)
npm run build    # production build
npm run preview  # preview the production build
npm run lint     # eslint .
```

## Project structure

```
src/
  main.jsx                 # entry
  App.jsx                  # router + provider tree (AppProvider > DataProvider)
  index.css                # global styles + CSS variables (design tokens)
  contexts/
    AppContext.jsx         # company profile + settings (framework, setup state)
    DataContext.jsx        # active metrics + data entries + computed stats
  data/
    gri-metrics.js         # the ESG metric registry (GRI 2021), CATEGORIES, STATUSES
    gri-industry-mapping.js# industry -> required/recommended metric IDs
    gri-metric-forms.js    # per-metric form field definitions
  pages/                   # one folder per route/module
    onboarding/SetupWizard.jsx
    setup/{FrameworkSetup,CompanyProfile}.jsx
    registry/MetricsRegistry.jsx
    collection/DataCollection.jsx
    chatbot/ChatbotPage.jsx
    Dashboard.jsx
  components/
    layout/{Sidebar,TopBar}.jsx
    routing/ProtectedRoute.jsx
    chatbot/ChatWindow.jsx
  utils/
    storage.js             # localStorage helpers (oneput_ prefix)
    validation.js          # metric value + CSV validation, CSV parse/template
```

## Conventions (match the existing code)

- **JSX only.** No TypeScript. No prop-types currently in use.
- **State lives in Context, never call `localStorage` from components.** Add/extend state via
  `AppContext`/`DataContext`, which wrap `storage` from `utils/storage.js`. Every setter persists
  immediately (`setState` then `storage.set`). Reads seed from `storage.get(key, default)`.
- **Styling is class-based via CSS variables** in `index.css` (`var(--space-4)`, `var(--font-sm)`,
  `var(--primary-500)`, etc.). Reuse existing classes (`page-shell`, `btn btn-ghost btn-sm`,
  `chat-*`, `sidebar-*`). Inline `style={{}}` is acceptable for one-offs, as the code already does.
- **Icons** come from `lucide-react`, sized with the `size` prop.
- **Metric identity:** every metric has a stable `id` (e.g. `gri-305-1`) and human `code`
  (`GRI 305-1`). Reference metrics by `id` in state, show `code`/`name` in UI.
- **Data entry shape:** `dataEntries[metricId] = { value, status, notes, assignee, comments[], updatedAt }`.
  Statuses are defined in `STATUSES` (`gri-metrics.js`): `pending`, `in-progress`, `submitted`,
  `under-review`, `approved`, `rejected`.
- Keep modules behind the setup gate: protected routes require `isSetupComplete` (see `ProtectedRoute`).

## How to work in this repo (skills + tasks)

This repo is scaffolded for skill-driven, task-by-task delivery of the MVP:

- `.claude/overview/` — read these first for product, architecture, and data-model context.
- `.claude/tasks/` — the build plan, **one file per module**, in dependency order. Start at
  `.claude/tasks/00-roadmap.md`, which maps every task to the skills it needs and the order to do them.
- `.claude/skills/` — reusable workflow/prompt skills. Each task file names the skills to invoke and
  **when** to invoke them. Always load the named skill before implementing that step, and follow the
  skill's conventions over ad-hoc choices.

Rule of thumb: pick the current task from the roadmap → open its task file → invoke the skills it
lists at the steps it lists → implement following the conventions above.

**Commit when a task is done.** Once a task's acceptance criteria are met and `npm run lint` passes,
stage and commit it: `git add -A` then `git commit -m "<module/task>: <what changed>"`. One focused
commit per completed task (or per meaningful step). Don't commit broken or lint-failing code.

## Guardrails

- Don't introduce TypeScript, a CSS framework, or a state library — keep the lean Vite/JSX/Context stack.
- Don't read or write `localStorage` directly from components or pages; go through the contexts.
- When adding a metric or standard, update the registry data files (`data/`), not hard-coded lists in pages.
- Keep the AI chatbot's data access read-through the same contexts so swapping the mock for real Claude
  is isolated to one module.
