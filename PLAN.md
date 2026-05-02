# Execution Plan — Indian Tax Regime Comparator (FY 2025-26)

Each phase ends with a runnable app. The rule: if you can't open it in a browser and see something real, the phase isn't done.

---

## Phase 1 — Foundation & Landing Page

**Goal:** A polished landing page renders in the browser. Nothing else.

**What gets built:**
- Next.js 14 (App Router) project with TypeScript and Tailwind CSS
- Design tokens configured as CSS variables (all colors, radii, shadows from Section 10)
- Inter font loaded via `next/font`
- Landing page (`/`) with all three sections:
  - Hero: headline, sub-headline, trust signals row, primary CTA button
  - Results preview: static mock result card with blurred/dummy numbers
  - How it works: 3-step icon row
  - Footer with disclaimer
- CTA button routes to `/calculator` (renders a "Coming soon" placeholder)
- Fully responsive layout — stacks correctly on mobile

**What you can do at the end:**
Open the app, read the landing page, click "Calculate My Tax →", see a placeholder. Decide if the look and feel is right before building the calculator.

**Deferred:** Everything interactive. No calculator, no wizard, no math.

---

## Phase 2 — Tax Calculation Engine

**Goal:** All the math is correct and verified before any wizard UI is built.

**What gets built:**
- `lib/taxCalculator.ts` — a single pure TypeScript file containing:
  - `TaxInputs`, `TaxResult`, `RegimeResult`, `DeductionLineItems` type definitions
  - `computeTaxFromSlabs()` helper
  - `applyNewRegimeSlabs()` and `applyOldRegimeSlabs()` (all age groups)
  - `calculateMarginalRelief_NewRegime()`
  - `calculateOldRegime()` — full logic: HRA (10(13A)), 80GG, 80C, 80D, NPS, home loan, 80TTA/80TTB
  - `calculateNewRegime()` — standard deduction, employer NPS, cess
  - `calculateTax()` — top-level function returning both regimes + recommendation
  - `getSlabBreakdown()` — for the slab table on the results page
- A verification page at `/verify` that hard-codes the Appendix G worked example (₹15L gross) and renders both regimes' outputs as a readable table — so you can confirm the numbers match the PRD exactly

**What you can do at the end:**
Open `/verify`, read the two calculation tables, confirm Old Regime = ₹53,560 and New Regime = ₹88,546 as specified in Appendix G. Fix any discrepancies before touching the UI.

**Deferred:** No wizard UI. The verification page is intentionally raw — it is only a correctness check, not a user-facing screen.

---

## Phase 3 — Wizard Shell + Steps 1–3 + Live Preview

**Goal:** You can start the wizard, answer the first three questions, and watch the tax estimate update live as you type.

**What gets built:**
- `WizardContext` with `useReducer` — the full state shape from Section 8 (`inputs`, `currentStep`, `skippedSteps`)
- `/calculator` route — two-column desktop layout (question left, preview right)
- `<ProgressBar />` — segmented dots, "Step X of Y" label, pulse animation on current step
- `<WizardCard />` — question title, sub-label, input area, FAQ accordion (collapsed by default), Skip link, Back/Next nav
- `<OptionButton />` — large tappable card for multiple-choice (used for age group)
- `<NumberInput />` — ₹ prefix, Indian comma formatting, monthly/yearly toggle
- `<LivePreviewPanel />` — sticky right column showing both regime tax totals, updating on every state change via `useMemo`
- `<RegimeCard />` — old vs. new cards; winner gets green border
- **Step 1:** Age group (3 option buttons — skip not allowed)
- **Step 2:** Gross salary (number input with monthly/yearly toggle — skip not allowed)
- **Step 3:** Basic salary (number input with skip → 40% default; soft warning if > 60% of gross)

**What you can do at the end:**
Navigate to `/calculator`, pick your age group, enter a salary, enter (or skip) basic salary, and watch both regime tax totals update in the right panel as you type. Confirm the layout looks right on desktop and mobile.

**Deferred:** Steps 4–12. The live preview shows a simplified estimate (no deductions yet) — it will become more accurate in Phase 4.

---

## Phase 4 — Wizard Steps 4–8 (The Deduction Questions)

**Goal:** All major deduction inputs are covered. The live preview is now meaningfully accurate.

**What gets built:**
- **Step 4 — Rent & HRA:**
  - Yes/No toggle
  - If Yes: conditional expand with rent amount, metro/non-metro city picker, HRA sub-questions
  - Note shown about Bengaluru/Pune/Hyderabad being non-metro
  - Full HRA exemption formula (3-prong min) wired to engine
  - 80GG path for users who pay rent but don't receive HRA
- **Step 5 — PF:**
  - Yes/No toggle
  - Auto-calculated estimate (`min(basic × 12%, 1800)/month`), editable
  - Wired to 80C bucket (old regime only)
