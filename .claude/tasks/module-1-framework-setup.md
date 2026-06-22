# Module 1 — Framework & Setup

**MVP scope: GRI only.** GRI 2021 is the only framework. No IFRS/SEC selection in the MVP.

**Status:** Built and essentially complete for GRI. Wizard, framework (GRI) selection, and company
profile work (`pages/onboarding/SetupWizard.jsx`, `pages/setup/FrameworkSetup.jsx`,
`pages/setup/CompanyProfile.jsx`, gated by `AppContext`).

**Goal of remaining work:** a quick verification pass + tighten the setup → registry hand-off. This is
a light task because GRI is already wired; mostly confirm it works end-to-end.

## Steps

1. **Verify the GRI setup flow.** Run the wizard: pick GRI, fill the company profile, finish setup,
   confirm protected routes unlock. Confirm `FrameworkSetup` presents GRI clearly (no other standards).
   - Skill: **`oneput-ui-kit`** (any chrome tweaks).
2. **Company overview completeness.** Confirm `REQUIRED_COMPANY_FIELDS` matches the spec's "company
   overview"; add fields only if missing (keep `companyCompletion()` accurate).
   - Skill: **`oneput-data-layer`** (company shape), **`oneput-ui-kit`** (form controls).
3. **Hand-off to registry.** On finishing setup, ensure active GRI metrics are seeded for the chosen
   industry.
   - Skill: **`esg-metric-registry`** (`getMetricIdsForIndustry`), **`oneput-data-layer`**
     (`applyIndustryMetrics`).
4. **(After RBAC exists)** Make framework/metric management Admin-only.
   - Skill: **`rbac-roles`**.

## Acceptance criteria

- [ ] Wizard completes with GRI; protected routes unlock afterward.
- [ ] Company overview captures all spec fields; completion % is correct.
- [ ] Finishing setup seeds active GRI metrics correct for the industry.
- [ ] No multi-standard UI present; no direct `localStorage` use in pages; lint passes.
