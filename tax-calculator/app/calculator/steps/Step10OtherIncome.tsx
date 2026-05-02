"use client";

import { useWizard } from "../context";
import type { TaxInputs } from "@/lib/taxCalculator";
import { WizardCard } from "../WizardCard";
import { YesNoSelector } from "../YesNoSelector";
import { NumberInput } from "../NumberInput";

export function Step10OtherIncome() {
  const { state, dispatch } = useWizard();
  const { savingsInterest, fdInterest, ageGroup } = state.inputs;
  const { hasOtherIncome } = state.stepAnswers;

  const isSenior = ageGroup === "senior" || ageGroup === "superSenior";

  const setInput = <K extends keyof TaxInputs>(
  
    key: K,
    value: TaxInputs[K]
  ) => dispatch({ type: "SET_INPUT", key, value });

  const canProceed = hasOtherIncome !== undefined;

  return (
    <WizardCard
      title="Do you earn any other income outside your salary?"
      subtitle="Like interest from savings accounts or FDs. (We're not covering freelance income, rental property, or stock market gains here.)"
      faqs={[
        {
          question: "Where do I find my savings account interest?",
          answer:
            "Your bank sends an annual interest statement. You can also check it in Form 26AS or AIS on the income tax portal.",
        },
        {
          question: "What about dividends or stock profits?",
          answer:
            "Those involve special capital gains rules. This calculator focuses on salary income only. Please consult a CA for those.",
        },
      ]}
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      canProceed={canProceed}
      isSkippable={false}
    >
      <YesNoSelector
        value={hasOtherIncome}
        onChange={(v) => {
          dispatch({ type: "SET_ANSWER", key: "hasOtherIncome", value: v });
          if (!v) {
            setInput("savingsInterest", 0);
            setInput("fdInterest", 0);
          }
        }}
      />

      {hasOtherIncome && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 4,
              }}
            >
              Interest from savings accounts per year
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
              }}
            >
              {isSenior
                ? "First ₹50,000 is deductible under 80TTB (covers savings + FD interest combined). Old Regime only."
                : "First ₹10,000 is deductible under 80TTA. Old Regime only."}
            </p>
            <NumberInput
              value={savingsInterest ?? null}
              onChange={(v) => setInput("savingsInterest", v ?? 0)}
              prefix="₹"
              placeholder="e.g. 5,000"
            />
          </div>

          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 4,
              }}
            >
              Interest from Fixed Deposits per year
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
              }}
            >
              {isSenior
                ? "Included in the ₹50,000 80TTB limit (combined with savings interest)."
                : "FD interest is fully taxable — no deduction under 80TTA. Enter ₹0 if you have no FDs."}
            </p>
            <NumberInput
              value={fdInterest ?? null}
              onChange={(v) => setInput("fdInterest", v ?? 0)}
              prefix="₹"
              placeholder="e.g. 0"
            />
          </div>
        </div>
      )}
    </WizardCard>
  );
}
