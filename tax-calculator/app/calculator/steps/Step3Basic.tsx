"use client";

import { useWizard } from "../context";
import { WizardCard } from "../WizardCard";
import { NumberInput } from "../NumberInput";

export function Step3Basic() {
  const { state, dispatch } = useWizard();

  const annualGross = state.inputs.annualGross ?? 0;
  const monthlyGross = Math.round(annualGross / 12);
  const monthlyBasic = state.inputs.monthlyBasic ?? null;

  const handleSkip = () => {
    const estimated = Math.round(monthlyGross * 0.4);
    dispatch({ type: "SET_INPUT", key: "monthlyBasic", value: estimated });
    dispatch({ type: "SKIP_STEP" });
  };

  const error =
    monthlyBasic != null && monthlyBasic > monthlyGross
      ? "Basic salary can't exceed your gross salary."
      : undefined;

  const warning =
    !error && monthlyBasic != null && monthlyBasic > monthlyGross * 0.6
      ? "That's unusually high — please double-check your payslip."
      : undefined;

  return (
    <WizardCard
      title="What is your Basic Salary per month?"
      subtitle="Your payslip lists several components — Basic, HRA, Special Allowance, etc. We just need the 'Basic' amount. It's usually 40–60% of your gross."
      faqs={[
        {
          question: "Where is Basic Salary on my payslip?",
          answer:
            'It\'s listed as "Basic Pay" or just "Basic" in the Earnings section of your salary slip.',
        },
        {
          question: "Why do you need basic separately?",
          answer:
            "Some tax benefits (like HRA and PF contributions) are calculated as a percentage of your basic salary, not your total salary.",
        },
      ]}
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      onSkip={handleSkip}
      isSkippable
      canProceed={!error && (monthlyBasic ?? 0) > 0}
    >
      <NumberInput
        value={monthlyBasic}
        onChange={(v) =>
          dispatch({ type: "SET_INPUT", key: "monthlyBasic", value: v ?? 0 })
        }
        prefix="₹"
        placeholder="e.g. 40,000"
        hint={
          monthlyBasic
            ? `Annual basic: ₹${(monthlyBasic * 12).toLocaleString("en-IN")}`
            : `Tip: usually 40–60% of your gross. 40% estimate = ₹${Math.round(monthlyGross * 0.4).toLocaleString("en-IN")}`
        }
        error={error}
        warning={warning}
      />
    </WizardCard>
  );
}
