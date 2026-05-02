"use client";

import { useWizard } from "../context";
import type { TaxInputs } from "@/lib/taxCalculator";
import { WizardCard } from "../WizardCard";
import { YesNoSelector } from "../YesNoSelector";
import { OptionButton } from "../OptionButton";
import { NumberInput } from "../NumberInput";

export function Step4Rent() {
  const { state, dispatch } = useWizard();
  const { paysRent, monthlyRent, isMetro, receivesHRA, monthlyHRA } = state.inputs;

  const annualGross = state.inputs.annualGross ?? 0;

  const setInput = <K extends keyof TaxInputs>(
  
    key: K,
    value: TaxInputs[K]
  ) => dispatch({ type: "SET_INPUT", key, value });

  // canProceed: if No rent → always proceed. If Yes → need rent amount, city, HRA answer (and amount if yes)
  const canProceed =
    paysRent === false ||
    (paysRent === true &&
      (monthlyRent ?? 0) > 0 &&
      isMetro !== undefined &&
      receivesHRA !== undefined &&
      (receivesHRA === false || (monthlyHRA ?? 0) > 0));

  const rentWarning =
    (monthlyRent ?? 0) > annualGross / 24
      ? "Rent is more than 50% of salary. Double-check the amount."
      : undefined;

  return (
    <WizardCard
      title="Do you live in a rented home?"
      faqs={[
        {
          question: "What if I live in my own house?",
          answer:
            "Select No. You won't get HRA exemption, but you may qualify for home loan benefits instead.",
        },
        {
          question: "What if I pay rent to my parents?",
          answer:
            "That counts! You can claim HRA exemption if you have a proper rent agreement and bank transfer proof.",
        },
        {
          question: "I don't get HRA — can I still claim anything?",
          answer:
            "Yes. Under Section 80GG, people without HRA can claim rent deductions up to ₹60,000/year if they meet certain conditions. We'll account for this.",
        },
      ]}
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      canProceed={canProceed}
      isSkippable={false}
    >
      <YesNoSelector
        value={paysRent}
        onChange={(v) => {
          setInput("paysRent", v);
          if (!v) {
            setInput("monthlyRent", 0);
            setInput("monthlyHRA", 0);
            setInput("receivesHRA", false);
          }
        }}
      />

      {paysRent && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* 4a: Rent amount */}
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 8,
              }}
            >
              How much rent do you pay per month?
            </p>
            <NumberInput
              value={monthlyRent ?? null}
              onChange={(v) => setInput("monthlyRent", v ?? 0)}
              prefix="₹"
              placeholder="e.g. 20,000"
              warning={rentWarning}
              hint={
                (monthlyRent ?? 0) > 0
                  ? `Annual rent: ₹${((monthlyRent ?? 0) * 12).toLocaleString("en-IN")}`
                  : undefined
              }
            />
          </div>

          {/* 4b: City */}
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 4,
              }}
            >
              Which city do you live in?
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginBottom: 10,
              }}
            >
              This affects your HRA calculation. Only Delhi, Mumbai, Kolkata, and Chennai are metro for FY 2025-26.
            </p>
            <div
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
            >
              <OptionButton
                label="Delhi, Mumbai, Kolkata, or Chennai"
                subLabel="Metro — 50% HRA rate"
                selected={isMetro === true}
                onClick={() => setInput("isMetro", true)}
              />
              <OptionButton
                label="Any other city"
                subLabel="Non-metro — 40% HRA rate"
                selected={isMetro === false}
                onClick={() => setInput("isMetro", false)}
              />
            </div>
          </div>

          {/* 4c: HRA in salary */}
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 8,
              }}
            >
              Does your salary include an HRA component?
            </p>
            <YesNoSelector
              value={receivesHRA}
              onChange={(v) => {
                setInput("receivesHRA", v);
                if (!v) setInput("monthlyHRA", 0);
              }}
            />

            {receivesHRA && (
              <div style={{ marginTop: 16 }}>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--color-text-primary)",
                    marginBottom: 8,
                  }}
                >
                  What is your monthly HRA amount?
                </p>
                <NumberInput
                  value={monthlyHRA ?? null}
                  onChange={(v) => setInput("monthlyHRA", v ?? 0)}
                  prefix="₹"
                  placeholder="e.g. 18,000"
                  hint="Found under 'Earnings' on your payslip as 'HRA'"
                />
              </div>
            )}

            {receivesHRA === false && (
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  marginTop: 8,
                  padding: "8px 12px",
                  background: "var(--color-primary-light)",
                  borderRadius: 8,
                }}
              >
                We&apos;ll check if you qualify for the 80GG deduction (up to ₹60,000/year).
              </p>
            )}
          </div>
        </div>
      )}
    </WizardCard>
  );
}
