// Developer verification page — not linked from any user-facing route.
// Runs Appendix G from the PRD and shows every intermediate value.
// Open at /verify to spot-check the engine before building the wizard.

import { calculateTax, formatINR, type TaxInputs, type RegimeResult, type SlabBreakdownRow } from "@/lib/taxCalculator";

// ── Appendix G inputs ─────────────────────────────────────────────────────────
const APPENDIX_G: TaxInputs = {
  ageGroup: "below60",
  annualGross: 15_00_000,
  monthlyBasic: 50_000,
  paysRent: true,
  monthlyRent: 18_000,
  isMetro: false,
  receivesHRA: true,
  monthlyHRA: 20_000,
  hasEPF: true,
  monthlyEPF: 1_800,
  otherEightyC: 50_000,
  selfHealthInsurance: 15_000,
  parentsHealthInsurance: 0,
  parentsSenior: false,
  employerNPS: 60_000,
  selfNPS1B: 50_000,
  homeLoanInterest: 0,
  savingsInterest: 5_000,
  fdInterest: 0,
  professionalTax: 2_400,
};

export default function VerifyPage() {
  const result = calculateTax(APPENDIX_G);
  const { oldRegime, newRegime, recommendation, savingsAmount } = result;

  return (
    <main style={{ fontFamily: "monospace", maxWidth: 900, margin: "0 auto", padding: "32px 24px", color: "#0F172A" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
        🔬 Engine Verification — Appendix G
      </h1>
      <p style={{ color: "#64748B", marginBottom: 32, fontSize: 14 }}>
        Inputs hard-coded from PRD Appendix G worked example. Verify each line manually.
      </p>

      {/* ── Inputs ── */}
      <Section title="Inputs">
        <Table rows={[
          ["Age group", APPENDIX_G.ageGroup],
          ["Annual gross salary", formatINR(APPENDIX_G.annualGross)],
          ["Monthly basic", formatINR(APPENDIX_G.monthlyBasic) + "  →  annual " + formatINR(APPENDIX_G.monthlyBasic * 12)],
          ["Monthly HRA", formatINR(APPENDIX_G.monthlyHRA) + "  →  annual " + formatINR(APPENDIX_G.monthlyHRA * 12)],
          ["Monthly rent", formatINR(APPENDIX_G.monthlyRent) + "  →  annual " + formatINR(APPENDIX_G.monthlyRent * 12)],
          ["Metro city", String(APPENDIX_G.isMetro)],
          ["Receives HRA", String(APPENDIX_G.receivesHRA)],
          ["Monthly EPF", formatINR(APPENDIX_G.monthlyEPF) + "  →  annual " + formatINR(Math.min(APPENDIX_G.monthlyEPF * 12, 21600))],
          ["Other 80C", formatINR(APPENDIX_G.otherEightyC)],
          ["Health insurance (self)", formatINR(APPENDIX_G.selfHealthInsurance)],
          ["Employer NPS (annual)", formatINR(APPENDIX_G.employerNPS)],
          ["Personal NPS 80CCD(1B)", formatINR(APPENDIX_G.selfNPS1B)],
          ["Home loan interest", formatINR(APPENDIX_G.homeLoanInterest)],
          ["Savings interest", formatINR(APPENDIX_G.savingsInterest)],
          ["FD interest", formatINR(APPENDIX_G.fdInterest)],
          ["Professional tax", formatINR(APPENDIX_G.professionalTax)],
        ]} />
      </Section>

      {/* ── Old Regime ── */}
      <Section title="Old Regime — Step by Step">
        <RegimeDetail regime={oldRegime} label="Old" />
      </Section>

      {/* ── New Regime ── */}
      <Section title="New Regime — Step by Step">
        <RegimeDetail regime={newRegime} label="New" />
      </Section>

      {/* ── Slab breakdowns ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
        <div>
          <SectionHeading title="Old Regime — Slab Breakdown" />
          <SlabTable rows={oldRegime.slabBreakdown} totalTax={oldRegime.taxBeforeRebate} />
        </div>
        <div>
          <SectionHeading title="New Regime — Slab Breakdown" />
          <SlabTable rows={newRegime.slabBreakdown} totalTax={newRegime.taxBeforeRebate} />
        </div>
      </div>

      {/* ── Verdict ── */}
      <Section title="Recommendation">
        <Table rows={[
          ["Old Regime total tax", formatINR(oldRegime.totalTax)],
          ["New Regime total tax", formatINR(newRegime.totalTax)],
          ["Difference", formatINR(savingsAmount)],
          ["Recommendation", recommendation.toUpperCase()],
        ]} />
      </Section>

      {/* ── PRD comparison note ── */}
      <Section title="vs PRD Appendix G Expected Values">
        <p style={{ fontSize: 13, lineHeight: 1.7, color: "#475569", marginBottom: 12 }}>
          The PRD&apos;s worked example contains arithmetic errors in the old regime calculation.
          The new regime matches exactly. Details:
        </p>
        <Table rows={[
          ["New regime — PRD says", "₹88,546"],
          ["New regime — engine says", formatINR(newRegime.totalTax)],
          ["New regime match", newRegime.totalTax === 88546 ? "✅ CORRECT" : "❌ MISMATCH"],
          ["—", "—"],
          ["Old regime — PRD says", "₹53,560  ⚠ PRD has errors (see below)"],
          ["Old regime — engine says", formatINR(oldRegime.totalTax)],
          ["—", "—"],
          ["PRD error 1", "PRD states taxable income = ₹9,95,000"],
          ["Correct taxable income", formatINR(oldRegime.taxableIncome) + "  (GTI ₹12,36,600 − deductions ₹1,41,600)"],
          ["PRD error 2", "PRD states slab tax = ₹51,500 using ₹1,98,000 × 20% which is unexplained"],
          ["Correct slab tax", formatINR(oldRegime.taxBeforeRebate) + "  (slabs applied to correct taxable income)"],
          ["Engine rules", "Implemented per PRD §6.4–6.5 specs — rules are correct, worked example is not"],
        ]} />
      </Section>
    </main>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function RegimeDetail({ regime, label }: { regime: RegimeResult; label: string }) {
  const d = regime.deductions;
  const isOld = label === "Old";

  const rows: [string, string][] = [
    ["Gross salary", formatINR(regime.grossSalary)],
    ["  − Standard deduction", formatINR(d.standardDeduction)],
    ["  − Professional tax", formatINR(d.professionalTax)],
  ];

  if (isOld) {
    rows.push(["  − HRA exemption (10(13A))", formatINR(d.hraExemption)]);
  }

  rows.push(["  − Employer NPS (80CCD(2))", formatINR(d.employerNPSDeduction)]);
  rows.push(["= Net salary", formatINR(regime.netSalary)]);
  rows.push(["  + Other income (interest)", formatINR(regime.otherIncome)]);
  rows.push(["= Gross total income", formatINR(regime.grossTotalIncome)]);

  if (isOld) {
    rows.push(["  − 80C (EPF + other, capped ₹1.5L)", formatINR(d.eightyC)]);
    rows.push(["  − 80CCD(1B) NPS", formatINR(d.selfNPS1B)]);
    rows.push(["  − 80D health insurance", formatINR(d.eightyD)]);
    rows.push(["  − 80TTA/TTB interest", formatINR(d.interestDeduction)]);
    rows.push(["  − 80GG rent (no HRA)", formatINR(d.eightyGG)]);
    rows.push(["  − Home loan interest 24(b)", formatINR(d.homeLoanInterest)]);
    rows.push(["  Total Ch. VI-A deductions", formatINR(regime.totalChapterVIADeductions)]);
  }

  rows.push(["= Taxable income", formatINR(regime.taxableIncome)]);
  rows.push(["Tax on slabs", formatINR(regime.taxBeforeRebate)]);
  rows.push(["  − Section 87A rebate", formatINR(regime.rebate)]);
  rows.push(["= Net tax", formatINR(regime.netTax)]);
  rows.push(["  + Cess (4%)", formatINR(regime.cess)]);
  rows.push(["= Total tax payable", formatINR(regime.totalTax)]);

  return <Table rows={rows} highlightLast />;
}

function SlabTable({ rows, totalTax }: { rows: SlabBreakdownRow[]; totalTax: number }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
      <thead>
        <tr style={{ background: "#F1F5F9" }}>
          <Th>Slab</Th>
          <Th align="right">Rate</Th>
          <Th align="right">Income in slab</Th>
          <Th align="right">Tax</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #E2E8F0" }}>
            <Td>{r.range}</Td>
            <Td align="right">{(r.rate * 100).toFixed(0)}%</Td>
            <Td align="right">{formatINR(r.incomeInSlab)}</Td>
            <Td align="right">{formatINR(r.tax)}</Td>
          </tr>
        ))}
        <tr style={{ background: "#F8FAFC", fontWeight: 700 }}>
          <Td colSpan={3}>Total</Td>
          <Td align="right">{formatINR(totalTax)}</Td>
        </tr>
      </tbody>
    </table>
  );
}

