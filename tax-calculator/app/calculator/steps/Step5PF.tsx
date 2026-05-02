"use client";

import { useWizard } from "../context";
import type { TaxInputs } from "@/lib/taxCalculator";
import { WizardCard } from "../WizardCard";
import { YesNoSelector } from "../YesNoSelector";
import { NumberInput } from "../NumberInput";
import { formatINR } from "@/lib/taxCalculator";

export function Step5PF() {
  const { state, dispatch } = useWizard();
  const { hasEPF, monthlyEPF, monthlyBasic } = state.inputs;

  const estimated = Math.min(Math.round((monthlyBasic ?? 0) * 0.12), 1800);

  const setInput = <K extends keyof TaxInputs>(
  
    key: K,
    value: TaxInputs[K]
  ) => dispatch({ type: "SET_INPUT", key, value });

  const canProceed = hasEPF !== undefined;

  return (
    <WizardCard
      title="Does your employer deduct Provident Fund (PF) from your salary?"
      subtitle="PF is deducted every month — usually 12% of your Basic Salary, up to ₹1,800/month. Check your payslip for a 'PF' or 'EPF' deduction."
      faqs={[
        {
          question: "Where do I find if I have PF?",
          answer: "Check your payslip for 'EPF' or 'PF' in the deductions column.",
        },
        {
          question: "My company doesn't deduct PF — is that legal?",
          answer:
            "For companies with fewer than 20 employees, PF is optional. Some startups and contractors may not deduct it.",
        },
        {
          question: "What if I contribute more than the minimum?",
          answer:
            "Enter your actual monthly PF deduction. Only the first ₹1.5L/year (combined across all 80C investments) is tax-deductible.",
        },
      ]}
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      canProceed={canProceed}
      isSkippable={false}
    >
      <YesNoSelector
        value={hasEPF}
        onChange={(v) => {
          setInput("hasEPF", v);
          if (v) {
            setInput("monthlyEPF", estimated);
          } else {
            setInput("monthlyEPF", 0);
          }
        }}
      />

      {hasEPF && (
        <div style={{ marginTop: 20 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            Monthly EPF deduction
          </p>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
            Estimated at 12% of your basic ({formatINR(estimated)}/month). You can edit this.
          </p>
          <NumberInput
            value={monthlyEPF ?? estimated}
            onChange={(v) => setInput("monthlyEPF", Math.min(v ?? 0, 1800))}
            prefix="₹"
            placeholder="e.g. 1,800"
            hint="Employee share only (not employer's contribution). Max ₹1,800/month counts towards 80C."
          />
        </div>
      )}
    </WizardCard>
  );
}
