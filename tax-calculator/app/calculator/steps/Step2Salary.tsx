"use client";

import { useState } from "react";
import { useWizard } from "../context";
import { WizardCard } from "../WizardCard";
import { NumberInput } from "../NumberInput";

type Period = "Monthly" | "Yearly";

export function Step2Salary() {
  const { state, dispatch } = useWizard();
  const [period, setPeriod] = useState<Period>("Monthly");

  const annualGross = state.inputs.annualGross ?? 0;

  const displayValue =
    period === "Monthly"
      ? annualGross > 0
        ? Math.round(annualGross / 12)
        : null
      : annualGross > 0
      ? annualGross
      : null;

  const handleChange = (v: number | null) => {
    const annual = v == null ? 0 : period === "Monthly" ? v * 12 : v;
    dispatch({ type: "SET_INPUT", key: "annualGross", value: annual });
  };

  const handlePeriodChange = (p: string) => setPeriod(p as Period);

  const warning =
    annualGross > 5_00_00_000
      ? "For incomes above ₹5Cr, surcharge rules apply. Consult a CA."
      : annualGross > 50_00_000
      ? "Your income may attract surcharge. This calculator doesn't compute surcharge."
      : undefined;

  const annualLabel =
    period === "Monthly" && annualGross > 0
      ? `Annual: ₹${annualGross.toLocaleString("en-IN")}`
      : undefined;

  return (
    <WizardCard
      title="What does your company pay you before any deductions?"
      subtitle="This is the 'Gross Salary' on your payslip — before PF, professional tax, or income tax are taken out. It's usually the biggest number on your salary slip."
      faqs={[
        {
          question: "What if my salary varies month to month?",
          answer:
            "Enter your average monthly salary, or your total expected annual salary.",
        },
        {
          question: "Is gross salary the same as CTC?",
          answer:
            "No. CTC (Cost to Company) includes employer PF and other benefits. Gross salary is what appears on your payslip. Use the payslip number, not your offer letter CTC.",
        },
        {
          question: "What if I have a bonus?",
          answer:
            "Include your expected annual bonus in the yearly figure. Bonuses are fully taxable as salary income.",
        },
        {
          question: "Where do I find this number?",
          answer:
            'Look at the very first line of your monthly salary slip — "Gross Earnings" or "Total Earnings". That\'s the number.',
        },
      ]}
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      canProceed={annualGross >= 12_000}
      isSkippable={false}
    >
      <NumberInput
        value={displayValue}
        onChange={handleChange}
        prefix="₹"
        placeholder="e.g. 75,000"
        toggle={{
          options: ["Monthly", "Yearly"],
          selected: period,
          onChange: handlePeriodChange,
        }}
        hint={annualLabel}
        warning={warning}
      />
    </WizardCard>
  );
}
