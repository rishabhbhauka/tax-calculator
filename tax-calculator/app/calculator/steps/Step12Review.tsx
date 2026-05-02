"use client";

import { useRouter } from "next/navigation";
import { useWizard } from "../context";
import { WizardCard } from "../WizardCard";
import { withDefaults } from "../context";
import { formatINR } from "@/lib/taxCalculator";

export function Step12Review() {
  const { state, dispatch } = useWizard();
  const router = useRouter();
  const inputs = withDefaults(state.inputs);

  const handleCalculate = () => {
    const encoded = btoa(JSON.stringify(inputs));
    router.push(`/results?d=${encoded}`);
  };

  const goto = (step: number) => dispatch({ type: "GOTO_STEP", step });

  return (
    <WizardCard
      title="Here's everything you've told us."
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={handleCalculate}
      nextLabel="Calculate My Tax →"
      canProceed={true}
      isSkippable={false}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <ReviewGroup
          label="Salary & Basic"
          onEdit={() => goto(2)}
          rows={[
            ["Annual gross salary", formatINR(inputs.annualGross)],
            [
              "Monthly basic",
              formatINR(inputs.monthlyBasic) +
                (state.skippedSteps.includes(3) ? " (estimated)" : ""),
            ],
          ]}
        />

        {inputs.paysRent && (
          <ReviewGroup
            label="Housing"
            onEdit={() => goto(4)}
            rows={[
              [
                "Monthly rent",
                formatINR(inputs.monthlyRent) +
                  (inputs.isMetro ? " (metro)" : " (non-metro)"),
              ],
              inputs.receivesHRA
                ? ["Monthly HRA", formatINR(inputs.monthlyHRA)]
                : ["HRA in salary", "No — checking 80GG eligibility"],
            ]}
          />
        )}

        <ReviewGroup
          label="Investments & Deductions"
          onEdit={() => goto(5)}
          rows={[
            ["PF (annual)", formatINR(Math.min((inputs.monthlyEPF ?? 0) * 12, 21_600))],
            ["Other 80C", formatINR(inputs.otherEightyC)],
            [
              "Health insurance (self)",
              formatINR(inputs.selfHealthInsurance),
            ],
            inputs.parentsHealthInsurance > 0
              ? [
                  "Health insurance (parents)",
                  formatINR(inputs.parentsHealthInsurance),
                ]
              : null,
            inputs.employerNPS > 0
              ? ["Employer NPS", formatINR(inputs.employerNPS)]
              : null,
            inputs.selfNPS1B > 0
              ? ["Personal NPS (80CCD(1B))", formatINR(inputs.selfNPS1B)]
              : null,
            inputs.homeLoanInterest > 0
              ? ["Home loan interest", formatINR(inputs.homeLoanInterest)]
              : null,
          ].filter(Boolean) as [string, string][]}
        />

        {(inputs.savingsInterest > 0 || inputs.fdInterest > 0) && (
          <ReviewGroup
            label="Other Income"
            onEdit={() => goto(10)}
            rows={[
              ["Savings interest", formatINR(inputs.savingsInterest)],
              ["FD interest", formatINR(inputs.fdInterest)],
            ]}
          />
        )}

        <ReviewGroup
          label="Other"
          onEdit={() => goto(11)}
          rows={[
            ["Professional tax", formatINR(inputs.professionalTax)],
          ]}
        />
      </div>
    </WizardCard>
  );
}

function ReviewGroup({
  label,
  rows,
  onEdit,
}: {
  label: string;
  rows: [string, string][];
  onEdit: () => void;
}) {
  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid var(--color-border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 12px",
          background: "#F8FAFC",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--color-text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {label}
        </span>
        <button
          type="button"
          onClick={onEdit}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            fontSize: 12,
            color: "var(--color-primary)",
            fontFamily: "inherit",
          }}
        >
          Edit
        </button>
      </div>
      <div style={{ padding: "4px 0" }}>
        {rows.map(([k, v]) => (
          <div
            key={k}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 12px",
              fontSize: 13,
            }}
          >
            <span style={{ color: "var(--color-text-secondary)" }}>{k}</span>
            <span
              style={{
                fontWeight: 500,
                color: "var(--color-text-primary)",
              }}
            >
              {v}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
