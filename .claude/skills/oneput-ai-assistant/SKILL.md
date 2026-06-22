---
name: oneput-ai-assistant
description: Build and prompt the Oneput AI chatbot — the ESG teammate that asks each department for the data it owes, chases on a schedule, escalates late items, explains metrics, and reports progress. Use when working on the chatbot module, replacing the mock responder with real Claude, designing the system prompt / tools, or adding the data-request and chasing workflow (LINE/email/in-app).
---

# Oneput AI assistant

Oneput AI is the product's headline feature: an AI teammate that collects ESG data all year by
chasing numbers out of every department, so nothing piles up at year-end. Today it is a keyword mock
(`generateResponse` in `components/chatbot/ChatWindow.jsx` and `pages/chatbot/ChatbotPage.jsx`). This
skill covers turning it into a real, prompted assistant with the chasing workflow.

## When to use this skill

- Editing either chatbot surface (floating `ChatWindow`, full-page `ChatbotPage`).
- Replacing the mock `generateResponse` with a real Claude call.
- Designing the assistant's system prompt, tools, or structured outputs.
- Building data requests + the scheduled follow-up ("chasing") + escalation workflow.

> When implementing the real model call, also invoke the **`claude-api`** skill for current model ids,
> SDK usage, tool-use, and streaming. Default model: **`claude-opus-4-8`** (use `claude-haiku-4-5`
> for cheap high-volume nudges). Never hard-code a key in the client — calls go through a backend/proxy
> (a future seam; for the MVP, isolate the call behind one module function).

## What the assistant does (from the spec)

1. **Asks for what's needed.** At the start of the period it tells each department exactly what data
   to send and when. The list is derived from the active GRI metrics (MVP scope: GRI only) then
   fine-tuned for the company.
2. **Chases automatically.** It follows up on its own schedule (in LINE or wherever the team works),
   so nothing piles up at year-end.
3. **Escalates.** If someone is late, it nudges their manager.
4. **Assists in-app.** Explains any metric, reports progress, points users to the right screen.

## System prompt (starting point — adapt, keep grounded)

```
You are Oneput AI, an ESG-reporting teammate for {company.name} ({company.industry}),
reporting under {settings.framework}. Reporting period: {reportingPeriodStart}–{reportingPeriodEnd}.

Your job is to collect ESG data across departments, not to write the report. You:
- Tell each data owner exactly which metrics they owe and by when.
- Follow up politely but persistently until data is submitted and approved.
- Explain any metric in plain language (definition, unit, why it matters, how to source it).
- Report accurate progress using ONLY the data provided to you in context.

Rules:
- Ground every number in the provided context (active metrics, data entries, stats). Never invent
  values. If you don't have it, say so and offer to help collect it.
- Be concise and specific. Reference metrics by code and name (e.g. "GRI 305-1 — Scope 1 emissions").
- Respect roles: only nudge the assigned owner; escalate to a manager only when overdue.
- When the user can act in the app, name the exact screen (Data Collection, Metrics Registry, ...).
- Tone: a helpful colleague — friendly, never pushy or alarmist.
```

Interpolate live context (company, settings, `activeMetrics`, `dataEntries`, `stats`) from the same
hooks the mock uses (`useApp`, `useData`) — the assistant must read through the data layer, never
`localStorage` directly.

## Tools / structured actions (give Claude these, don't free-text everything)

Define tool schemas so the model can *act*, not just chat:

- `get_progress()` → returns `stats` + completion %.
- `list_pending(filter)` → metrics with status `pending`/missing value, optionally by category/owner.
- `explain_metric(code)` → registry entry for a metric.
- `create_data_request(metricIds, ownerId, dueDate)` → records what's owed by whom and when.
- `schedule_followup(requestId, cadence)` → sets the chasing schedule.
- `send_nudge(ownerId, message)` / `escalate(ownerId)` → dispatch a reminder / manager escalation.

Keep tool results small and grounded in registry + entries. Tool outputs are the *only* source of
numbers the model may state.

## Chasing workflow (the differentiator)

1. **Plan** at period start: from `activeMetrics` + assignments, build a `DataRequest` per owner
   (which metrics, due date). Persist via `oneput-data-layer` (`oneput_dataRequests`).
2. **Schedule** follow-ups per request (cadence e.g. weekly → daily as the deadline nears).
3. **Run** the schedule. There is no backend yet, so for the MVP simulate the scheduler client-side
   (a timer/`useEffect` tick) and render a "would send" activity log; design the function boundary so
   a real cron/queue + LINE/email/Slack sender drops in later.
4. **Escalate** when an item is overdue: nudge the owner's manager (role/assignment lookup).
5. **Detect completion**: when an entry reaches `approved`, stop chasing it and update progress.

Channels: spec names **LINE** first ("lives in LINE or wherever your team works"), plus email/Slack.
Abstract the sender behind one `notify(channel, recipient, message)` function so channels are pluggable.

## Migration: mock → real (do this without changing screens)

1. Extract the inline `generateResponse` into a single module function (e.g. `utils/assistant.js` or
   `services/assistant.js`) — both chatbot surfaces import the same one (kill the current duplication).
2. Give it the signature `async respond(messages, context) → { text, actions[] }`.
3. Behind that function, swap the keyword logic for a Claude call with the system prompt + tools above.
4. The chat components keep their existing message/typing UI (`oneput-ui-kit`); only the responder changes.

## Rules

- One shared responder module; do not keep two copies of `generateResponse`.
- The assistant reads data only through `useApp`/`useData`/the data layer; it states only grounded numbers.
- Keep the model call isolated behind one function so backend/proxy + real channels slot in later.
- Persisted assistant state (requests, schedules, activity log) goes through `oneput-data-layer`.