- **Step 6 — 80C Investments:**
  - Yes/No toggle
  - Single "other 80C" amount field (separate from PF already captured)
  - Combined 80C cap (EPF + other ≤ ₹1.5L) with soft-cap notice
- **Step 7 — Health Insurance:**
  - Yes/No toggle
  - Self/family premium + parents premium (separate fields)
  - "Are your parents senior citizens?" sub-question (affects ₹25K vs ₹50K limit)
  - Correct 80D caps applied per age group
- **Step 8 — NPS:**
  - Employer NPS (80CCD(2)) — available in both regimes
  - Personal NPS 80CCD(1B) — old regime only, max ₹50K
  - "Use 10% of basic" convenience checkbox for employer NPS

**What you can do at the end:**
Complete steps 1–8. The live preview shows a much more accurate tax estimate — you can see a meaningful difference between the two regimes as you add deductions.

**Deferred:** Steps 9–12 and the results page.

---

## Phase 5 — Steps 9–12, Results Page & URL Sharing

**Goal:** Complete the full end-to-end flow. You can finish the wizard and land on a detailed results page with a shareable URL.

**What gets built:**
- **Step 9 — Home Loan:** Interest amount (yearly), capped at ₹2L for old regime. Section 24(b) note shown.
- **Step 10 — Other Income:** Savings account interest (80TTA/80TTB) + FD interest (fully taxable in both regimes)
- **Step 11 — Professional Tax:** Yes/No, pre-filled ₹2,400 default
- **Step 12 — Review Screen:** Clean summary of all entered values with "Edit" links that jump back to that step. "Calculate My Tax →" CTA.
- **`/results` route** — 5 sections:
  - **Section 1 — Verdict:** Large card showing recommended regime, savings amount, both total taxes. Caution note if difference ≤ ₹5,000.
  - **Section 2 — Comparison Table:** Side-by-side of every deduction line item, with "not allowed" items greyed out in new regime column
  - **Section 3 — Slab Breakdown:** Two parallel tables (one per regime) showing income in each slab, rate, and tax per slab
  - **Section 4 — Plain-language explanation:** Bulleted narrative explaining what drove the result (personalised from user inputs)
  - **Sticky action bar:** "Copy Summary" (clipboard) + "Recalculate" (resets and routes back to `/calculator`)
- **URL serialization:** `inputs` serialized to Base64 JSON → `/results?d=...`. Page hydrates correctly from URL on load/share.

**What you can do at the end:**
Run through the complete wizard, hit "Calculate My Tax", and see a full results page. Copy the URL and paste it in a new tab — the result reloads correctly. Verify the numbers match a manual calculation or the Appendix G example.

**Deferred:** Personalised suggestions, animations, mobile-specific layout polish, edge case hardening.

---

## Phase 6 — Suggestions, Mobile & Polish

**Goal:** The app is production-quality — smooth on mobile, all edge cases handled, suggestions personalised.

**What gets built:**
- **Personalised Suggestions Engine** (Section 13 — all 8 rules):
  - Computes marginal rate, calculates exact ₹ savings per suggestion
  - Renders as `<SuggestionCard />` components below the plain-language explanation
  - "New Regime is now the default" card always shown when new regime is recommended
- **Mobile layout:**
  - Floating "📊 Preview" button (bottom-right) opens preview as a bottom sheet
  - Wizard card scrolls input into view when mobile keyboard appears
  - Results page sections reflow correctly at narrow widths
- **Animations:**
  - Step transitions: slide + fade (200ms ease-out)
  - Number counter animation in LivePreviewPanel (300ms on value change)
  - FAQ accordion: smooth height transition (180ms)
  - Progress bar pulse on current step
  - Winner card glow transition
- **Edge cases from Section 12:**
  - `sessionStorage` save + "Continue where you left off?" on refresh
  - Surcharge warning for income > ₹50L
  - Decimal input → round to nearest rupee
  - Safari clipboard fallback for Copy button
  - All silent caps (80C, NPS, home loan) with inline notices
- **Validation errors:** All field-level and cross-field messages from Section 7, using the friendly copy from Section 11
- **Final design pass:** Verify every screen matches the design system (spacing, shadows, border radius, typography scale)

**What you can do at the end:**
Use the app on a phone. Refresh mid-wizard and continue. Enter edge-case inputs (very high income, skipped fields, no deductions). Copy the result summary. The app is shippable.

---

## Sequence Summary

| Phase | Runnable Artifact | Core Dependency |
|-------|-------------------|-----------------|
| 1 | Landing page | None |
| 2 | `/verify` page with worked example | Phase 1 (project scaffold) |
| 3 | Steps 1–3 + live preview | Phase 2 (engine) |
| 4 | Steps 1–8 + accurate live preview | Phase 3 (wizard shell) |
| 5 | Full wizard + results page + shareable URL | Phase 4 (all deductions) |
| 6 | Polished, mobile-ready app | Phase 5 (full flow) |

Each phase is a hard gate: don't start Phase N+1 until Phase N runs cleanly in the browser.
