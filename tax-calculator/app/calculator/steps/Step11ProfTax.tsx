"use client";

import { useWizard } from "../context";
import type { TaxInputs } from "@/lib/taxCalculator";
import { WizardCard } from "../WizardCard";
import { YesNoSelector } from "../YesNoSelector";
import { NumberInput } from "../NumberInput";

export function Step11ProfTax() {
  const { state, dispatch } = useWizard();
  const { professionalTax } = state.inputs;
  const { hasProfTax } = state.stepAnswers;

  const setInput = <K extends keyof TaxInputs>(
  
    key: K,
    value: TaxInputs[K]
  ) => dispatch({ type: "SET_INPUT", key, value });

  const canProceed = hasProfTax !== undefined;

  return (
    <WizardCard
      title="Does your employer deduct Professional Tax from your salary?"
      subtitle="Professional Tax is a small monthly deduction by your state government — usually ₹200/month. Not all states have it."
      faqs={[
        {
          question: "How do I know if it's deducted?",
          answer:
            "Check your payslip. It's usually called 'Prof Tax' or 'PT' in the deductions column.",
        },
        {
          question: "It's ₹200/month in my state — what do I enter?",
          answer: "Enter ₹2,400 (12 months × ₹200).",
        },
      ]}
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      canProceed={canProceed}
      isSkippable={false}
    >
      <YesNoSelector
        value={hasProfTax}
        onChange={(v) => {
          dispatch({ type: "SET_ANSWER", key: "hasProfTax", value: v });
          if (!v) setInput("professionalTax", 0);
          else setInput("professionalTax", 2_400);
        }}
      />

      {hasProfTax && (
        <div style={{ marginTop: 20 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            How much is deducted per year?
          </p>
          <NumberInput
            value={professionalTax ?? 2_400}
            onChange={(v) =>
              setInput("professionalTax", Math.min(v ?? 0, 2_500))
            }
            prefix="₹"
            placeholder="2,400"
            hint="Max ₹2,500/year. Deductible under both Old and New Regime."
          />
        </div>
      )}
    </WizardCard>
  );
}
