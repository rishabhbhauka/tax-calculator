"use client";

import { useWizard } from "../context";
import type { TaxInputs } from "@/lib/taxCalculator";
import { WizardCard } from "../WizardCard";
import { YesNoSelector } from "../YesNoSelector";
import { NumberInput } from "../NumberInput";

export function Step9HomeLoan() {
  const { state, dispatch } = useWizard();
  const { homeLoanInterest } = state.inputs;
  const { hasHomeLoan } = state.stepAnswers;

  const setInput = <K extends keyof TaxInputs>(
  
    key: K,
    value: TaxInputs[K]
  ) => dispatch({ type: "SET_INPUT", key, value });

  const canProceed = hasHomeLoan !== undefined;

  return (
    <WizardCard
      title="Do you have a home loan on a property you live in?"
      subtitle="If you own a house and have a home loan on it, the interest you pay can reduce your taxes — but only in the Old Regime."
      faqs={[
        {
          question: "Is this the full EMI amount?",
          answer:
            "No. Your EMI has two parts: principal (goes into 80C) and interest. Only the interest portion goes here. Your bank statement shows this breakdown.",
        },
        {
          question: "What if the loan is on a second home I've rented out?",
          answer:
            "This calculator only handles a home you live in. For rental property, consult a CA.",
        },
        {
          question: "I have a home loan but also pay rent (I work in another city)",
          answer:
            "You can claim both HRA and home loan interest. Enter both and we'll calculate both.",
        },
      ]}
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      canProceed={canProceed}
      isSkippable={false}
    >
      <YesNoSelector
        value={hasHomeLoan}
        onChange={(v) => {
          dispatch({ type: "SET_ANSWER", key: "hasHomeLoan", value: v });
          if (!v) setInput("homeLoanInterest", 0);
        }}
      />

      {hasHomeLoan && (
        <div style={{ marginTop: 20 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            How much home loan interest did you pay last year?
          </p>
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              marginBottom: 8,
            }}
          >
            Look at your loan statement for &ldquo;Interest paid in FY 2025-26&rdquo;. Not the EMI amount.
          </p>
          <NumberInput
            value={homeLoanInterest ?? null}
            onChange={(v) =>
              setInput("homeLoanInterest", Math.min(v ?? 0, 2_00_000))
            }
            prefix="₹"
            placeholder="e.g. 1,20,000"
            hint="Max deduction: ₹2,00,000/year for self-occupied property (Old Regime only)"
          />
          <p
            style={{
              fontSize: 12,
              marginTop: 8,
              padding: "8px 10px",
              background: "#FEF9C3",
              borderRadius: 8,
              color: "#92400E",
            }}
          >
            ⚠️ This deduction is not available in the New Regime for self-occupied property.
          </p>
        </div>
      )}
    </WizardCard>
  );
}
