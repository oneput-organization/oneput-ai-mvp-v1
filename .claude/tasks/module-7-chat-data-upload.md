# Module 7 — Upload Data in Chat → Fill Data Points

**Status:** Not started. Chat (`components/chatbot/ChatWindow.jsx`, `pages/chatbot/ChatbotPage.jsx`)
is text-only; data points are filled only via Data Collection manual entry / CSV import
(`pages/collection/DataCollection.jsx`, `utils/validation.js`). There is **no** way to drop a file
into the chat and have the assistant populate metric entries.

**Goal:** let a user attach a file (CSV first; image/PDF/Excel later) in the chat, have the assistant
**extract values and map them to active GRI metrics**, show a **review/confirm preview**, and on
confirm **write the values into the data points** (`dataEntries`) through `DataContext`. The chat
becomes a second, AI-assisted path into the same collection + validation + review flow as Module 3.

> Primary skill: **`oneput-ai-assistant`** (extraction prompt + a new tool). Also load
> **`esg-data-validation`** (validate before fill), **`oneput-data-layer`** (write through context),
> **`oneput-ui-kit`** (attach button + preview UI), **`rbac-roles`** (only owners/contributors fill),
> **`audit-log`** (log the chat-driven fill), and **`claude-api`** when the backend does real extraction.

## Steps

1. **Attach in chat (UI).** Add a file-attach control to both chat surfaces' input area
   (`ChatWindow.jsx`, `ChatbotPage.jsx`). Accept `.csv` for the MVP; structure the picker so
   images/PDF/xlsx can be enabled later. Show the attached filename as a chip before send.
   - Skill: **`oneput-ui-kit`** (reuse `chat-*` classes; lucide `Paperclip`/`X`).
2. **Extraction boundary.** Add ONE function — e.g. `extractEntries(file, context) → { rows[], notes }`
   — alongside `respond()`/`notify()` in `services/assistant.js` (or a sibling). For the MVP it parses
   CSV locally via `utils/validation.js` (reuse `parseCSV`); when `VITE_ASSISTANT_API_URL` is set it
   POSTs the file to the backend so real Claude can read images/PDF/Excel. **No client API key.**
   - Skill: **`oneput-ai-assistant`** (extraction prompt + tool schema, e.g. `fill_data_points`),
     **`claude-api`** (document/vision input, tool-use), **`esg-data-validation`** (reuse the parser).
3. **Map rows → metric ids.** Resolve each extracted row to an active metric by `code` (e.g.
   "GRI 305-1") or fuzzy name match against `activeMetrics`. Carry the raw value, unit, and a
   confidence/match note. Leave unmatched rows visible (do not silently drop them).
   - Skill: **`oneput-ai-assistant`** (mapping rules), **`esg-metric-registry`** (resolve by code/name).
4. **Validate every extracted value.** Run each mapped value through `validateMetricValue` /
   `validateStructuredForm` before it can be applied — invalid rows are flagged, not written.
   - Skill: **`esg-data-validation`** (reuse, do not re-implement checks).
5. **Review & confirm preview.** Render an in-chat (or modal) table: metric · extracted value · unit ·
   matched? · valid? · existing value (overwrite warning). User edits/deselects rows and confirms.
   Nothing is written before explicit confirm.
   - Skill: **`oneput-ui-kit`** (table/preview matching the design system).
6. **Fill the data points.** On confirm, write only matched + valid + selected rows via
   `bulkUpdateEntries` (set `value`, `status: 'in-progress'`, `notes` noting "filled via chat upload",
   `updatedAt`). Respect Module 3's lifecycle — do NOT auto-approve; values enter the normal
   Owner → Reviewer → Approved flow.
   - Skill: **`oneput-data-layer`** (`bulkUpdateEntries`, never touch localStorage directly),
     **`rbac-roles`** (only Contributor/owner of a metric may fill it).
7. **Audit + feedback.** Log each filled metric via `logEvent` (action: chat upload fill, source file).
   Reply in chat with a grounded summary: N filled, M skipped (unmatched/invalid), and link to
   **Data Collection** to review.
   - Skill: **`audit-log`**, **`oneput-ai-assistant`** (grounded confirmation message).

## Acceptance criteria

- [ ] A file can be attached in both chat surfaces and sent (CSV for MVP; picker ready for image/PDF/xlsx).
- [ ] Extraction runs behind one swappable function (local CSV parse now; backend Claude when configured); no client API key.
- [ ] Extracted rows are mapped to active metrics by code/name; unmatched rows are surfaced, not dropped.
- [ ] Every value is validated with `utils/validation.js`; invalid rows cannot be written.
- [ ] A review/confirm preview shows matched/valid/overwrite state; nothing writes before confirm.
- [ ] Confirmed rows fill `dataEntries` via `bulkUpdateEntries` and enter the normal review flow (no auto-approve).
- [ ] Each fill is in the audit log; chat returns a grounded summary. `npm run lint` passes.

> Scope: GRI-only (per `/CLAUDE.md`). MVP supports CSV extraction client-side; image/PDF/Excel
> extraction is gated behind the backend boundary and can ship once the proxy exists.
