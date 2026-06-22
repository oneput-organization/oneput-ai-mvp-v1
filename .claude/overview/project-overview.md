# Oneput AI — Project Overview

## What it is

Oneput AI is an ESG reporting platform. Most ESG work is not writing the report — it is chasing
numbers out of every department. Oneput AI does that chasing: it derives the data each department
owes from the company's reporting frameworks, follows up on its own schedule, validates what comes
in, and assembles a standard-compliant report.

**MVP scope: GRI only.** This MVP targets the **GRI Standards (2021)** exclusively. The product spec
also lists IFRS S1, IFRS S2, and SEC 56-1 — these are **deferred (out of scope for the MVP)**. The
registry keeps the metric `framework` field as an array so other standards can be added later, but no
multi-standard selection or mapping is built in the MVP.

## The six core modules

| # | Module | Purpose | Status in repo |
|---|--------|---------|----------------|
| 1 | Framework & Setup | Pick standard/framework; capture company overview | **Built** (`setup/`, `onboarding/`) |
| 2 | ESG Metrics Registry | Central registry of metrics, each mapped to one+ standards | **Built** (`registry/`, `data/`) |
| 3 | Data Collection | Assign metrics to owners, collect manual/CSV/API, validate, Owner→Reviewer→Approved flow | **Partial** — manual + CSV done; assignment & review/approve flow missing |
| 4 | Chatbot (Oneput AI) | AI teammate that requests data, chases on schedule, escalates late items | **Mock** — keyword responses only; no real LLM/LINE/scheduling |
| 5 | Report Builder | Standard-compliant templates + rich text editor + pull numbers from variables | **Not built** |
| 6 | Export & Compliance | Export PDF/Word; auto-generate disclosure/evidence package | **Not built** |

## Non-core features (cross-cutting)

- **Roles & permission matrix** — 5 roles, each with defined access (see below). Currently only a
  setup-complete gate exists; real RBAC is not implemented.
- **Audit log** — record of every action. Not implemented.
- **Dashboard** — progress and data status, kept simple. Basic version built.
- **API integration** — SAP, Oracle, ERP connectors. Future.
- **CSV** — defined format + per-metric validation. Built for import.

## Roles (permission matrix)

| Role | Purpose | Access | Can do |
|------|---------|--------|--------|
| **Admin** | Platform owner on the customer side | All modules | Manage users & roles, set standards, create/edit material topics & metrics, see all BUs' data, manage templates, export, publish |
| **Contributor** | Submits ESG data / drafts report content; often per-BU | Only assigned data & reports | Receive data requests, enter data, upload CSV, edit before approval, see status, write/edit report content, insert data into reports, reply to reviewer comments |
| **Reviewer / Internal Auditor** | Checks correctness of data & report content | Items assigned for review | View submissions, validate, approve/reject, send comments back, review draft report, approve/reject report sections |
| **Approver** | Final sign-off before publish | Everything, read-only | View dashboard & compliance status, view final report, approve/reject report, comment |
| **External Auditor** | Outside assurance provider | Read-only within granted scope | View source data, view audit trail, download evidence package, check supporting docs, log observations/findings |

The data-collection flow is **Data Owner → Reviewer → Approved**, mirrored by the entry statuses
`pending → in-progress → submitted → under-review → approved` (or `rejected` back to the owner).

## Current build status summary

- **Done:** Setup wizard, framework selection, company profile, GRI metric registry with
  industry-based activation, manual data entry, CSV import + validation, basic dashboard, mock chatbot.
- **Next, in dependency order:** RBAC roles → finish data-collection workflow (assignment + review/approve)
  → real AI chatbot → report builder → export/compliance → audit log. See `.claude/tasks/00-roadmap.md`.

## Where things live

- Product spec: `product-specification.md`
- Architecture notes: `.claude/overview/architecture.md`
- Data model: `.claude/overview/data-model.md`
- Build plan: `.claude/tasks/` (start at `00-roadmap.md`)
- Reusable skills: `.claude/skills/`
