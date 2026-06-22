---
name: oneput-ui-kit
description: Build UI in the Oneput AI app consistent with its existing design system — CSS-variable tokens in index.css, shared classes (page-shell, btn, sidebar-*, chat-*), lucide-react icons, and recharts. Use whenever creating or editing pages/components so new screens match the look and conventions.
---

# Oneput UI kit

The app uses a hand-rolled design system: CSS custom properties as tokens in `src/index.css`, plus a
set of reusable class names. Match it — do not add a CSS framework or component library.

## When to use this skill

- Creating a new page or component.
- Adding buttons, cards, badges, forms, charts, or layout.
- Anytime you'd otherwise invent styling.

## Tokens (use these, never hard-code)

- Spacing: `var(--space-1..--space-8)`
- Font sizes: `var(--font-xs|sm|base|lg|...)`
- Colors: `var(--primary-500)`, `var(--neutral-500)`, category colors (`env`, `social`, `gov`),
  status colors (gray/blue/amber/purple/green/red — see `STATUSES`).

## Reusable classes (grep `index.css` for the full set)

- Layout: `page-shell`, `app-layout`, `app-main`, `app-content`, `sidebar*`, `topbar*`
- Buttons: `btn`, `btn-ghost`, `btn-sm` (combine, e.g. `btn btn-ghost btn-sm`)
- Chat: `chat-panel`, `chat-message`, `chat-message-bubble`, `chat-quick-action`, `chat-input-area`,
  `chat-typing`, `chat-fab`
- Status: render status using the `STATUSES` color mapping from `data/gri-metrics.js`.

## Conventions

- **Function components + hooks** only. Read state via `useApp()` / `useData()`; never `localStorage`.
- **Icons:** import from `lucide-react`, size with `size={N}` (16 inline, 18–20 nav, 24 hero).
- **Charts:** use `recharts` (already a dependency) for dashboard/progress visuals; keep them simple
  and uncluttered (the spec explicitly asks for an easy-to-read dashboard, not a busy one).
- One folder per route under `pages/`; shared building blocks under `components/`.
- Inline `style={{}}` is acceptable for one-offs (the codebase does this), but prefer a class/token
  when the style repeats.
- Markdown-ish bot text uses the existing `**bold**` / `` `code` `` renderer in the chat components —
  reuse that pattern rather than adding a markdown library.

## Rules

- No Tailwind/MUI/Chakra/styled-components. Stay with CSS variables + classes.
- New shared styles go in `index.css` as classes using existing tokens.
- Keep accessibility basics: real `<button>`/`<input>`, `title`/`aria` on icon-only controls.
