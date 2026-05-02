"use client";

import { useState } from "react";
import { useWizard } from "./context";
import { RegimeCard } from "./RegimeCard";
import { formatINR } from "@/lib/taxCalculator";

export function LivePreviewPanel() {
  const { liveResult, state } = useWizard();
  const r = liveResult;
  const [summaryOpen, setSummaryOpen] = useState(true);
  const isComplete = state.currentStep === 12;

  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--color-border)",
        padding: "20px",
        position: "sticky",
        top: 24,
      }}
    >
      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "var(--color-text-muted)",
          letterSpacing: "0.1em",
          marginBottom: 14,
        }}
      >
        LIVE TAX PREVIEW
      </p>

      {!r ? (
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-muted)",
            textAlign: "center",
            padding: "20px 0",
            lineHeight: 1.6,
          }}
        >
          Enter your salary on Step 2 to see an estimate here.
        </p>
      ) : (
        <>
          {/* Regime cards */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <RegimeCard
              regime="old"
              netTax={r.oldRegime.netTax}
              cess={r.oldRegime.cess}
              totalTax={r.oldRegime.totalTax}
              isWinner={r.recommendation === "old"}
            />
            <RegimeCard
              regime="new"
              netTax={r.newRegime.netTax}
              cess={r.newRegime.cess}
              totalTax={r.newRegime.totalTax}
              isWinner={
                r.recommendation === "new" || r.recommendation === "equal"
              }
            />
          </div>

          {/* Income summary (collapsible) */}
          <div
            style={{ borderTop: "1px solid var(--color-border)", paddingTop: 12 }}
          >
            <button
              type="button"
              onClick={() => setSummaryOpen((v) => !v)}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                display: "flex",
                alignItems: "center",
                gap: 4,
                width: "100%",
                justifyContent: "space-between",
                marginBottom: summaryOpen ? 10 : 0,
                fontFamily: "inherit",
              }}
            >
              <span>Income summary</span>
              <span
                style={{
                  transition: "transform 180ms",
                  transform: summaryOpen ? "rotate(180deg)" : "none",
                }}
              >
                ▾
              </span>
            </button>

            {summaryOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <SummaryRow
                  label="Gross salary"
                  value={formatINR(r.oldRegime.grossSalary)}
                />
                {r.oldRegime.deductions.hraExemption > 0 && (
                  <SummaryRow
                    label="HRA exemption"
                    value={formatINR(r.oldRegime.deductions.hraExemption)}
                    negative
                  />
                )}
                <SummaryRow
                  label="Taxable income (old)"
                  value={formatINR(r.oldRegime.taxableIncome)}
                />
                <SummaryRow
                  label="Taxable income (new)"
                  value={formatINR(r.newRegime.taxableIncome)}
                />
              </div>
            )}
          </div>

          {/* Recommendation banner */}
          {isComplete && r.recommendation !== "equal" && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 12px",
                borderRadius: 10,
                background:
                  r.recommendation === "new" ? "#F0FDF4" : "var(--color-primary-light)",
                border:
                  r.recommendation === "new"
                    ? "1px solid #BBF7D0"
                    : "1px solid #BFDBFE",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color:
                    r.recommendation === "new"
                      ? "var(--color-accent-green)"
                      : "var(--color-primary)",
                }}
              >
                ✅ Pick {r.recommendation === "new" ? "New" : "Old"} Regime —
                you save {formatINR(r.savingsAmount)}/year
              </p>
            </div>
          )}

          {/* Partial estimate note */}
          {!isComplete && (
            <p
              style={{
                fontSize: 11,
                color: "var(--color-text-muted)",
                marginTop: 10,
                fontStyle: "italic",
              }}
            >
              Estimate improves as you answer more questions.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: 12,
        color: "var(--color-text-secondary)",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          fontWeight: 500,
          color: negative ? "#EF4444" : "var(--color-text-primary)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
