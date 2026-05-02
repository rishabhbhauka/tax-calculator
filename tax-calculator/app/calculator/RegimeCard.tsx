"use client";

import { formatINR } from "@/lib/taxCalculator";

interface Props {
  regime: "old" | "new";
  netTax: number;
  cess: number;
  totalTax: number;
  isWinner: boolean;
}

export function RegimeCard({ regime, netTax, cess, totalTax, isWinner }: Props) {
  const isNew = regime === "new";
  const accent = isNew ? "var(--color-new-regime)" : "var(--color-old-regime)";
  const label = isNew ? "✨ New Regime" : "🏛 Old Regime";

  return (
    <div
      style={{
        flex: 1,
        padding: "14px",
        borderRadius: 12,
        background: "var(--color-surface)",
        border: isWinner
          ? "2px solid var(--color-accent-green)"
          : "1.5px solid var(--color-border)",
        boxShadow: isWinner ? "var(--shadow-winner)" : undefined,
        position: "relative",
        transition: "border-color 300ms, box-shadow 300ms",
      }}
    >
      {isWinner && (
        <span
          style={{
            position: "absolute",
            top: -9,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--color-accent-green)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: "var(--radius-badge)",
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
          }}
        >
          LOWER TAX
        </span>
      )}

      <p
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: accent,
          letterSpacing: "0.07em",
          marginBottom: 6,
        }}
      >
        {label.toUpperCase()}
      </p>

      <p
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "var(--color-text-primary)",
          lineHeight: 1,
        }}
      >
        {formatINR(totalTax)}
      </p>

      <div
        style={{
          fontSize: 11,
          color: "var(--color-text-secondary)",
          marginTop: 6,
          lineHeight: 1.6,
        }}
      >
        <div>Tax {formatINR(netTax)}</div>
        <div>+ Cess {formatINR(cess)}</div>
      </div>
    </div>
  );
}
