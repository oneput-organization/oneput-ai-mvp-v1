# Architecture

## High level

A single-page React app. No backend yet — all state is client-side and persisted to `localStorage`.
This is deliberate for the MVP: the UI and data shapes are proven first, then a backend/AI layer can
be slotted in behind the contexts without rewriting screens.

```
index.html → src/main.jsx → <App/>
  <BrowserRouter>
    <AppProvider>           // company profile + settings (framework, setup state)
      <DataProvider>        // active metrics + data entries + computed stats
        <AppLayout/>        // Sidebar + TopBar + routed <main> + floating ChatWindow
```

## Provider tree (the data layer)

Everything stateful flows through two contexts. **Components never touch `localStorage` directly.**

- **`AppContext`** (`contexts/AppContext.jsx`)
  - `company` — company overview fields
  - `settings` — `{ framework, setupComplete, sidebarCollapsed }`
  - derived: `companyCompletion()`, `isCompanyComplete`, `isSetupComplete`, `isReadyToFinish`
  - actions: `setCompany`, `setSettings`, `toggleSidebar`, `completeSetup`
- **`DataContext`** (`contexts/DataContext.jsx`)
  - `activeMetricIds` — which registry metrics are in scope (seeded from industry mapping)
  - `dataEntries` — `{ [metricId]: { value, status, notes, assignee, comments[], updatedAt } }`
  - derived: `activeMetrics` (registry joined with `required` flag), `stats`, `completionPercent`
  - actions: `toggleMetricActive`, `setAllMetricsActive`, `applyIndustryMetrics`,
    `updateDataEntry`, `bulkUpdateEntries`, `addComment`

Pattern for every setter: update React state, then `storage.set(key, value)` immediately. Reads seed
state lazily with `storage.get(key, default)`.

## Persistence

`utils/storage.js` wraps `localStorage` with the `oneput_` prefix and JSON (de)serialization.
Keys in use: `oneput_company`, `oneput_settings`, `oneput_activeMetricIds`, `oneput_dataEntries`.

## Routing & gating

- Routes are declared in `App.jsx`.
- Before setup is complete, the app renders only `SetupWizard`.
- After setup, the shell (Sidebar + TopBar + content + floating `ChatWindow`) renders.
- `ProtectedRoute` gates Registry / Collection / Chatbot behind `isSetupComplete`.
- **RBAC by role is not yet implemented** — the only gate today is "setup complete". Role-based gating
  is planned (see `rbac-roles` skill + non-core task).

## Registry-driven design

The registry data files in `data/` are the single source of truth for what can be collected:
- `gri-metrics.js` — metric definitions + `CATEGORIES` + `STATUSES`
- `gri-industry-mapping.js` — maps an industry to required/recommended metric IDs (drives which
  metrics auto-activate after company setup)
- `gri-metric-forms.js` — per-metric input form field definitions

Adding metrics or a new standard means editing these files, not the screens.

## The seam for future backend / AI

When a backend and real Claude integration arrive, they should plug in behind the contexts and the
chatbot module:
- Replace `storage` reads/writes in the contexts with API calls (same function signatures).
- Replace the chatbot's `generateResponse` mock with a real Claude call + tool/function calling that
  reads the same context data.
- Add scheduling/notification (LINE, email, Slack) as a service the chatbot module calls.

Keeping these seams clean is a hard requirement — see the `oneput-data-layer` and
`oneput-ai-assistant` skills.