function Table({ rows, highlightLast }: { rows: [string, string][]; highlightLast?: boolean }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <tbody>
        {rows.map(([label, value], i) => {
          const isLast = highlightLast && i === rows.length - 1;
          const isDivider = label === "—";
          return (
            <tr
              key={i}
              style={{
                borderBottom: "1px solid #E2E8F0",
                background: isLast ? "#F0FDF4" : isDivider ? "#F8FAFC" : "transparent",
              }}
            >
              <td style={{ padding: "5px 8px", color: "#475569", width: "55%" }}>{label}</td>
              <td
                style={{
                  padding: "5px 8px",
                  textAlign: "right",
                  fontWeight: isLast ? 700 : 400,
                  color: isLast ? "#15803D" : "#0F172A",
                }}
              >
                {value}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <SectionHeading title={title} />
      {children}
    </div>
  );
}

function SectionHeading({ title }: { title: string }) {
  return (
    <h2
      style={{
        fontSize: 14,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "#0057FF",
        marginBottom: 10,
        paddingBottom: 6,
        borderBottom: "2px solid #EBF0FF",
      }}
    >
      {title}
    </h2>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: "right" }) {
  return (
    <th style={{ padding: "6px 8px", textAlign: align ?? "left", fontWeight: 600, fontSize: 11, color: "#64748B" }}>
      {children}
    </th>
  );
}

function Td({ children, align, colSpan }: { children: React.ReactNode; align?: "right"; colSpan?: number }) {
  return (
    <td style={{ padding: "5px 8px", textAlign: align ?? "left" }} colSpan={colSpan}>
      {children}
    </td>
  );
}
