# Product Requirements Document
## Indian Salary Tax Regime Comparator — FY 2025-26
**Version:** 1.0  
**Stack:** Next.js (App Router) + React + TypeScript  
**Privacy:** 100% client-side computation. No data leaves the browser. No analytics on user inputs.  
**Audience:** Salaried individuals in India, age 21–60+, across all income levels.

---

## Table of Contents

1. [Product Vision](#1-product-vision)  
2. [User Problem & Design Philosophy](#2-user-problem--design-philosophy)  
3. [Information Architecture](#3-information-architecture)  
4. [Screen-by-Screen Specification](#4-screen-by-screen-specification)  
   - 4.1 Landing Page  
   - 4.2 Wizard — Step-by-Step Flow  
   - 4.3 Live Preview Panel  
   - 4.4 Results Page  
5. [Complete Wizard Step Specification](#5-complete-wizard-step-specification)  
6. [Tax Calculation Engine — Complete Logic](#6-tax-calculation-engine--complete-logic)  
7. [Validation Rules](#7-validation-rules)  
8. [State Management Architecture](#8-state-management-architecture)  
9. [Component Library](#9-component-library)  
10. [Design System](#10-design-system)  
11. [Copy & Tone Guidelines](#11-copy--tone-guidelines)  
12. [Edge Cases & Error Handling](#12-edge-cases--error-handling)  
13. [Personalised Suggestions Engine](#13-personalised-suggestions-engine)  
14. [Non-Goals](#14-non-goals)  
15. [Appendix — Tax Reference Tables](#15-appendix--tax-reference-tables)

---

## 1. Product Vision

**One-line summary:** A wizard-based, mobile-friendly web app that tells any salaried Indian in under 3 minutes which tax regime saves them more money in FY 2025-26 — and by exactly how much.

**Core promise to the user:** You don't need to know what "CTC" or "80C" means. Answer in plain English. We do the math.

**The result in one sentence:** *"Switch to the New Regime. You save ₹18,400 this year."* — with a full, slab-by-slab breakdown to back it up.

---

## 2. User Problem & Design Philosophy

### The Problem
Crores of salaried Indians lose money every year simply because they don't know which tax regime to choose. Existing calculators fail them because they:
- Ask for "gross salary" or "CTC" — numbers most employees don't know
- Dump 20 fields on one screen
- Show a raw number with no explanation
- Use finance jargon like "Chapter VI-A deductions"

### Design Principles

| Principle | Implementation |
|-----------|---------------|
| **One question at a time** | Wizard: one card, one question, one input per screen |
| **Plain language only** | "How much rent do you pay per month?" not "Enter HRA details" |
| **Live feedback** | Right panel updates the tax estimate on every keystroke |
| **Progressive disclosure** | FAQs only shown when user pauses or taps "?" icon |
| **No dead ends** | Every step has a "Skip — I'm not sure" option that applies a safe default |
| **Privacy-first** | No form submission, no network call with user data, no localStorage |
| **Mobile-first** | Wizard and live panel stack vertically on mobile |

### Skip Logic
Every non-mandatory question offers a "Skip — I'll estimate this" link. Skipping applies a zero or a conservative default (documented per question below). This is shown to the user: *"Using default: ₹0 for this item."*

---

## 3. Information Architecture

```
/ (Landing Page)
  └── /calculator  (Wizard + Live Preview, single-page)
        └── /results  (Results Page, state passed via React context / URL params)
```

All three routes are within the same Next.js app. The `/results` route must be bookmarkable — serialize the full input state into URL search params (base64-encoded JSON) so users can share a result link.

---

## 4. Screen-by-Screen Specification

### 4.1 Landing Page (`/`)

**Layout:** Full viewport, dark-to-light gradient background. No blank white space.

**Sections (top to bottom):**

#### Hero Section
- **Headline (H1):** "Find out which tax regime saves you more money."
- **Sub-headline:** "Old Regime or New Regime? Answer 8 simple questions. Get your answer in 2 minutes. No jargon. No CA required."
- **CTA Button (primary, large):** "Calculate My Tax →"  
  → Routes to `/calculator`
- **Trust signals row (icon + text, 3 items horizontal):**
  - 🔒 "100% Private — nothing leaves your device"
  - ✓ "Updated for FY 2025-26"
  - ⚡ "Results in under 2 minutes"

#### Results Preview Section
- **Heading:** "Here's what your result will look like"
- Show a **static mock result card** (not interactive) demonstrating what the final output looks like. Include:
  - A "recommended regime" badge with ₹ savings amount
  - A two-column comparison table (old vs new) with blurred/dummy numbers
  - A "Why this recommendation?" section with a few bullet points (blurred)
- **Caption below preview:** "Your real result will be based on your actual numbers."
- **CTA Button (secondary):** "Get My Actual Result →"

#### How It Works Section
Three steps with icons:
1. **Answer simple questions** — "We ask about your salary, rent, and a few investments. No finance degree needed."
2. **Watch the math update live** — "See your tax estimate change in real time as you answer."
3. **Get your recommendation** — "A clear verdict, slab-by-slab breakdown, and personalised tips."

#### Footer
- "Built for Indian salaried taxpayers. FY 2025-26 (AY 2026-27)."
- "Not financial advice. Please verify with a CA for complex situations."
- Small links: Methodology | Privacy

---

### 4.2 Wizard (`/calculator`)

**Layout (Desktop — ≥1024px):**
```
┌─────────────────────────┬───────────────────────────┐
│                         │                           │
│   Progress Bar          │   Live Preview Panel      │
│   ─────────────────     │   (sticky, updates live)  │
│                         │                           │
│   Question Card         │   ┌─ Old Regime ─┐        │
│   (one question)        │   │ ₹XX,XXX      │        │
│                         │   └──────────────┘        │
│   [ Input / Options ]   │   ┌─ New Regime ─┐        │
│                         │   │ ₹XX,XXX      │        │
│   [ FAQ accordion ]     │   └──────────────┘        │
│                         │   Slab table below        │
│   [ Back ] [ Next → ]   │                           │
└─────────────────────────┴───────────────────────────┘
```

**Layout (Mobile — <1024px):**
- Progress bar at top
- Question card full width
- "Preview" floating button at bottom right (opens preview as bottom sheet / modal)
- Back / Next navigation

**Progress Bar:**
- Segmented dots (one per step) or thin bar
- Show: "Step 3 of 8" label below
- Steps completed = filled/colored, current = animated pulse, future = grey

---

### 4.3 Live Preview Panel

This panel is always visible on desktop (right column, sticky). On mobile it is accessible via a floating "📊 Preview" button.

**Panel Sections:**

#### Regime Cards (always visible)
Two cards side by side:
```
┌──────────────────┐  ┌──────────────────┐
│  🏛 OLD REGIME  │  │  ✨ NEW REGIME  │
│                  │  │                  │
│  Tax: ₹1,24,800 │  │  Tax: ₹78,000   │
│  + Cess: ₹4,992 │  │  + Cess: ₹3,120 │
│  ──────────────  │  │  ──────────────  │
│  Total: ₹1,29,792│  │  Total: ₹81,120 │
└──────────────────┘  └──────────────────┘
```
- Winner card has a subtle green border/glow
- Loser card has no special highlight
- Tax values animate smoothly when they change (CSS transition on the number, or use a counter animation library)

#### Income Summary (collapsible)
Shows a running tally of what the user has entered:
- Gross Salary: ₹XX
- Deductions so far: -₹XX
- Taxable Income (Old): ₹XX
- Taxable Income (New): ₹XX

#### Slab-by-Slab Breakdown Table (collapsible by default, expanding as more steps completed)
A mini table showing both regimes' slab calculations. Updates live.

```
Slab               Old Regime    New Regime
₹0–₂.5L           ₹0            ₹0
₹2.5L–₄L          ₹7,500        ₹0
₹4L–₅L            ₹5,000        ₹5,000
...
```

#### Recommendation Banner (appears only after all steps complete)
```
✅ Pick NEW REGIME — You save ₹48,672/year
```

---

### 4.4 Results Page (`/results`)

Full-page, structured into 5 sections:

#### Section 1 — Verdict
```
┌──────────────────────────────────────────┐
│  ✅ Pick the NEW TAX REGIME              │
│  You save ₹48,672 this year.             │
│                                          │
│  Old Regime Tax: ₹1,29,792              │
│  New Regime Tax: ₹81,120               │
│  Difference: ₹48,672 in your favour     │
└──────────────────────────────────────────┘
```
- Large, prominent, impossible to miss
- Show both final tax amounts (including cess) clearly
- If the difference is ≤ ₹5,000 show a caution note: "The difference is small. If you have a CA, confirm before filing."

#### Section 2 — Side-by-Side Detailed Comparison Table

| Item | Old Regime | New Regime |
|------|-----------|-----------|
| Gross Salary | ₹X | ₹X |
| Standard Deduction | −₹50,000 | −₹75,000 |
| HRA Exemption | −₹X | ₹0 (not allowed) |
| 80C Investments | −₹X | ₹0 (not allowed) |
| 80D Health Insurance | −₹X | ₹0 (not allowed) |
| NPS (Employee - 80CCD1B) | −₹X | ₹0 (not allowed) |
| Employer NPS (80CCD2) | −₹X | −₹X (allowed) |
| Home Loan Interest (24b) | −₹X | ₹0 (not allowed) |
| Professional Tax | −₹X | −₹X |
| Other Deductions | −₹X | ₹0 |
| **Taxable Income** | **₹X** | **₹X** |
| Tax on slabs | ₹X | ₹X |
| Rebate (87A) | −₹X | −₹X |
| Net Tax | ₹X | ₹X |
| Health & Education Cess (4%) | ₹X | ₹X |
| **Total Tax Payable** | **₹X** | **₹X** |

- "Not allowed" items in new regime shown in muted grey with a small tooltip explaining why.
- Cells for zero-valued items are shown as "₹0" not blank.

#### Section 3 — Slab-by-Slab Breakdown (Both Regimes)

Two parallel tables, one for each regime. Show every slab with:
- Slab range
- Amount of income falling in that slab
- Tax rate
- Tax for that slab

At the bottom: Total → Rebate → Net Tax → +4% Cess → **Total Tax**

#### Section 4 — Plain-Language Explanation ("What drove your result")
A bulleted, personalised narrative explaining why one regime is better. Generated from the user's input. Examples:

- "Your HRA exemption of ₹72,000 is only available in the Old Regime — that alone saved you ₹21,600 in taxes."
- "Your 80C investments of ₹1,50,000 reduce your taxable income by ₹1.5L in the Old Regime."
- "Even with your deductions, the New Regime's lower slab rates still win. Your deductions would need to exceed ₹3.8L to flip the result."
- "Since you don't pay rent and haven't maxed 80C, the New Regime's lower slab rates give you a clean win."

#### Section 5 — Personalised Suggestions
See Section 13 for the full suggestion engine spec.

#### Action Bar (bottom, sticky on scroll)
- Button 1: "Copy Summary" — copies a text-only summary to clipboard
- Button 2: "Recalculate" — resets wizard and routes back to `/calculator`

---

## 5. Complete Wizard Step Specification

Each step spec includes:
- **Question text** (exactly as shown to user)
- **Input type**
- **FAQ items** (shown in collapsible accordion below the question)
- **Skip behavior** (what value is used if skipped)
- **Validation**
- **Conditional display** (whether this step shows at all)
- **State key** for the data store

---

### STEP 1 — Age Group

**Question:** "How old are you?"

**Why we ask:** Tax slabs in the Old Regime differ by age. The New Regime uses the same slabs for everyone.

**Input type:** Button selection (3 options, full-width cards)

| Option | Label | Sub-label |
|--------|-------|-----------|
| A | Under 60 | Most working professionals |
| B | 60 to 79 | Senior citizen |
| C | 80 or above | Super senior citizen |

**Skip:** Not allowed. Age is mandatory (low friction — 3 clear options).

**State key:** `ageGroup` → `"below60" | "senior" | "superSenior"`

**FAQ:**
- *Why does age matter for taxes?* — The Old Tax Regime gives senior citizens (60+) and super seniors (80+) a higher exemption limit, so they pay less. The New Regime has the same slabs for everyone.

---

### STEP 2 — Salary

**Question:** "What does your company pay you before any deductions?"

**Sub-label:** "This is the 'Gross Salary' figure on your payslip — before PF, professional tax, or income tax are taken out. It's usually the biggest number on your salary slip."

**Input type:** Number input, ₹ prefix, with toggle: "Monthly / Yearly"

- Default: Monthly
- Placeholder: "e.g. 75,000"
- Converts to annual internally: `annualGross = monthlyInput × 12` if monthly selected
- Format: Indian comma format (1,00,000)

**Skip:** Not allowed. Salary is mandatory. No default makes sense.

**Validation:**
- Min: ₹1,000/month (₹12,000/year)
- Max: ₹5,00,00,000/year (₹5 crore) — above this, surcharge rules apply which are out of scope; show a message: "For very high incomes with surcharge, consult a CA."
- Must be a positive number

**State key:** `annualGross`

**FAQ:**
- *What if my salary varies month to month?* — Enter your average monthly salary, or your total expected annual salary.
- *Is gross salary the same as CTC?* — No. CTC (Cost to Company) includes employer PF and other components. Gross salary is what appears as total salary on your payslip before deductions. Use the payslip number, not your offer letter CTC.
- *What if I have a bonus?* — Include your expected annual bonus in the yearly figure. Bonuses are fully taxable as salary income.
- *Where do I find this number?* — Look at the very first line of your monthly salary slip — "Gross Earnings" or "Total Earnings". That's the number.

---

### STEP 3 — Basic Salary (for HRA & PF Calculations)

**Question:** "What is your Basic Salary per month?"

**Sub-label:** "Your payslip lists several components — Basic, HRA, Special Allowance, etc. We just need the 'Basic' amount. It's usually 40–60% of your gross."

**Input type:** Number input, ₹ prefix, monthly

**Skip:** Yes — "Skip, I'm not sure" → defaults to `annualGross × 0.40 / 12` (40% of gross as basic, conservative estimate). Show: *"Using estimate: 40% of your salary as Basic."*

**Validation:**
- Must be > 0
- Must be ≤ annualGross / 12 (basic can't exceed gross)
- Soft warning if basic > 60% of gross: "That's unusually high — please double-check your payslip."

**State key:** `monthlyBasic`

**Note for developer:** `annualBasic = monthlyBasic × 12`. This is used in:
- HRA calculation (% of basic)
- EPF employee contribution (12% of basic, capped at ₹1,800/month)
- EPF employer contribution (same, affects 80CCD2 if employer has NPS)

**FAQ:**
- *Where is Basic Salary on my payslip?* — It's listed as "Basic Pay" or just "Basic" in the "Earnings" section of your salary slip.
- *Why do you need basic separately?* — Some tax benefits (like HRA and PF contributions) are calculated as a percentage of your basic salary, not your total salary.

---

### STEP 4 — Rent

**Question:** "Do you live in a rented home?"

**Input type:** Yes / No toggle buttons

If **Yes** → show sub-questions (same card expands):

**4a.** "How much rent do you pay per month?"  
- Number input, ₹ prefix  
- Placeholder: "e.g. 20,000"  
- Skip: "Skip" → ₹0 (no HRA exemption claimed)

**4b.** "Which city do you live in?"  
- Button selection:
  - "Delhi, Mumbai, Kolkata, or Chennai" → `metro = true`
  - "Any other city" → `metro = false`
- Note shown: *"This affects your HRA calculation. Bengaluru, Pune, Hyderabad, and Ahmedabad are treated as non-metro for HRA under old rules."*

**4c.** "Does your salary include an HRA component?"  
- Yes / No  
- If No → user doesn't receive HRA from employer; HRA exemption under 10(13A) is not available; instead ask about 80GG (Section 5's FAQ explains this)  
- If Yes → show: "What is your monthly HRA amount?" (number input; skip = 40% of monthly basic as estimate)

If **No** → skip HRA entirely. `monthlyRent = 0`, `monthlyHRA = 0`.

**State keys:** `paysRent`, `monthlyRent`, `isMetro`, `receivesHRA`, `monthlyHRA`

**FAQ:**
- *What if I live in my own house?* — Select "No". You won't get HRA exemption, but you may qualify for home loan benefits instead.
- *What if I pay rent to my parents?* — That counts! You can claim HRA exemption if you have a proper rent agreement and bank transfer proof.
- *I don't get HRA in my salary — can I still claim anything?* — Yes. Under Section 80GG, people without HRA can claim rent deductions up to ₹60,000/year if they meet certain conditions. We'll account for this.

---

### STEP 5 — PF (Provident Fund)

**Question:** "Does your employer deduct Provident Fund (PF) from your salary?"

**Sub-label:** "PF is deducted every month — usually 12% of your Basic Salary, up to ₹1,800/month. Check your payslip for a 'PF' or 'EPF' deduction."

**Input type:** Yes / No toggle  
If **Yes** → Show: "Your estimated PF deduction is ₹X/month" (calculated as `min(monthlyBasic × 12%, 1800)`, editable if user wants to override)  
If **No** → `epfEmployee = 0`

**State keys:** `hasEPF`, `monthlyEPF` (employee share; max ₹1,800/month = ₹21,600/year)

**Note:** EPF employee contribution is included in the ₹1.5L 80C bucket (old regime only). EPF employer contribution is NOT a deduction for the employee — it is the employer's cost and does not appear in the employee's tax calculation. Do not include employer PF in 80C.

**FAQ:**
- *Where do I find if I have PF?* — Check your payslip for "EPF" or "PF" in the deductions section.
- *My company doesn't deduct PF — is that legal?* — For companies with fewer than 20 employees, PF is optional. Some startups and contractors may not deduct it.
- *What if I contribute more than the minimum?* — Enter your actual monthly PF deduction. Only the first ₹1.5L/year (combined across all 80C investments) is tax-deductible.

---

### STEP 6 — Investments (80C)

**Question:** "Do you invest money to save taxes?"

**Sub-label:** "Things like PPF, ELSS mutual funds, LIC premiums, kids' school fees, or home loan EMI principal. These are 80C investments."

**Input type:** Yes / No  
If **Yes** → expand with sub-questions:

**6a.** "Total 80C investments per year (excluding PF we already counted)"  
- Number input, ₹ prefix, yearly  
- Placeholder: "e.g. 50,000"  
- Helper text: "Common examples: PPF deposits, ELSS (tax-saver mutual funds), LIC premiums, home loan principal, children's tuition fees. Max benefit: ₹1.5L/year."  
- Skip → ₹0  
- Max validation: ₹1,50,000 (cap is ₹1.5L in 80C; PF already included separately)

**State keys:** `otherEightyC` (in addition to EPF which is already captured)

**Note for developer:** `total80C = min(epfAnnual + otherEightyC, 150000)`. The PF employee contribution + other 80C cannot exceed ₹1.5L combined.

**FAQ:**
- *Does my PF already count as 80C?* — Yes! We already included your PF contribution above. Just enter any additional investments here.
- *What is ELSS?* — ELSS (Equity Linked Savings Scheme) is a type of mutual fund with a 3-year lock-in period that qualifies for 80C deduction.
- *What is the maximum benefit?* — ₹1.5L per year. Even if you invest more, the tax deduction is capped at ₹1.5L.
- *Home loan principal repayment?* — Yes, the principal portion of your EMI counts under 80C. Don't include the interest part here — that's a separate question.

---

### STEP 7 — Health Insurance

**Question:** "Do you pay for health insurance?"

**Sub-label:** "A health insurance premium paid for yourself, your spouse, kids, or parents — by cheque, UPI, or bank transfer (not cash)."

**Input type:** Yes / No  
If **Yes** → expand:

**7a.** "How much do you pay per year for your own family's health insurance?"  
- Number input, yearly  
- Helper: "For yourself, spouse, children"  
- Max: ₹25,000 (or ₹50,000 if age ≥ 60)  
- Skip → ₹0  

**7b.** "Do you also pay for your parents' health insurance?"  
- Yes / No  
- If Yes → "How much per year?" (number input)  
- Helper: "Separate from your own policy"  
- Max: ₹25,000 (or ₹50,000 if parents are senior citizens)  
- Skip → ₹0  
- "Are your parents senior citizens (60+)?" — Yes / No (determines limit)

**State keys:** `selfHealthInsurance`, `parentsHealthInsurance`, `parentsSenior`

**80D Limits (reference):**
- Self/family (non-senior): up to ₹25,000
- Self/family (self is senior): up to ₹50,000
- Parents (non-senior): up to ₹25,000
- Parents (senior): up to ₹50,000
- Total maximum 80D: ₹1,00,000 (if taxpayer is senior + parents senior)

**FAQ:**
- *Does my company's group insurance count?* — Not directly. Group insurance premiums deducted from your salary may qualify, but only if you can show proof of payment. If you're unsure, enter ₹0.
- *Why not cash payments?* — Tax law disallows 80D deduction for cash payments (except for preventive health check-ups).
- *What about preventive health check-ups?* — Up to ₹5,000 included in the 80D limit for check-ups (even if paid in cash). This is already baked into the limit.

---

### STEP 8 — NPS (National Pension System)

**Question:** "Do you invest in NPS (National Pension System)?"

**Sub-label:** "NPS is a government retirement savings scheme. It's separate from PF. Many employers offer it, or you can invest personally."

**Input type:** Yes / No  
If **Yes** → expand:

**8a.** "Does your employer contribute to your NPS account?"  
- Yes / No  
- If Yes → "How much does your employer contribute per month?" (number input) or "I don't know the exact amount — use 10% of my basic" (checkbox)  
- State key: `employerNPS` (annual)

**8b.** "Do you also make personal NPS contributions?" (the additional 80CCD(1B) investment)  
- Yes / No  
- If Yes → "How much per year?" (number input, max ₹50,000)  
- State key: `selfNPS1B` (annual, max ₹50,000)

**Skip:** Skip all → `employerNPS = 0`, `selfNPS1B = 0`

**FAQ:**
- *What's the difference between employer NPS and my own NPS?* — Employer NPS (80CCD(2)) is deductible under BOTH old and new regimes — up to 14% of your basic salary. Your own NPS contribution (80CCD(1B)) saves an extra ₹50,000 tax deduction, but ONLY in the old regime.
- *How do I know if my employer contributes to NPS?* — Check your payslip or offer letter. It will say "NPS Contribution" or "NPS" as an employer benefit.

---

### STEP 9 — Home Loan

**Question:** "Do you have a home loan on a property you live in?"

**Sub-label:** "If you own a house and have a home loan on it, the interest you pay can reduce your taxes under the Old Regime."

**Input type:** Yes / No  
If **Yes** → expand:

**9a.** "How much home loan interest did you pay last year?"  
- Number input, yearly  
- Helper: "Look at your loan statement for 'Interest paid in FY 2025-26'. It's different from the EMI amount."  
- Max deduction: ₹2,00,000 for self-occupied property (applied as cap)  
- Skip → ₹0

**Important note for developer:** This is Section 24(b) for self-occupied property. Max ₹2L deduction in old regime. NOT available in new regime for self-occupied property. Do not ask about let-out property (rental income — out of scope).

**State keys:** `homeLoanInterest` (will be capped at ₹2L in old regime calculation)

**FAQ:**
- *Is this the full EMI amount?* — No. Your EMI has two parts: principal repayment (goes into 80C) and interest. Only the interest portion goes here. Your bank or loan statement will show this breakdown.
- *What if the loan is on a second home I've rented out?* — This calculator only handles a home you live in. For rental property, consult a CA.
- *I have a home loan but I also pay rent (I work in a different city)* — You can claim both HRA and home loan interest in that case. Enter both and we'll calculate both.

---

### STEP 10 — Other Income

**Question:** "Do you earn any other income outside your salary?"

**Sub-label:** "Like interest from savings accounts, FDs, or a small side income. (We're not covering freelance, rental property, or stock market gains here.)"

**Input type:** Yes / No  
If **Yes** → expand with two sub-fields:

**10a.** "Interest from savings accounts per year"  
- Number input (optional, skip → 0)  
- Helper: "This earns interest that's taxable. First ₹10,000 is deductible under 80TTA (₹50,000 for seniors under 80TTB)."

**10b.** "Interest from Fixed Deposits (FDs) per year"  
- Number input (optional, skip → 0)  
- Note: FD interest is fully taxable — no deduction available.

**State keys:** `savingsInterest`, `fdInterest`

**Note for developer:**
- 80TTA (below 60): deduction = min(savingsInterest, 10000). Old regime only.
- 80TTB (60+): deduction = min(savingsInterest + fdInterest, 50000). Old regime only. If user is senior/super senior, use 80TTB instead of 80TTA (80TTB covers both savings + FD interest).
- New regime: no 80TTA/80TTB. All interest income is fully taxable.

**FAQ:**
- *Where do I find my savings account interest?* — Your bank sends an annual interest statement. You can also check it in Form 26AS or AIS on the income tax portal.
- *What about dividends or stock profits?* — Those involve special rules (capital gains). This calculator focuses on salary income only. Please consult a CA for those.

---

### STEP 11 — Professional Tax

**Question:** "Does your employer deduct Professional Tax from your salary?"

**Sub-label:** "Professional Tax is a small monthly deduction by your state government — usually ₹200/month. Not all states have it."

**Input type:** Yes / No  
If **Yes** → "How much is deducted per year?" (number input, pre-filled with ₹2,400 as default)  
If **No** → `professionalTax = 0`

**State keys:** `professionalTax` (annual amount)

**Note for developer:** Professional Tax is deductible under Section 16(iii) of the Income Tax Act in BOTH old and new regimes (it's a salary-head deduction, not Chapter VI-A). It reduces gross salary before slab calculation.

**FAQ:**
- *How do I know if it's deducted?* — Check your payslip. It's usually called "Prof Tax" or "PT" in the deductions column.
- *It's ₹200/month in my state — what do I enter?* — Enter ₹2,400 (12 months × ₹200).

---

### STEP 12 — Confirmation & Review

**Not a question — a summary screen.**

**Heading:** "Here's everything you've told us."

Show a clean list of all entered values with an "Edit" link next to each category (routes back to that step).

```
Salary & Basic
  Annual Gross Salary: ₹9,00,000    [Edit]
  Monthly Basic: ₹37,500

Housing
  Monthly Rent: ₹20,000 (Metro)     [Edit]
  Monthly HRA: ₹18,000

Investments & Deductions
  PF (Annual): ₹21,600              [Edit]
  Other 80C: ₹50,000
  Health Insurance: ₹15,000
  NPS (Personal): ₹50,000
  Home Loan Interest: ₹0

Other Income
  Savings Interest: ₹5,000          [Edit]
  FD Interest: ₹0

Other
  Professional Tax: ₹2,400          [Edit]
```

**CTA:** "Calculate My Tax →" (large primary button) → routes to `/results`

---

## 6. Tax Calculation Engine — Complete Logic

This section is the canonical specification for all tax calculations. Implement this as a pure TypeScript function: `calculateTax(inputs: TaxInputs): TaxResult`.

### 6.1 Input Type Definition

```typescript
interface TaxInputs {
  ageGroup: 'below60' | 'senior' | 'superSenior';  // Step 1
  annualGross: number;          // Step 2 (already annual)
  monthlyBasic: number;         // Step 3
  paysRent: boolean;            // Step 4
  monthlyRent: number;          // Step 4a
  isMetro: boolean;             // Step 4b
  receivesHRA: boolean;         // Step 4c
  monthlyHRA: number;           // Step 4c sub-question
  hasEPF: boolean;              // Step 5
  monthlyEPF: number;           // Step 5 (employee share, max ₹1800)
  otherEightyC: number;         // Step 6 (excluding EPF)
  selfHealthInsurance: number;  // Step 7a (annual)
  parentsHealthInsurance: number; // Step 7b (annual)
  parentsSenior: boolean;       // Step 7b sub
  employerNPS: number;          // Step 8a (annual)
  selfNPS1B: number;            // Step 8b (annual, max ₹50,000)
  homeLoanInterest: number;     // Step 9 (annual, old regime only)
  savingsInterest: number;      // Step 10a (annual)
  fdInterest: number;           // Step 10b (annual)
  professionalTax: number;      // Step 11 (annual)
}
```

### 6.2 Derived / Computed Values

```typescript
const annualBasic = monthlyBasic * 12;
const annualHRA = monthlyHRA * 12;
const annualRent = monthlyRent * 12;
const epfAnnual = Math.min(monthlyEPF * 12, 21600);  // Cap at ₹21,600/year
```

### 6.3 Common Deductions (Both Regimes)

```typescript
// Professional Tax — Section 16(iii) — deducted from gross salary in BOTH regimes
// Applied before any regime-specific computation
const profTaxDeduction = professionalTax;  // Already annual
```

### 6.4 New Regime Calculation

```typescript
function calculateNewRegime(inputs): RegimeResult {

  // --- Step 1: Gross Salary ---
  let grossSalary = annualGross;

  // --- Step 2: Section 16 Deductions (allowed in new regime) ---
  const standardDeduction = 75000;
  const profTax = professionalTax;

  // --- Step 3: Employer NPS (80CCD(2)) — ALLOWED in new regime ---
  // Limit: 14% of basic + DA (for private sector from FY 2025-26)
  // DA assumed = 0 for private sector (unless user explicitly mentions it — out of scope)
  const employerNPSDeduction = Math.min(employerNPS, annualBasic * 0.14);

  // --- Step 4: Taxable Salary (new regime) ---
  // Note: In new regime, employer NPS is deducted AFTER standard deduction
  const taxableSalary_new = Math.max(
    0,
    grossSalary - standardDeduction - profTax - employerNPSDeduction
  );

  // --- Step 5: Other income (interest) — added to taxable income ---
  // In new regime, NO 80TTA/80TTB available
  const otherTaxableIncome = savingsInterest + fdInterest;

  // --- Step 6: Total Taxable Income ---
  const totalTaxableIncome = taxableSalary_new + otherTaxableIncome;

  // --- Step 7: Apply New Regime Slabs ---
  const taxBeforeRebate = applyNewRegimeSlabs(totalTaxableIncome);

  // --- Step 8: Section 87A Rebate ---
  // New regime: rebate up to ₹60,000 if taxable income ≤ ₹12,00,000
  let rebate = 0;
  if (totalTaxableIncome <= 1200000) {
    rebate = Math.min(taxBeforeRebate, 60000);
  } else {
    // Check marginal relief for incomes between ₹12L and ₹12.75L (taxable)
    rebate = calculateMarginalRelief_NewRegime(totalTaxableIncome, taxBeforeRebate);
  }

  // --- Step 9: Net Tax ---
  const netTax = Math.max(0, taxBeforeRebate - rebate);

  // --- Step 10: Health & Education Cess ---
  const cess = Math.round(netTax * 0.04);

  // --- Step 11: Total Tax ---
  const totalTax = netTax + cess;

  return { taxableSalary: taxableSalary_new, totalTaxableIncome, taxBeforeRebate, rebate, netTax, cess, totalTax, deductions: { standardDeduction, profTax, employerNPSDeduction } };
}
```

#### New Regime Slab Function

```typescript
function applyNewRegimeSlabs(income: number): number {
  // FY 2025-26 New Regime Slabs (same for ALL age groups)
  // ₹0       – ₹4,00,000    → 0%
  // ₹4,00,001 – ₹8,00,000   → 5%
  // ₹8,00,001 – ₹12,00,000  → 10%
  // ₹12,00,001 – ₹16,00,000 → 15%
  // ₹16,00,001 – ₹20,00,000 → 20%
  // ₹20,00,001 – ₹24,00,000 → 25%
  // Above ₹24,00,000         → 30%

  const slabs = [
    { limit: 400000,  rate: 0 },
    { limit: 800000,  rate: 0.05 },
    { limit: 1200000, rate: 0.10 },
    { limit: 1600000, rate: 0.15 },
    { limit: 2000000, rate: 0.20 },
    { limit: 2400000, rate: 0.25 },
    { limit: Infinity, rate: 0.30 },
  ];

  return computeTaxFromSlabs(income, slabs);
}
```

#### Marginal Relief Calculation (New Regime)

```typescript
function calculateMarginalRelief_NewRegime(income: number, taxBeforeRebate: number): number {
  // Marginal relief applies when: 12,00,000 < income <= 12,75,000
  // Rule: Tax payable shall not exceed (income - 12,00,000)
  // i.e., rebate = max(0, taxBeforeRebate - (income - 12,00,000))
  if (income > 1200000 && income <= 1275000) {
    const excessIncome = income - 1200000;
    if (taxBeforeRebate > excessIncome) {
      return taxBeforeRebate - excessIncome;  // This is the rebate amount
    }
  }
  return 0;  // No marginal relief above ₹12.75L or at/below ₹12L
}
```

---

### 6.5 Old Regime Calculation

```typescript
function calculateOldRegime(inputs): RegimeResult {

  // --- Step 1: Gross Salary ---
  let grossSalary = annualGross;

  // --- Step 2: Section 16 Deductions ---
  const standardDeduction = 50000;
  const profTax = professionalTax;

  // --- Step 3: HRA Exemption (Section 10(13A)) ---
  let hraExemption = 0;
  if (paysRent && receivesHRA && annualRent > 0 && annualHRA > 0) {
    // Three-pronged formula — MINIMUM of all three
    const a = annualHRA;                                            // Actual HRA received
    const b = annualRent - (annualBasic * 0.10);                   // Rent paid minus 10% of basic+DA
    const c = annualBasic * (isMetro ? 0.50 : 0.40);               // 50% metro / 40% non-metro of basic+DA
    hraExemption = Math.max(0, Math.min(a, b, c));                 // Can't be negative
  } else if (paysRent && !receivesHRA && annualRent > 0) {
    // 80GG for those who pay rent but don't receive HRA
    // Conditions: Must not own a house; deduction = min of:
    //   (a) ₹5,000/month (₹60,000/year)
    //   (b) 25% of total income (computed iteratively — approximate as 25% of gross for now)
    //   (c) Annual rent - 10% of total income
    // Note: 80GG is a Chapter VI-A deduction, not a Section 16 deduction
    // It goes into deductions below, not here
    hraExemption = 0;  // Will handle 80GG in deductions section
  }

  // --- Step 4: Employer NPS 80CCD(2) — ALSO allowed in old regime ---
  const employerNPSDeduction = Math.min(employerNPS, annualBasic * 0.14);

  // --- Step 5: Net Salary (after Section 16 + HRA + Employer NPS) ---
  const netSalary = Math.max(
    0,
    grossSalary - standardDeduction - profTax - hraExemption - employerNPSDeduction
  );

  // --- Step 6: Other Income ---
  const otherIncome = savingsInterest + fdInterest;

  // --- Step 7: Gross Total Income ---
  const grossTotalIncome = netSalary + otherIncome;

  // --- Step 8: Chapter VI-A Deductions ---

  // 80C bucket: EPF + other 80C (capped at ₹1,50,000)
  const total80C = Math.min(epfAnnual + otherEightyC, 150000);

  // 80CCD(1B): Additional NPS (employee's own contribution, max ₹50,000)
  // This is OVER and ABOVE the ₹1.5L 80C limit
  const nps1BDeduction = Math.min(selfNPS1B, 50000);

  // 80D: Health Insurance
  // Limit for self/family:
  const selfLimit = (ageGroup === 'senior' || ageGroup === 'superSenior') ? 50000 : 25000;
  const selfHealthDeduction = Math.min(selfHealthInsurance, selfLimit);
  // Limit for parents:
  const parentsLimit = parentsSenior ? 50000 : 25000;
  const parentsHealthDeduction = Math.min(parentsHealthInsurance, parentsLimit);
  const total80D = selfHealthDeduction + parentsHealthDeduction;

  // Section 24(b): Home Loan Interest — self-occupied only, max ₹2L
  const homeLoanDeduction = Math.min(homeLoanInterest, 200000);

  // 80TTA (below 60) or 80TTB (senior/super senior)
  let interestDeduction = 0;
  if (ageGroup === 'below60') {
    interestDeduction = Math.min(savingsInterest, 10000);  // 80TTA: savings interest only
  } else {
    // 80TTB: savings + FD interest, max ₹50,000 for seniors
    interestDeduction = Math.min(savingsInterest + fdInterest, 50000);
  }

  // 80GG: For those who pay rent but don't receive HRA
  let eightyGG = 0;
  if (paysRent && !receivesHRA && annualRent > 0) {
    const approxTotalIncome = grossTotalIncome;  // Use pre-deduction income as approximation
    const a = 60000;  // ₹5,000/month
    const b = approxTotalIncome * 0.25;
    const c = Math.max(0, annualRent - (approxTotalIncome * 0.10));
    eightyGG = Math.min(a, b, c);
  }

  // Total Chapter VI-A deductions
  const totalDeductions = total80C + nps1BDeduction + total80D + homeLoanDeduction + interestDeduction + eightyGG;

  // --- Step 9: Taxable Income ---
  const taxableIncome = Math.max(0, grossTotalIncome - totalDeductions);

  // --- Step 10: Apply Old Regime Slabs ---
  const taxBeforeRebate = applyOldRegimeSlabs(taxableIncome, ageGroup);

  // --- Step 11: Section 87A Rebate ---
  // Old regime: rebate up to ₹12,500 if taxable income ≤ ₹5,00,000
  let rebate = 0;
  if (taxableIncome <= 500000) {
    rebate = Math.min(taxBeforeRebate, 12500);
  }

  // --- Step 12: Net Tax, Cess, Total ---
  const netTax = Math.max(0, taxBeforeRebate - rebate);
  const cess = Math.round(netTax * 0.04);
  const totalTax = netTax + cess;

  return {
    taxableIncome,
    grossTotalIncome,
    totalDeductions,
    taxBeforeRebate,
    rebate,
    netTax,
    cess,
    totalTax,
    deductions: {
      standardDeduction, profTax, hraExemption, employerNPSDeduction,
      total80C, nps1BDeduction, total80D, homeLoanDeduction, interestDeduction, eightyGG,
    }
  };
}
```

#### Old Regime Slab Function

```typescript
function applyOldRegimeSlabs(income: number, ageGroup: AgeGroup): number {
  // FY 2025-26 Old Regime (unchanged from previous years)
  // Note: NO changes to old regime slabs or rates were announced in Budget 2025

  let basicExemption: number;
  let slabs: SlabEntry[];

  if (ageGroup === 'below60') {
    basicExemption = 250000;
    slabs = [
      { limit: 250000,  rate: 0 },
      { limit: 500000,  rate: 0.05 },
      { limit: 1000000, rate: 0.20 },
      { limit: Infinity, rate: 0.30 },
    ];
  } else if (ageGroup === 'senior') {
    // Resident Senior Citizens (60–79 years)
    basicExemption = 300000;
    slabs = [
      { limit: 300000,  rate: 0 },
      { limit: 500000,  rate: 0.05 },
      { limit: 1000000, rate: 0.20 },
      { limit: Infinity, rate: 0.30 },
    ];
  } else {
    // Resident Super Senior Citizens (80+ years)
    basicExemption = 500000;
    slabs = [
      { limit: 500000,  rate: 0 },
      { limit: 1000000, rate: 0.20 },
      { limit: Infinity, rate: 0.30 },
    ];
  }

  return computeTaxFromSlabs(income, slabs);
}
```

#### Generic Slab Computation Helper

```typescript
interface SlabEntry {
  limit: number;   // Upper limit of this slab
  rate: number;    // Tax rate (e.g., 0.05 for 5%)
}

function computeTaxFromSlabs(income: number, slabs: SlabEntry[]): number {
  let tax = 0;
  let prevLimit = 0;

  for (const slab of slabs) {
    if (income <= prevLimit) break;
    const taxableInSlab = Math.min(income, slab.limit) - prevLimit;
    tax += taxableInSlab * slab.rate;
    prevLimit = slab.limit;
  }

  return Math.round(tax);  // Round to nearest rupee
}
```

#### Per-Slab Breakdown (for Results Display)

```typescript
// Returns array of slab breakdown rows for display
function getSlabBreakdown(income: number, slabs: SlabEntry[]): SlabBreakdownRow[] {
  const rows: SlabBreakdownRow[] = [];
  let prevLimit = 0;

  for (const slab of slabs) {
    if (income <= prevLimit) {
      rows.push({ range: formatSlabRange(prevLimit, slab.limit), incomeInSlab: 0, rate: slab.rate, tax: 0 });
      prevLimit = slab.limit;
      continue;
    }
    const incomeInSlab = Math.min(income, slab.limit) - prevLimit;
    const tax = Math.round(incomeInSlab * slab.rate);
    rows.push({ range: formatSlabRange(prevLimit, slab.limit), incomeInSlab, rate: slab.rate, tax });
    prevLimit = slab.limit;
    if (income <= slab.limit) break;
  }

  return rows;
}
```

### 6.6 Output Type Definition

```typescript
interface TaxResult {
  oldRegime: RegimeResult;
  newRegime: RegimeResult;
  recommendation: 'old' | 'new' | 'equal';
  savingsAmount: number;  // Absolute difference in total tax (positive = savings from recommended regime)
  marginallyClose: boolean;  // true if difference ≤ ₹5,000
}

interface RegimeResult {
  grossSalary: number;
  taxableIncome: number;
  taxBeforeRebate: number;
  rebate: number;
  netTax: number;
  cess: number;
  totalTax: number;
  slabBreakdown: SlabBreakdownRow[];
  deductions: DeductionLineItems;
}

interface DeductionLineItems {
  standardDeduction: number;
  professionalTax: number;
  hraExemption: number;       // Old only (0 in new)
  employerNPSDeduction: number; // Both regimes
  eightyC: number;            // Old only
  selfNPS1B: number;          // Old only
  eightyD: number;            // Old only
  homeLoanInterest: number;   // Old only
  interestDeduction: number;  // Old only (80TTA/80TTB)
  eightyGG: number;           // Old only
}
```

### 6.7 Recommendation Logic

```typescript
function determineRecommendation(oldTax: number, newTax: number): TaxResult['recommendation'] {
  if (Math.abs(oldTax - newTax) <= 100) return 'equal';  // ≤ ₹100 difference treated as equal
  return newTax < oldTax ? 'new' : 'old';
}
```

---

## 7. Validation Rules

### Field-Level Validation

| Field | Rule | Error Message |
|-------|------|---------------|
| annualGross | > 0, ≤ 5,00,00,000 | "Please enter a valid salary amount." |
| monthlyBasic | > 0, ≤ annualGross/12 | "Basic salary can't be more than your gross salary." |
| monthlyRent | ≥ 0, if paysRent must be > 0 | "Please enter a valid rent amount." |
| monthlyHRA | ≥ 0, ≤ annualGross/12 | "HRA can't exceed your monthly salary." |
| otherEightyC | ≥ 0, ≤ 1,50,000 | "Maximum 80C benefit is ₹1.5 lakh." |
| selfHealthInsurance | ≥ 0 | — |
| parentsHealthInsurance | ≥ 0 | — |
| selfNPS1B | ≥ 0, ≤ 50,000 | "Maximum additional NPS deduction is ₹50,000." |
| homeLoanInterest | ≥ 0 | — |
| savingsInterest | ≥ 0 | — |
| fdInterest | ≥ 0 | — |
| professionalTax | ≥ 0, ≤ 2,500 | "Maximum professional tax is ₹2,500/year." |

### Cross-Field Validation
- If `monthlyBasic > annualGross / 12`: Show error "Basic salary can't exceed gross salary."
- If `monthlyHRA > annualGross / 12`: Show soft warning "HRA seems unusually high — please double-check."
- If `monthlyRent > annualGross / 24`: Show soft warning "Rent is more than 50% of salary. Double-check the amount."
- If `employerNPS > annualBasic * 0.14`: Cap silently to `annualBasic × 0.14` and show: "We've capped employer NPS at the legal limit (14% of basic)."

### Warning (non-blocking)
- If `total80C (epf + other)` > 1,50,000: Show "Total 80C exceeds the ₹1.5L limit. We'll cap it at ₹1.5L."
- If annualGross > 50,00,000: Show "Your income may attract surcharge. This calculator doesn't compute surcharge. Consult a CA for an accurate figure."

---

## 8. State Management Architecture

Use React Context + `useReducer` for the wizard state. No external state library needed.

### Context Shape

```typescript
interface WizardState {
  currentStep: number;         // 1–12
  inputs: Partial<TaxInputs>;  // Builds up as user answers
  result: TaxResult | null;    // Populated after final calculation
  skippedSteps: number[];      // Track which steps were skipped
}

type WizardAction =
  | { type: 'SET_INPUT'; key: keyof TaxInputs; value: any }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GOTO_STEP'; step: number }
  | { type: 'SKIP_STEP' }
  | { type: 'SET_RESULT'; result: TaxResult }
  | { type: 'RESET' };
```

### Live Preview Trigger
The tax calculation (`calculateTax(inputs)`) is called on every state change using `useMemo`. This means the preview panel always shows the latest estimate, even for partial inputs. For missing/skipped fields, use safe defaults (₹0 for deductions, calculated estimate for basic if skipped).

### URL Serialization (for shareable result links)
On the Results page, serialize `inputs` to Base64-encoded JSON and append to URL:
```
/results?d=eyJhbm51YWxHcm9zcyI6...
```
On page load of `/results`, decode URL params and re-run `calculateTax()` to restore the result. This means the result is fully reproducible from the URL.

---

## 9. Component Library

### Core Components

#### `<WizardCard />`
- Props: `stepNumber`, `totalSteps`, `title`, `subtitle?`, `children` (input area), `faqs?: FAQ[]`, `onNext`, `onBack`, `onSkip?`, `isSkippable`
- Contains: Progress bar, question title, input area, FAQ accordion, navigation buttons
- FAQ accordion: collapsed by default, opens on user click or after 10 seconds of inactivity on the step

#### `<ProgressBar />`
- Props: `current`, `total`
- Renders: Segmented dots + "Step X of Y" text
- Completed dots: filled accent color; Current: pulsing; Future: muted grey

#### `<LivePreviewPanel />`
- Props: `result: Partial<TaxResult>`
- Shows both regime tax totals, income summary, slab table
- Animates number changes with a brief highlight flash (0.3s transition)

#### `<RegimeCard />`
- Props: `regime: 'old' | 'new'`, `tax: number`, `cess: number`, `isWinner: boolean`
- Winner card: green accent border, subtle glow

#### `<SlabTable />`
- Props: `slabs: SlabBreakdownRow[]`, `regime: 'old' | 'new'`
- Renders a clean, striped table with slab ranges, income in slab, rate, and tax

#### `<ResultVerdictCard />`
- Props: `recommendation`, `savingsAmount`, `marginallyClose`
- The big, prominent result shown at top of `/results`

#### `<ComparisonTable />`
- Props: `oldRegime: RegimeResult`, `newRegime: RegimeResult`
- The full side-by-side breakdown. "Not allowed" items grayed out with tooltip.

#### `<SuggestionCard />`
- Props: `suggestion: Suggestion` (see Section 13)
- Icon, heading, and 2–3 line explanation

#### `<CopyButton />`
- On click: generates a plain-text summary and copies to clipboard
- Shows "Copied!" confirmation for 2 seconds

#### `<NumberInput />`
- Props: `value`, `onChange`, `prefix?` (e.g., "₹"), `placeholder`, `toggle?: { options, selected, onChange }` (for monthly/yearly toggle)
- Formats value with Indian comma system (1,00,000)
- Parses commas on input before storing as number

#### `<OptionButton />`
- A large, tappable button card used for multiple-choice questions (age group, metro/non-metro, yes/no)
- Props: `label`, `subLabel?`, `selected: boolean`, `onClick`

---

## 10. Design System

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#0057FF` | CTA buttons, active states, progress bar fill |
| `--color-primary-light` | `#EBF0FF` | Option button selected background |
| `--color-accent-green` | `#00A86B` | Winner badge, positive savings amount |
| `--color-accent-amber` | `#F59E0B` | Caution notices, "difference is small" |
| `--color-surface` | `#FFFFFF` | Cards |
| `--color-bg` | `#F5F7FA` | Page background |
| `--color-text-primary` | `#0F172A` | Main text |
| `--color-text-secondary` | `#64748B` | Sub-labels, helper text |
| `--color-text-muted` | `#94A3B8` | "Not allowed" items in comparison |
| `--color-border` | `#E2E8F0` | Card borders, table rows |
| `--color-old-regime` | `#6366F1` | Old regime accent (indigo) |
| `--color-new-regime` | `#0057FF` | New regime accent (blue) |

### Typography

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Hero H1 | 48px / 36px mobile | 700 | 1.2 |
| Question title | 28px / 22px mobile | 600 | 1.3 |
| Body | 16px | 400 | 1.6 |
| Helper text | 14px | 400 | 1.5 |
| Number (tax amount) | 32px | 700 | 1.1 |
| Slab label | 13px | 400 | 1.4 |

Font stack: `"Inter", -apple-system, BlinkMacSystemFont, sans-serif`

### Spacing Scale
`4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px, 96px`

### Border Radius
- Cards: `16px`
- Buttons: `12px`
- Inputs: `10px`
- Badges: `6px`

### Shadows
- Card: `0 1px 3px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.04)`
- Winner card glow: `0 0 0 2px #00A86B, 0 4px 16px rgba(0,168,107,0.12)`

### Motion
- Step transitions: Slide + fade (200ms ease-out)
- Number updates in live panel: 300ms ease-in-out
- Button hover: Scale 1.01, 120ms
- FAQ accordion: Smooth height animation, 180ms

### Wizard Card Layout
```
┌───────────────────────────────┐
│  ← Back                       │  ← 16px padding top
│                               │
│  Step 3 of 11                 │  ← muted label
│  ●●○○○○○○○○○               │  ← progress dots
│                               │
│  What is your Basic Salary?   │  ← H2, question title
│  "It's on your payslip as..." │  ← body, helper text
│                               │
│  [  ₹ _______________  ]      │  ← input
│                               │
│  ❓ Common doubts ▾            │  ← FAQ accordion trigger
│     Why does basic matter?    │
│     ...                       │
│                               │
│  [  Skip — I'll estimate  ]   │  ← text link, not button
│                               │
│                    [ Next →]  │  ← primary button, right-aligned
└───────────────────────────────┘
```

---

## 11. Copy & Tone Guidelines

### Principles
- **Conversational, never clinical.** Write like a smart friend, not a form.
- **Active voice.** "We calculate" not "Tax is calculated."
- **Never use jargon without immediately explaining it.** If "80C" must appear, follow it with "(tax-saving investments like PPF or LIC)".
- **Positive framing.** "You save ₹48,672" not "Your tax is ₹48,672 lower."
- **Precise but not scary.** Use exact numbers, but don't emphasize how complex the rules are.

### Approved Terms
| Avoid | Use Instead |
|-------|------------|
| Gross Total Income | Your total income before deductions |
| Chapter VI-A Deductions | Tax-saving investments and expenses |
| Assessee | You / taxpayer |
| AY 2026-27 | FY 2025-26 (April 2025 – March 2026) |
| HRA Exemption | How much of your rent saves tax |
| Section 87A Rebate | Tax rebate (zero-tax benefit) |
| Cess | Health & Education Cess (4%) |
| Basic + DA | Basic Salary (most private sector employees have no DA) |

### Result Copy
- Winner: "Pick the **New Regime**. You save **₹48,672** this year."
- Marginal: "The difference is just ₹3,200 — both regimes are nearly equal for you."
- Equal: "Both regimes give you the same tax this year."

### Error / Validation Copy
- "Hmm, that doesn't look right. Basic salary is usually less than your gross."
- "This is higher than the allowed limit of ₹1.5L. We'll cap it there."

---

## 12. Edge Cases & Error Handling

### Tax-Logic Edge Cases

| Scenario | Handling |
|----------|---------|
| Taxable income = ₹0 | Tax = ₹0 in both regimes. Show: "Zero tax in both regimes." |
| Salary below basic exemption (old regime) | Tax = ₹0 after applying appropriate slab |
| 80C investments + EPF exceed ₹1.5L | Cap combined total at ₹1.5L silently, show notice |
| HRA > actual HRA received | Cap HRA exemption at actual HRA received (first prong) |
| Rent < 10% of basic | HRA exemption = ₹0 (second prong becomes negative → zero) |
| Self NPS > ₹50,000 | Cap at ₹50,000 silently |
| Employer NPS > 14% of basic | Cap at 14% of annualBasic |
| Home loan interest > ₹2L | Cap at ₹2L for old regime |
| Super senior citizen (80+), old regime | No 5% slab (it doesn't exist for super seniors). Start at 20% from ₹5L onwards |
| Senior citizen in new regime | Same slabs as everyone else (no age advantage in new regime) |
| 80TTB (senior) covers FD interest | Include FD interest in 80TTB calculation (FD interest is also eligible) |
| Monthly/yearly toggle for salary | Store always as annual; convert on display |
| User skips basic salary | Use 40% of gross as estimate; mark as estimated in display |
| User skips HRA | No HRA exemption claimed |
| Savings interest + FD interest in old regime for senior | Apply 80TTB (covers both, max ₹50K) |
| Savings interest in old regime for below-60 | Only savings interest qualifies for 80TTA (not FD interest) |
| Marginal relief for income ₹12L–₹12.75L | Apply correctly per Section 6.4 formula |
| Income exactly ₹12L (new regime) | Full ₹60K rebate applies; tax = ₹0 |
| Income exactly ₹5L (old regime) | Full ₹12,500 rebate; tax = ₹0 |
| 80GG claimant who also has HRA | Only one can be claimed (80GG requires no HRA in salary). If user says they receive HRA, don't compute 80GG |

### UX Edge Cases

| Scenario | Handling |
|----------|---------|
| User hits back button in browser | Wizard state preserved via context; restore current step |
| User refreshes mid-wizard | Show option: "Continue where you left off?" (use sessionStorage for wizard state only — not user input data) |
| Very long result page | Sticky action bar (Copy / Recalculate) stays at bottom of viewport |
| Mobile keyboard covers input | Scroll input into view; ensure wizard card scrolls up |
| User enters salary in crores | Show surcharge notice and proceed (don't block) |
| Input is a decimal | Round to nearest rupee; accept decimal input in fields |
| Copy button in Safari | Handle Safari's clipboard API quirks; fall back to `document.execCommand('copy')` |
| Shareable URL too long for some platforms | Keep Base64 payload < 2KB; should be fine for all typical inputs |

---

## 13. Personalised Suggestions Engine

After the calculation, generate 3–5 contextual suggestions based on the user's inputs and which regime they're in. Display each as a card with an icon, a bold title, and a 2-sentence explanation.

### Suggestion Rules

```
IF new regime is recommended AND otherEightyC < 150000 AND epfAnnual < 150000:
  → "Consider investing ₹X more in 80C"
  BUT only show this IF it would flip the result OR reduce old regime tax meaningfully
  (This is a borderline suggestion — don't show if new regime wins by >₹20K)

IF new regime is recommended AND selfNPS1B < 50000:
  → "NPS gives you ₹50,000 extra deduction — but only in the Old Regime"
  Show: "You'd need ₹50,000 in NPS to get this benefit. Even then, you'd save more in the New Regime."

IF new regime is recommended AND hraExemption > 0 AND hraExemption < 30000:
  → "Your HRA saves you less than expected"
  "Your rent is lower relative to your salary. The Old Regime's HRA benefit doesn't help enough to beat the New Regime."

IF old regime is recommended AND total80C < 100000:
  → "Invest more in 80C to increase your savings"
  "You're using only ₹X of the ₹1.5L available under 80C. Investing ₹Y more (e.g., in PPF or ELSS) could save you ₹Z in taxes."
  (Calculate exact savings: `additionalDeduction × marginalRate × 1.04`)

IF old regime is recommended AND selfNPS1B < 50000:
  → "NPS can save you another ₹X"
  "Investing ₹50,000 in NPS Tier-1 under 80CCD(1B) would reduce your tax by ₹X. This is over and above your ₹1.5L 80C limit."
  (Calculate: min(50000 - selfNPS1B, 50000) × marginalRate × 1.04)

IF parentsHealthInsurance == 0 AND ageGroup != 'superSenior':
  → "Are your parents insured? You could save tax on their premium."
  "If you pay health insurance for your parents, you get an extra ₹25,000 (or ₹50,000 if they're seniors) deduction in the Old Regime."

IF both regimes result in 0 tax (below exemption):
  → "You don't owe any tax this year!"
  "Your income is below the tax-free threshold in both regimes. No action needed."

IF marginallyClose (difference ≤ ₹5000):
  → "The difference is small — consult a CA before deciding"
  "Both regimes give you nearly the same result. A CA can help you factor in things like advance tax, TDS, and future investment plans."

ALWAYS show (for new regime recommendation):
  → "The New Regime is now the default"
  "From FY 2023-24, the New Regime is the default tax regime. You need to actively opt for the Old Regime while filing your ITR. No action needed to use the New Regime."
```

### Suggestion Computation Example
```typescript
const marginalRate = getTaxMarginalRate(taxableIncome, regime);
const savingsFromMoreNPS = Math.min(50000 - selfNPS1B, 50000) * marginalRate * 1.04;
```

---

## 14. Non-Goals

The following are explicitly out of scope for v1.0. Do not add these features, even if technically feasible:

- Surcharge calculation (for income > ₹50L)
- Capital gains tax (LTCG, STCG)
- Freelance / business income (Schedule BP)
- Rental income from let-out property
- Agricultural income
- Foreign income / DTAA
- PDF export or email the report
- User accounts / login
- Saving results to a database
- Advertisement or sponsored content
- Advance tax calculation
- TDS reconciliation
- Form 16 upload or parsing
- ITR form recommendation
- Multiple salary slabs (mid-year salary change)

---

## 15. Appendix — Tax Reference Tables

### A. New Tax Regime Slabs — FY 2025-26 (All ages, including seniors)

| Income Range | Rate | Tax on Slab |
|---|---|---|
| ₹0 – ₹4,00,000 | 0% | ₹0 |
| ₹4,00,001 – ₹8,00,000 | 5% | ₹20,000 |
| ₹8,00,001 – ₹12,00,000 | 10% | ₹40,000 |
| ₹12,00,001 – ₹16,00,000 | 15% | ₹60,000 |
| ₹16,00,001 – ₹20,00,000 | 20% | ₹80,000 |
| ₹20,00,001 – ₹24,00,000 | 25% | ₹1,00,000 |
| Above ₹24,00,000 | 30% | — |

**Standard Deduction (New Regime):** ₹75,000  
**Section 87A Rebate:** Up to ₹60,000 (for taxable income ≤ ₹12,00,000)  
**Effective tax-free salary (salaried):** ₹12,75,000 (after ₹75K standard deduction → taxable = ₹12L → rebate = ₹60K → tax = ₹0)

### B. Old Tax Regime Slabs — FY 2025-26

**Below 60 years:**

| Income Range | Rate |
|---|---|
| ₹0 – ₹2,50,000 | 0% |
| ₹2,50,001 – ₹5,00,000 | 5% |
| ₹5,00,001 – ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

**Senior Citizens (60–79 years):**

| Income Range | Rate |
|---|---|
| ₹0 – ₹3,00,000 | 0% |
| ₹3,00,001 – ₹5,00,000 | 5% |
| ₹5,00,001 – ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

**Super Senior Citizens (80+ years):**

| Income Range | Rate |
|---|---|
| ₹0 – ₹5,00,000 | 0% |
| ₹5,00,001 – ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

**Standard Deduction (Old Regime):** ₹50,000  
**Section 87A Rebate:** Up to ₹12,500 (for taxable income ≤ ₹5,00,000)

### C. Old Regime Deduction Quick Reference

| Section | Deduction | Limit | Available in New Regime? |
|---|---|---|---|
| Section 16(ia) | Standard Deduction | ₹50,000 | ✅ (₹75,000) |
| Section 16(iii) | Professional Tax | Actual | ✅ |
| Section 10(13A) | HRA Exemption | Min of 3 prongs | ❌ |
| Section 80C | PF, PPF, ELSS, LIC, etc. | ₹1,50,000 | ❌ |
| Section 80CCD(1B) | NPS (self) | ₹50,000 | ❌ |
| Section 80CCD(2) | Employer NPS | 14% of Basic | ✅ |
| Section 80D | Health Insurance | ₹25K/₹50K self + ₹25K/₹50K parents | ❌ |
| Section 24(b) | Home Loan Interest (self-occupied) | ₹2,00,000 | ❌ |
| Section 80TTA | Savings Account Interest | ₹10,000 | ❌ |
| Section 80TTB | Interest (senior citizens) | ₹50,000 | ❌ |
| Section 80GG | Rent (no HRA in salary) | Min of 3 prongs, max ₹60K | ❌ |

### D. Health & Education Cess
**Rate:** 4% on (tax after rebate)  
**Applicable:** Both regimes, all income levels  
**No cess if net tax = ₹0**

### E. Marginal Relief Reference

**New Regime only — for taxable income between ₹12,00,001 and ₹12,75,000:**

| Taxable Income | Tax (without relief) | Relief | Net Tax | + 4% Cess | Total |
|---|---|---|---|---|---|
| ₹12,00,000 | ₹60,000 | ₹60,000 | ₹0 | ₹0 | ₹0 |
| ₹12,10,000 | ₹61,500 | ₹51,500 | ₹10,000 | ₹400 | ₹10,400 |
| ₹12,25,000 | ₹63,750 | ₹38,750 | ₹25,000 | ₹1,000 | ₹26,000 |
| ₹12,50,000 | ₹67,500 | ₹17,500 | ₹50,000 | ₹2,000 | ₹52,000 |
| ₹12,75,000 | ₹71,250 | ₹0 | ₹71,250 | ₹2,850 | ₹74,100 |

*At ₹12,75,000 the full slab-rate tax is less than or equal to marginal relief amount, so marginal relief = 0 and full slab tax applies.*

**Formula:**
```
Relief = max(0, taxOnSlabs - (taxableIncome - 12,00,000))
NetTax = taxOnSlabs - Relief
```

### F. HRA Exemption Formula

```
Exemption = min(
  A: Actual annual HRA received,
  B: Annual rent paid - 10% of annual basic salary,
  C: 50% of annual basic (metro) OR 40% of annual basic (non-metro)
)
```

Note: For HRA, "salary" = basic salary + DA. For private sector employees (no DA), it is just basic salary.

Metro cities for 50% rate (as per Income Tax Act, old rules applicable for FY 2025-26):  
**Delhi, Mumbai, Kolkata, Chennai**  
(Note: Bengaluru, Pune, Hyderabad, Ahmedabad may be added under the new Income Tax Act 2025 effective from FY 2026-27, but for FY 2025-26, only the traditional 4 metros qualify.)

### G. Worked Example — Calculation Walkthrough

**Profile:**  
- Age: 28 (below 60)
- Gross Salary: ₹15,00,000/year
- Basic Salary: ₹6,00,000/year (₹50,000/month)
- HRA: ₹2,40,000/year (₹20,000/month)
- Rent Paid: ₹18,000/month = ₹2,16,000/year, Non-metro city
- EPF: ₹1,800/month = ₹21,600/year
- Other 80C: ₹50,000
- Health Insurance (self): ₹15,000
- NPS (personal): ₹50,000
- Employer NPS: ₹60,000/year (₹5,000/month)
- Home Loan Interest: ₹0
- Savings Interest: ₹5,000
- Professional Tax: ₹2,400

**Old Regime:**

| Item | Calculation | Amount |
|---|---|---|
| Gross Salary | — | ₹15,00,000 |
| Standard Deduction (Sec 16) | Fixed | −₹50,000 |
| Professional Tax | Fixed | −₹2,400 |
| HRA Exemption | min(₹2,40,000 ; ₹2,16,000−₹60,000=₹1,56,000 ; ₹2,40,000) = ₹1,56,000 | −₹1,56,000 |
| Employer NPS (80CCD2) | min(₹60,000, 14%×₹6L=₹84,000) = ₹60,000 | −₹60,000 |
| Net Salary | — | ₹12,31,600 |
| Savings Interest | Added | +₹5,000 |
| Gross Total Income | — | ₹12,36,600 |
| 80C (EPF+Other): min(₹21,600+₹50,000=₹71,600, ₹1.5L) | = ₹71,600 | −₹71,600 |
| 80CCD(1B) NPS | min(₹50,000, ₹50,000) | −₹50,000 |
| 80D Health Insurance | min(₹15,000, ₹25,000) | −₹15,000 |
| 80TTA Savings Interest | min(₹5,000, ₹10,000) | −₹5,000 |
| **Taxable Income** | — | **₹9,95,000** |
| Tax on ₹9,95,000 (old slabs) | ₹0+₹12,500+₹1,98,000×0.20 = ₹12,500+₹39,000 | ₹51,500 |
| 87A Rebate | Taxable income > ₹5L → No rebate | ₹0 |
| Net Tax | — | ₹51,500 |
| Cess (4%) | ₹51,500 × 4% | ₹2,060 |
| **Total Tax (Old)** | — | **₹53,560** |

**New Regime:**

| Item | Calculation | Amount |
|---|---|---|
| Gross Salary | — | ₹15,00,000 |
| Standard Deduction | Fixed | −₹75,000 |
| Professional Tax | Fixed | −₹2,400 |
| Employer NPS (80CCD2) | ₹60,000 (within 14% of ₹6L) | −₹60,000 |
| Taxable Salary | — | ₹13,62,600 |
| Savings Interest | No deduction | +₹5,000 |
| **Total Taxable Income** | — | **₹13,67,600** |
| Tax on slabs | ₹0+₹20,000+₹40,000+₹3,67,600×0.15=₹55,140 | — |
| Breakdown: 0-4L=₹0, 4-8L=₹20K, 8-12L=₹40K, 12-13.676L=₹25,140 | — | ₹85,140 |
| 87A Rebate | Taxable > ₹12L → check marginal relief. Income >₹12.75L → No relief | ₹0 |
| Net Tax | — | ₹85,140 |
| Cess (4%) | ₹85,140 × 4% | ₹3,406 |
| **Total Tax (New)** | — | **₹88,546** |

**Result:** Old Regime wins. You save ₹88,546 − ₹53,560 = **₹34,986** by choosing the Old Regime.

**Why:** Large NPS + HRA + 80C deductions total ~₹3.3L, which makes the Old Regime's higher slab rates still worthwhile.

---

*End of PRD v1.0*  
*Prepared for FY 2025-26 (AY 2026-27). Tax rules sourced from Budget 2025 announcements and Income Tax Act, 1961. This PRD does not constitute tax or legal advice.*
