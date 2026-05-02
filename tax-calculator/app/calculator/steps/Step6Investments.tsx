"use client";

import { useWizard } from "../context";
import type { TaxInputs } from "@/lib/taxCalculator";
import { WizardCard } from "../WizardCard";
import { YesNoSelector } from "../YesNoSelector";
import { NumberInput } from "../NumberInput";

export function Step6Investments() {
  const { state, dispatch } = useWizard();
  const { otherEightyC } = state.inputs;
  const { hasInvestments } = state.stepAnswers;

  const epfAnnual = Math.min((state.inputs.monthlyEPF ?? 0) * 12, 21_600);
  const remainingCap = Math.max(0, 1_50_000 - epfAnnual);

  const setInput = <K extends keyof TaxInputs>(
  
    key: K,
    value: TaxInputs[K]
  ) => dispatch({ type: "SET_INPUT", key, value });

  const canProceed = hasInvestments !== undefined;

  const over80CLimitWarning =
    (otherEightyC ?? 0) > remainingCap && remainingCap > 0
      ? `Your EPF (${Math.round(epfAnnual / 1000)}K) + this exceeds ₹1.5L. We'll cap the combined total.`
      : undefined;

  return (
    <WizardCard
      title="Do you invest money to save taxes?"
      subtitle="Things like PPF, ELSS mutual funds, LIC premiums, kids' school fees, or home loan EMI principal. These are 80C investments."
      faqs={[
        {
          question: "Does my PF already count as 80C?",
          answer:
            "Yes! We already included your PF contribution above. Just enter any additional investments here.",
        },
        {
          question: "What is ELSS?",
          answer:
            "ELSS (Equity Linked Savings Scheme) is a mutual fund with a 3-year lock-in period that qualifies for the 80C deduction.",
        },
        {
          question: "What is the maximum benefit?",
          answer:
            "₹1.5L per year (combined with PF). Even if you invest more, the tax deduction is capped at ₹1.5L.",
        },
        {
          question: "Home loan principal repayment?",
          answer:
            "Yes, the principal portion of your EMI counts under 80C. Don't include the interest part here — that's a separate question.",
        },
      ]}
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      canProceed={canProceed}
      isSkippable={false}
    >
      <YesNoSelector
        value={hasInvestments}
        onChange={(v) => {
          dispatch({ type: "SET_ANSWER", key: "hasInvestments", value: v });
          if (!v) setInput("otherEightyC", 0);
        }}
      />

      {hasInvestments && (
        <div style={{ marginTop: 20 }}>
          <p
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--color-text-primary)",
              marginBottom: 4,
            }}
          >
            Total 80C investments per year
            <span style={{ fontWeight: 400, fontSize: 12, color: "var(--color-text-secondary)" }}>
              {" "}(excluding PF already counted)
            </span>
          </p>
          <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 8 }}>
            Common examples: PPF deposits, ELSS, LIC premiums, home loan principal, tuition fees.
            {epfAnnual > 0 && ` Your EPF counts ₹${Math.round(epfAnnual / 1000)}K — remaining room: ₹${Math.round(remainingCap / 1000)}K.`}
          </p>
          <NumberInput
            value={otherEightyC ?? null}
            onChange={(v) => setInput("otherEightyC", Math.min(v ?? 0, 1_50_000))}
            prefix="₹"
            placeholder="e.g. 50,000"
            hint="Max benefit: ₹1.5L/year (combined with PF)"
            warning={over80CLimitWarning}
          />
        </div>
      )}
    </WizardCard>
  );
}
