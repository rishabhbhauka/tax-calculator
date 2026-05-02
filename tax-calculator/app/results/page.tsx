import Link from "next/link";
import {
  calculateTax,
  formatINR,
  type TaxInputs,
  type TaxResult,
  type RegimeResult,
  type SlabBreakdownRow,
} from "@/lib/taxCalculator";
import { generateSuggestions } from "@/lib/suggestions";
import { ActionBar } from "./ActionBar";
import { SupportSection } from "./SupportSection";

export const runtime = 'edge'

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const inputs = decodeInputs(d);

  if (!inputs) {
    return (
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "var(--color-bg)",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 18,
            color: "var(--color-text-secondary)",
            marginBottom: 16,
          }}
        >
          No results found. Please complete the calculator first.
        </p>
        <Link
          href="/calculator"
          style={{
            padding: "11px 24px",
            background: "var(--color-primary)",
            color: "#fff",
            borderRadius: "var(--radius-button)",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Go to Calculator
        </Link>
      </main>
    );
  }

  const result = calculateTax(inputs);
  const { oldRegime, newRegime, recommendation, savingsAmount, marginallyClose } = result;
  const suggestions = generateSuggestions(inputs, result);

  const winnerIsNew = recommendation === "new" || recommendation === "equal";
  const verdictColor =
    recommendation === "new"
      ? "var(--color-accent-green)"
      : recommendation === "old"
      ? "var(--color-primary)"
      : "var(--color-text-secondary)";

  return (
    <main
      style={{
        background: "var(--color-bg)",
        minHeight: "100vh",
        paddingBottom: 80, // room for action bar
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          padding: "12px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: 13,
              color: "var(--color-text-muted)",
              textDecoration: "none",
            }}
          >
            ← Home
          </Link>
          <span
            style={{
              fontSize: 12,
              color: "var(--color-text-muted)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            FY 2025-26 Tax Result
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 16px 24px", display: "flex", gap: 28, alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
        {/* ── Section 1: Verdict ── */}
        <section style={{ paddingTop: 32, marginBottom: 32 }}>
          <div
            style={{
              borderRadius: "var(--radius-card)",
              overflow: "hidden",
              border: `2px solid ${verdictColor}`,
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div
              style={{
                background:
                  recommendation === "new"
                    ? "linear-gradient(90deg,#F0FDF4,#DCFCE7)"
                    : recommendation === "old"
                    ? "linear-gradient(90deg,#EBF0FF,#DBEAFE)"
                    : "#F8FAFC",
                padding: "24px",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
                className="verdict-row"
              >
                <div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: verdictColor,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {recommendation === "equal"
                      ? "Both regimes"
                      : "✅ Pick the"}
                  </span>
                  <h1
                    style={{
                      fontSize: 28,
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      lineHeight: 1.2,
                      marginTop: 2,
                    }}
                  >
                    {recommendation === "equal"
                      ? "give you the same tax"
                      : `${recommendation === "new" ? "New" : "Old"} Tax Regime`}
                  </h1>
                  {recommendation !== "equal" && (
                    <p
                      style={{
                        fontSize: 20,
                        fontWeight: 600,
                        color: verdictColor,
                        marginTop: 4,
                      }}
                    >
                      You save {formatINR(savingsAmount)} this year.
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    marginTop: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <VerdictStat
                    label="Old Regime Tax"
                    value={formatINR(oldRegime.totalTax)}
                    highlight={recommendation === "old"}
                  />
                  <VerdictStat
                    label="New Regime Tax"
                    value={formatINR(newRegime.totalTax)}
                    highlight={winnerIsNew}
                  />
                  {recommendation !== "equal" && (
                    <VerdictStat
                      label="You save"
                      value={formatINR(savingsAmount)}
                      highlight
                      green
                    />
                  )}
                </div>
              </div>
            </div>

            {marginallyClose && (
              <div
                style={{
                  padding: "12px 24px",
                  background: "#FFFBEB",
                  fontSize: 13,
                  color: "#92400E",
                }}
              >
                ⚠️ The difference is small (under ₹5,000). If you have a CA, confirm before filing.
              </div>
            )}
          </div>
        </section>

        {/* ── Section 2: Comparison table ── */}
        <Section title="Side-by-Side Comparison">
          <ComparisonTable old={oldRegime} new={newRegime} inputs={inputs} />
        </Section>

        {/* ── Section 3: Slab breakdowns ── */}
        <Section title="Slab-by-Slab Breakdown">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
            className="slab-grid"
          >
            <SlabSection
              label="🏛 Old Regime"
              regime={oldRegime}
              accent="var(--color-old-regime)"
            />
            <SlabSection
              label="✨ New Regime"
              regime={newRegime}
              accent="var(--color-new-regime)"
            />
          </div>
        </Section>

        {/* ── Section 4: Plain-language explanation ── */}
        <Section title="What drove your result">
          <PlainLanguageExplanation result={result} inputs={inputs} />
        </Section>

        {/* ── Section 5: Suggestions ── */}
        {suggestions.length > 0 && (
          <Section title="Personalised Tips">
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: "16px",
                    borderRadius: 12,
                    border: "1px solid var(--color-border)",
                    background: "var(--color-surface)",
                    display: "flex",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{s.icon}</span>
                  <div>
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--color-text-primary)",
                        marginBottom: 4,
                      }}
                    >
                      {s.title}
                    </p>
                    <p
                      style={{
                        fontSize: 13,
                        color: "var(--color-text-secondary)",
                        lineHeight: 1.6,
                      }}
                    >
                      {s.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* ── Support (inline) ── */}
        <SupportSection />
        </div>

        {/* ── Support sidebar ── */}
        <div style={{ width: 280, flexShrink: 0, position: "sticky", top: 24 }}>
          <SupportSection />
        </div>
      </div>

      {/* Sticky action bar */}
      <ActionBar result={result} inputs={inputs} />
    </main>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function decodeInputs(d: string | undefined): TaxInputs | null {
  if (!d) return null;
  try {
    const json = Buffer.from(d, "base64").toString("utf-8");
    return JSON.parse(json) as TaxInputs;
  } catch {
    return null;
  }
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: "var(--color-text-primary)",
          marginBottom: 14,
          paddingBottom: 8,
          borderBottom: "2px solid var(--color-border)",
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function VerdictStat({
  label,
  value,
  highlight,
  green,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  green?: boolean;
}) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          color: "var(--color-text-secondary)",
          marginBottom: 2,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: green
            ? "var(--color-accent-green)"
            : highlight
            ? "var(--color-text-primary)"
            : "var(--color-text-secondary)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function ComparisonTable({
  old,
  new: newR,
  inputs,
}: {
  old: RegimeResult;
  new: RegimeResult;
  inputs: TaxInputs;
}) {
  const epfAnnual = Math.min(inputs.monthlyEPF * 12, 21_600);

  const rows: {
    label: string;
    oldVal: number;
    newVal: number;
    newNA?: boolean;
    bold?: boolean;
  }[] = [
    { label: "Gross Salary", oldVal: inputs.annualGross, newVal: inputs.annualGross },
    {
      label: "Standard Deduction",
      oldVal: old.deductions.standardDeduction,
      newVal: newR.deductions.standardDeduction,
    },
    {
      label: "Professional Tax",
      oldVal: old.deductions.professionalTax,
      newVal: newR.deductions.professionalTax,
    },
    {
      label: "HRA Exemption",
      oldVal: old.deductions.hraExemption,
      newVal: 0,
      newNA: true,
    },
    {
      label: "Employer NPS (80CCD(2))",
      oldVal: old.deductions.employerNPSDeduction,
      newVal: newR.deductions.employerNPSDeduction,
    },
    {
      label: "80C Investments",
      oldVal: old.deductions.eightyC,
      newVal: 0,
      newNA: true,
    },
    {
      label: "80CCD(1B) — Personal NPS",
      oldVal: old.deductions.selfNPS1B,
      newVal: 0,
      newNA: true,
    },
    {
      label: "80D Health Insurance",
      oldVal: old.deductions.eightyD,
      newVal: 0,
      newNA: true,
    },
    {
      label: "Home Loan Interest (24b)",
      oldVal: old.deductions.homeLoanInterest,
      newVal: 0,
      newNA: true,
    },
    {
      label: "80TTA/80TTB Interest",
      oldVal: old.deductions.interestDeduction,
      newVal: 0,
      newNA: true,
    },
    {
      label: "80GG Rent",
      oldVal: old.deductions.eightyGG,
      newVal: 0,
      newNA: true,
    },
    {
      label: "Taxable Income",
      oldVal: old.taxableIncome,
      newVal: newR.taxableIncome,
      bold: true,
    },
    { label: "Tax on Slabs", oldVal: old.taxBeforeRebate, newVal: newR.taxBeforeRebate },
    { label: "Section 87A Rebate", oldVal: old.rebate, newVal: newR.rebate },
    { label: "Net Tax", oldVal: old.netTax, newVal: newR.netTax },
    { label: "Health & Ed. Cess (4%)", oldVal: old.cess, newVal: newR.cess },
    {
      label: "Total Tax Payable",
      oldVal: old.totalTax,
      newVal: newR.totalTax,
      bold: true,
    },
  ];

  const isDeductionRow = (label: string) =>
    label.startsWith("80") ||
    label.includes("Deduction") ||
    label.includes("Exemption") ||
    label.includes("Interest (24") ||
    label.includes("NPS") ||
    label.includes("Prof") ||
    label.includes("Rebate") ||
    label.includes("Cess");

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        overflow: "auto",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#F8FAFC" }}>
            <th
              style={{
                textAlign: "left",
                padding: "10px 14px",
                fontWeight: 600,
                color: "var(--color-text-secondary)",
                borderBottom: "2px solid var(--color-border)",
                minWidth: 180,
              }}
            >
              Item
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "10px 14px",
                fontWeight: 600,
                color: "var(--color-old-regime)",
                borderBottom: "2px solid var(--color-border)",
              }}
            >
              🏛 Old Regime
            </th>
            <th
              style={{
                textAlign: "right",
                padding: "10px 14px",
                fontWeight: 600,
                color: "var(--color-new-regime)",
                borderBottom: "2px solid var(--color-border)",
              }}
            >
              ✨ New Regime
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isNeg = isDeductionRow(row.label) && !row.label.includes("Tax") && !row.label.includes("Cess") && !row.label.includes("Cess") && !row.label.includes("Income");
            return (
              <tr
                key={row.label}
                style={{
                  borderBottom: "1px solid var(--color-border)",
                  background: row.bold ? "#F8FAFC" : i % 2 === 0 ? "transparent" : "#FAFAFA",
                }}
              >
                <td
                  style={{
                    padding: "8px 14px",
                    fontWeight: row.bold ? 700 : 400,
                    color: "var(--color-text-primary)",
                  }}
                >
                  {row.label}
                </td>
                <td
                  style={{
                    padding: "8px 14px",
                    textAlign: "right",
                    fontWeight: row.bold ? 700 : 400,
                    color:
                      row.oldVal === 0
                        ? "var(--color-text-muted)"
                        : "var(--color-text-primary)",
                  }}
                >
                  {isNeg && row.oldVal > 0 ? "−" : ""}
                  {formatINR(row.oldVal)}
                </td>
                <td
                  style={{
                    padding: "8px 14px",
                    textAlign: "right",
                    fontWeight: row.bold ? 700 : 400,
                    color: row.newNA
                      ? "var(--color-text-muted)"
                      : row.newVal === 0
                      ? "var(--color-text-muted)"
                      : "var(--color-text-primary)",
                  }}
                  title={row.newNA ? "Not available in New Regime" : undefined}
                >
                  {row.newNA && row.newVal === 0
                    ? "₹0 (not allowed)"
                    : `${isNeg && row.newVal > 0 ? "−" : ""}${formatINR(row.newVal)}`}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SlabSection({
  label,
  regime,
  accent,
}: {
  label: string;
  regime: RegimeResult;
  accent: string;
}) {
  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "8px 12px",
          background: "#F8FAFC",
          borderBottom: "1px solid var(--color-border)",
          fontSize: 12,
          fontWeight: 700,
          color: accent,
        }}
      >
        {label}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr style={{ background: "#FAFAFA" }}>
            <th style={thStyle}>Slab</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Rate</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Tax</th>
          </tr>
        </thead>
        <tbody>
          {regime.slabBreakdown.map((row: SlabBreakdownRow) => (
            <tr
              key={row.range}
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <td style={tdStyle}>{row.range}</td>
              <td style={{ ...tdStyle, textAlign: "right" }}>
                {(row.rate * 100).toFixed(0)}%
              </td>
              <td style={{ ...tdStyle, textAlign: "right" }}>
                {formatINR(row.tax)}
              </td>
            </tr>
          ))}
          <tr style={{ background: "#F8FAFC", fontWeight: 700 }}>
            <td style={tdStyle} colSpan={2}>
              Tax on slabs
            </td>
            <td style={{ ...tdStyle, textAlign: "right" }}>
              {formatINR(regime.taxBeforeRebate)}
            </td>
          </tr>
          {regime.rebate > 0 && (
            <tr style={{ color: "var(--color-accent-green)" }}>
              <td style={tdStyle} colSpan={2}>
                − Rebate (87A)
              </td>
              <td style={{ ...tdStyle, textAlign: "right" }}>
                −{formatINR(regime.rebate)}
              </td>
            </tr>
          )}
          <tr style={{ background: "#F8FAFC", fontWeight: 700 }}>
            <td style={tdStyle} colSpan={2}>
              + Cess (4%)
            </td>
            <td style={{ ...tdStyle, textAlign: "right" }}>
              {formatINR(regime.cess)}
            </td>
          </tr>
          <tr
            style={{
              background: "#EFF6FF",
              fontWeight: 700,
              borderTop: "2px solid var(--color-border)",
            }}
          >
            <td style={tdStyle} colSpan={2}>
              Total Tax
            </td>
            <td style={{ ...tdStyle, textAlign: "right" }}>
              {formatINR(regime.totalTax)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "6px 10px",
  textAlign: "left",
  fontWeight: 600,
  color: "var(--color-text-secondary)",
  borderBottom: "1px solid var(--color-border)",
};
const tdStyle: React.CSSProperties = {
  padding: "6px 10px",
  color: "var(--color-text-primary)",
};

function PlainLanguageExplanation({
  result,
  inputs,
}: {
  result: TaxResult;
  inputs: TaxInputs;
}) {
  const { oldRegime, newRegime, recommendation, savingsAmount } = result;
  const bullets: string[] = [];

  if (recommendation === "old") {
    bullets.push(
      `Your deductions total ${formatINR(oldRegime.totalChapterVIADeductions + oldRegime.deductions.standardDeduction + oldRegime.deductions.hraExemption + oldRegime.deductions.employerNPSDeduction)} in the Old Regime, reducing your taxable income to ${formatINR(oldRegime.taxableIncome)}.`
    );
    if (oldRegime.deductions.hraExemption > 0) {
      bullets.push(
        `Your HRA exemption of ${formatINR(oldRegime.deductions.hraExemption)} is only available in the Old Regime — that alone saved you ${formatINR(Math.round(oldRegime.deductions.hraExemption * 0.2 * 1.04))} in taxes.`
      );
    }
    if (oldRegime.deductions.eightyC > 0) {
      bullets.push(
        `Your 80C investments of ${formatINR(oldRegime.deductions.eightyC)} reduce your taxable income in the Old Regime.`
      );
    }
  } else if (recommendation === "new") {
    bullets.push(
      `Even with your deductions, the New Regime's lower slab rates win. You save ${formatINR(savingsAmount)}/year.`
    );
    if (inputs.annualGross <= 12_75_000) {
      bullets.push(
        `Your gross salary is below ₹12.75L — with the ₹75,000 standard deduction, your taxable income may be at or below ₹12L, where the full ₹60,000 rebate applies (zero tax!).`
      );
    }
    if (oldRegime.deductions.hraExemption === 0 && inputs.paysRent) {
      bullets.push(
        "Your HRA exemption is ₹0 — your rent is less than 10% of your basic salary, so none of the three prongs gives a positive amount."
      );
    }
  } else {
    bullets.push(
      "Both regimes give you the same tax this year. You can choose either."
    );
  }

  bullets.push(
    `Old Regime taxable income: ${formatINR(oldRegime.taxableIncome)} — New Regime taxable income: ${formatINR(newRegime.taxableIncome)}.`
  );

  if (newRegime.rebate > 0) {
    bullets.push(
      `The New Regime Section 87A rebate of ${formatINR(newRegime.rebate)} applied, reducing your net tax to ₹0.`
    );
  }

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        padding: "16px 20px",
        background: "var(--color-surface)",
      }}
    >
      <ul style={{ display: "flex", flexDirection: "column", gap: 10, padding: 0, margin: 0 }}>
        {bullets.map((b) => (
          <li
            key={b}
            style={{
              fontSize: 14,
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              listStyle: "none",
              paddingLeft: 20,
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                color: "var(--color-primary)",
              }}
            >
              •
            </span>
            {b}
          </li>
        ))}
      </ul>
    </div>
  );
}
