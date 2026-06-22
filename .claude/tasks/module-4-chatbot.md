# Module 4 — Chatbot (Oneput AI)

**Status:** Mock. Two chat surfaces with duplicated keyword `generateResponse`
(`components/chatbot/ChatWindow.jsx`, `pages/chatbot/ChatbotPage.jsx`). No real LLM, no chasing.

**Goal:** the product's headline feature — an AI teammate that asks each department for the data it
owes, chases on schedule, escalates late items, explains metrics, and reports grounded progress.

> Primary skill for the whole module: **`oneput-ai-assistant`** (system prompt, tools, chasing flow).
> Also load **`claude-api`** for the real model call and **`prompt-engineer`** when tuning the prompt.

## Steps

1. **De-duplicate the responder.** Extract `generateResponse` into one shared module
   (e.g. `services/assistant.js`) with signature `async respond(messages, context) → { text, actions[] }`;
   both surfaces import it.
   - Skill: **`oneput-ai-assistant`** (migration section).
2. **Ground the assistant in live data.** Pass `company`, `settings`, `activeMetrics`, `dataEntries`,
   `stats` via `useApp`/`useData`. The assistant states only numbers present in context.
   - Skill: **`oneput-ai-assistant`**, **`oneput-data-layer`** (read-through, no direct localStorage).
3. **Real model + tools.** Replace keyword logic with a Claude call (default `claude-opus-4-8`) using
   the system prompt and tool schemas from the skill (`get_progress`, `list_pending`, `explain_metric`,
   `create_data_request`, `schedule_followup`, `send_nudge`, `escalate`).
   - Skill: **`oneput-ai-assistant`** (prompt + tools), **`claude-api`** (SDK, tool-use, streaming).
   - Keep the model call behind one function so a backend/proxy replaces it later (no client API key).
4. **Data requests.** At period start, build a `DataRequest` per owner from active metrics +
   assignments (which metrics, due date).
   - Skill: **`oneput-ai-assistant`** (chasing workflow), **`oneput-data-layer`** (`oneput_dataRequests`),
     **`rbac-roles`** (owners/managers).
5. **Chasing + escalation.** Schedule follow-ups; simulate the scheduler client-side for the MVP and
   render an activity log; nudge owners, escalate overdue items to managers; stop when `approved`.
   - Skill: **`oneput-ai-assistant`**; abstract sending behind `notify(channel, recipient, message)`
     (LINE first, then email/Slack) so channels are pluggable.
   - Skill: **`audit-log`** (log nudges/escalations).
6. **Keep the chat UX.** Reuse the existing message/typing/quick-action UI.
   - Skill: **`oneput-ui-kit`**.

## Acceptance criteria

- [ ] One shared responder module; no duplicated `generateResponse`.
- [ ] Assistant answers from real Claude, grounded in context, never inventing numbers.
- [ ] It can create data requests, run a (simulated) chasing schedule, nudge, and escalate.
- [ ] Model call + channel sending are each behind a single swappable function; no client-side API key.
- [ ] Existing chat UI intact; lint passes.
