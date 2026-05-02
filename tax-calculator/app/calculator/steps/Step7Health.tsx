"use client";

import { useWizard } from "../context";
import type { TaxInputs } from "@/lib/taxCalculator";
import { WizardCard } from "../WizardCard";
import { YesNoSelector } from "../YesNoSelector";
import { NumberInput } from "../NumberInput";

export function Step7Health() {
  const { state, dispatch } = useWizard();
  const { selfHealthInsurance, parentsHealthInsurance, parentsSenior, ageGroup } =
    state.inputs;
  const { hasHealthInsurance } = state.stepAnswers;

  const isSelfSenior = ageGroup === "senior" || ageGroup === "superSenior";
  const selfLimit = isSelfSenior ? 50_000 : 25_000;
  const parentsLimit = parentsSenior ? 50_000 : 25_000;

  const [showParents, setShowParents] = [
    state.stepAnswers.hasHealthInsurance && (parentsHealthInsurance ?? 0) > 0
      ? true
      : undefined,
    (v: boolean) =>
      dispatch({ type: "SET_ANSWER", key: "hasHealthInsurance", value: v }),
  ];

  const setInput = <K extends keyof TaxInputs>(
  
    key: K,
    value: TaxInputs[K]
  ) => dispatch({ type: "SET_INPUT", key, value });

  const canProceed = hasHealthInsurance !== undefined;

  return (
    <WizardCard
      title="Do you pay for health insurance?"
      subtitle="A health insurance premium paid for yourself, your spouse, kids, or parents — by cheque, UPI, or bank transfer (not cash)."
      faqs={[
        {
          question: "Does my company's group insurance count?",
          answer:
            "Not directly. Group insurance premiums deducted from your salary may qualify, but only if you can show proof of payment. If unsure, enter ₹0.",
        },
        {
          question: "Why not cash payments?",
          answer:
            "Tax law disallows the 80D deduction for cash payments (except preventive health check-ups up to ₹5,000).",
        },
      ]}
      onBack={() => dispatch({ type: "PREV_STEP" })}
      onNext={() => dispatch({ type: "NEXT_STEP" })}
      canProceed={canProceed}
      isSkippable={false}
    >
      <YesNoSelector
        value={hasHealthInsurance}
        onChange={(v) => {
          dispatch({ type: "SET_ANSWER", key: "hasHealthInsurance", value: v });
          if (!v) {
            setInput("selfHealthInsurance", 0);
            setInput("parentsHealthInsurance", 0);
          }
        }}
      />

      {hasHealthInsurance && (
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Self */}
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 4,
              }}
            >
              Your own family&apos;s health insurance per year
            </p>
            <p
              style={{
                fontSize: 12,
                color: "var(--color-text-secondary)",
                marginBottom: 8,
              }}
            >
              For yourself, spouse, children. Max deduction: ₹{selfLimit.toLocaleString("en-IN")}/year
              {isSelfSenior ? " (senior citizen rate)" : ""}.
            </p>
            <NumberInput
              value={selfHealthInsurance ?? null}
              onChange={(v) =>
                setInput("selfHealthInsurance", Math.min(v ?? 0, selfLimit))
              }
              prefix="₹"
              placeholder="e.g. 15,000"
            />
          </div>

          {/* Parents */}
          <div>
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "var(--color-text-primary)",
                marginBottom: 8,
              }}
            >
              Do you also pay for your parents&apos; health insurance?
            </p>
            <YesNoSelector
              value={
                (parentsHealthInsurance ?? 0) > 0
                  ? true
                  : (parentsHealthInsurance ?? 0) === 0 && hasHealthInsurance
                  ? undefined
                  : false
              }
              onChange={(v) => {
                if (!v) {
                  setInput("parentsHealthInsurance", 0);
                }
              }}
            />

            {(parentsHealthInsurance ?? 0) > 0 ||
              ((parentsHealthInsurance === 0 || parentsHealthInsurance === undefined) &&
                false) ? null : null}

            <div style={{ marginTop: 12 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--color-text-primary)",
                  marginBottom: 4,
                }}
              >
                Parents&apos; insurance premium per year
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: "var(--color-text-secondary)",
                  marginBottom: 8,
                }}
              >
                Are your parents senior citizens (60+)?{" "}
                <strong>
                  {parentsSenior ? "Yes — limit ₹50,000" : "No — limit ₹25,000"}
                </strong>
              </p>
              <YesNoSelector
                value={parentsSenior}
                onChange={(v) => setInput("parentsSenior", v)}
                yesLabel="Yes, 60+"
                noLabel="No"
              />
              {parentsSenior !== undefined && (
                <div style={{ marginTop: 12 }}>
                  <NumberInput
                    value={parentsHealthInsurance ?? null}
                    onChange={(v) =>
                      setInput(
                        "parentsHealthInsurance",
                        Math.min(v ?? 0, parentsLimit)
                      )
                    }
                    prefix="₹"
                    placeholder="e.g. 25,000"
                    hint={`Max deduction: ₹${parentsLimit.toLocaleString("en-IN")}/year`}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </WizardCard>
  );
}
