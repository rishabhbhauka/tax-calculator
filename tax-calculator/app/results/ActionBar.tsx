"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TaxResult, TaxInputs } from "@/lib/taxCalculator";
import { formatINR } from "@/lib/taxCalculator";

interface Props {
  result: TaxResult;
  inputs: TaxInputs;
}

export function ActionBar({ result, inputs }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const { oldRegime, newRegime, recommendation, savingsAmount } = result;
    const lines = [
      "Indian Tax Regime Comparison — FY 2025-26",
      "=".repeat(42),
      "",
      `Gross Salary: ${formatINR(inputs.annualGross)}`,
      "",
      `OLD REGIME — Total Tax: ${formatINR(oldRegime.totalTax)}`,
      `  Taxable Income: ${formatINR(oldRegime.taxableIncome)}`,
      `  Tax on slabs:   ${formatINR(oldRegime.taxBeforeRebate)}`,
      `  Rebate (87A):  -${formatINR(oldRegime.rebate)}`,
      `  Net Tax:        ${formatINR(oldRegime.netTax)}`,
      `  Cess (4%):      ${formatINR(oldRegime.cess)}`,
      "",
      `NEW REGIME — Total Tax: ${formatINR(newRegime.totalTax)}`,
      `  Taxable Income: ${formatINR(newRegime.taxableIncome)}`,
      `  Tax on slabs:   ${formatINR(newRegime.taxBeforeRebate)}`,
      `  Rebate (87A):  -${formatINR(newRegime.rebate)}`,
      `  Net Tax:        ${formatINR(newRegime.netTax)}`,
      `  Cess (4%):      ${formatINR(newRegime.cess)}`,
      "",
      `RECOMMENDATION: ${recommendation === "equal" ? "Both regimes are equal" : `${recommendation.toUpperCase()} REGIME — saves ${formatINR(savingsAmount)}/year`}`,
      "",
      "Calculated at https://localhost:3000/calculator",
      "Not financial advice. Verify with a CA for complex situations.",
    ];

    const text = lines.join("\n");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Safari fallback
        const el = document.createElement("textarea");
        el.value = text;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  const handleRecalculate = () => {
    router.push("/calculator");
  };

  const btnBase: React.CSSProperties = {
    padding: "11px 24px",
    borderRadius: "var(--radius-button)",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "transform 120ms",
  };

  return (
    <div className="results-action-bar">
      <button
        type="button"
        onClick={handleCopy}
        style={{
          ...btnBase,
          background: copied ? "#F0FDF4" : "var(--color-primary-light)",
          color: copied ? "var(--color-accent-green)" : "var(--color-primary)",
          border: `1.5px solid ${copied ? "var(--color-accent-green)" : "var(--color-primary)"}`,
        }}
      >
        {copied ? "✓ Copied!" : "Copy Summary"}
      </button>

      <button
        type="button"
        onClick={handleRecalculate}
        style={{
          ...btnBase,
          background: "var(--color-primary)",
          color: "#fff",
          border: "none",
        }}
      >
        Recalculate
      </button>
    </div>
  );
}
