"use client";

import { useWizard } from "../context";
import type { TaxInputs } from "@/lib/taxCalculator";
import { WizardCard } from "../WizardCard";
import { YesNoSelector } from "../YesNoSelector";
import { NumberInput } from "../NumberInput";

export function Step8NPS() {
  const { state, dispatch } = useWizard();
  const { employerNPS, selfNPS1B, monthlyBasic } = state.inputs;
  const { hasNPS } = state.stepAnswers;

  const annualBasic = (monthlyBasic ?? 0) * 12;
  const maxEmployerNPS = Math.round(annualBasic * 0.14);

  const setInput = <K extends keyof TaxInputs>(
  
    key: K,
    value: TaxInputs[K]
  ) => dispatch({ type: "SET_INPUT", key, value });

  const canProceed = hasNPS !== undefined;

  return (
    <WizardCard
      title="Do you invest in NPS (National Pension System)?"
      subtitle="NPS is a government retirement savings scheme — separate from PF. Many employers offer it, or you can invest personally."
      faqs={[
        {
          question: "What's the difference between employer NPS and my own NPS?",
          answer:
            "Employer NPS (80CCD(2)) is deductible under BOTH old and new regimes — up to 14% of your basic salary. Your own NPS contribution (80CCD(1B)) saves an extra ₹50,000, but ONLY in the old regime.",
        },
        {
          question: "How do I know if my employer contributes to NPS?",
          answer:
            "Check your payslip or offer letter. It will say 'NPS Contribution' as an employer benefit.",
        },
      ]}
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      canProceed={canProceed}
      isSkippable={false}
    >
      <YesNoSelector
        value={hasNPS}
        onChange={(v) => {
          dispatch({ type: "SET_ANSWER", key: "hasNPS", value: v });
          if (!v) {
            setInput("employerNPS", 0);
            setInput("selfNPS1B", 0);
          }
        }}
      />

      {hasNPS && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Employer NPS */}
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 4,
              }}
            >
              Does your employer contribute to your NPS account?
            </p>
            <p
              style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 10 }}
            >
              ✅ Deductible in BOTH old and new regimes (up to 14% of basic = ₹{maxEmployerNPS.toLocaleString("en-IN")}/year)
            </p>
            <YesNoSelector
              value={employerNPS !== undefined ? (employerNPS ?? 0) > 0 : undefined}
              onChange={(v) => {
                if (!v) setInput("employerNPS", 0);
                else setInput("employerNPS", Math.round(annualBasic * 0.1));
              }}
            />
            {(employerNPS ?? 0) > 0 && (
              <div style={{ marginTop: 12 }}>
                <NumberInput
                  value={employerNPS ?? null}
                  onChange={(v) =>
                    setInput("employerNPS", Math.min(v ?? 0, maxEmployerNPS))
                  }
                  prefix="₹"
                  placeholder="e.g. 60,000"
                  hint={`Annual amount. Max: ₹${maxEmployerNPS.toLocaleString("en-IN")} (14% of your basic)`}
                />
              </div>
            )}
          </div>

          {/* Self NPS */}
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 4,
              }}
            >
              Do you also make personal NPS contributions?
            </p>
            <p
              style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: 10 }}
            >
              ⚠️ Saves extra ₹50,000 — but only in the Old Regime (80CCD(1B))
            </p>
            <YesNoSelector
              value={selfNPS1B !== undefined ? (selfNPS1B ?? 0) > 0 : undefined}
              onChange={(v) => {
                if (!v) setInput("selfNPS1B", 0);
              }}
            />
            {(selfNPS1B !== undefined && selfNPS1B !== 0) ||
            (selfNPS1B === 0 && false) ? null : null}
            {(selfNPS1B ?? 0) > 0 || selfNPS1B === undefined ? (
              <div style={{ marginTop: 12 }}>
                <NumberInput
                  value={selfNPS1B && selfNPS1B > 0 ? selfNPS1B : null}
                  onChange={(v) => setInput("selfNPS1B", Math.min(v ?? 0, 50_000))}
                  prefix="₹"
                  placeholder="e.g. 50,000"
                  hint="Max ₹50,000/year — over and above your ₹1.5L 80C limit"
                />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </WizardCard>
  );
}
