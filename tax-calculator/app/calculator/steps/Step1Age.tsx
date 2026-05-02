"use client";

import { useWizard } from "../context";
import { WizardCard } from "../WizardCard";
import { OptionButton } from "../OptionButton";

const OPTIONS = [
  { value: "below60" as const, label: "Under 60", sub: "Most working professionals" },
  { value: "senior" as const, label: "60 to 79", sub: "Senior citizen" },
  { value: "superSenior" as const, label: "80 or above", sub: "Super senior citizen" },
];

export function Step1Age() {
  const { state, dispatch } = useWizard();
  const selected = state.inputs.ageGroup;

  return (
    <WizardCard
      title="How old are you?"
      faqs={[
        {
          question: "Why does age matter for taxes?",
          answer:
            "The Old Tax Regime gives senior citizens (60+) and super seniors (80+) a higher exemption limit, so they pay less. The New Regime uses the same slabs for everyone regardless of age.",
        },
      ]}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      canProceed={Boolean(selected)}
      isSkippable={false}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {OPTIONS.map((opt) => (
          <OptionButton
            key={opt.value}
            label={opt.label}
            subLabel={opt.sub}
            selected={selected === opt.value}
            onClick={() =>
              dispatch({ type: "SET_INPUT", key: "ageGroup", value: opt.value })
            }
          />
        ))}
      </div>
    </WizardCard>
  );
}
