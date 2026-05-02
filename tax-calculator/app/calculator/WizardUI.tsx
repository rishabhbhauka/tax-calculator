"use client";

import { useState, type ReactNode } from "react";
import { useWizard, TOTAL_STEPS } from "./context";
import { ProgressBar } from "./ProgressBar";
import { LivePreviewPanel } from "./LivePreviewPanel";
import { Step1Age } from "./steps/Step1Age";
import { Step2Salary } from "./steps/Step2Salary";
import { Step3Basic } from "./steps/Step3Basic";
import { Step4Rent } from "./steps/Step4Rent";
import { Step5PF } from "./steps/Step5PF";
import { Step6Investments } from "./steps/Step6Investments";
import { Step7Health } from "./steps/Step7Health";
import { Step8NPS } from "./steps/Step8NPS";
import { Step9HomeLoan } from "./steps/Step9HomeLoan";
import { Step10OtherIncome } from "./steps/Step10OtherIncome";
import { Step11ProfTax } from "./steps/Step11ProfTax";
import { Step12Review } from "./steps/Step12Review";

function renderStep(step: number): ReactNode {
  switch (step) {
    case 1:  return <Step1Age />;
    case 2:  return <Step2Salary />;
    case 3:  return <Step3Basic />;
    case 4:  return <Step4Rent />;
    case 5:  return <Step5PF />;
    case 6:  return <Step6Investments />;
    case 7:  return <Step7Health />;
    case 8:  return <Step8NPS />;
    case 9:  return <Step9HomeLoan />;
    case 10: return <Step10OtherIncome />;
    case 11: return <Step11ProfTax />;
    case 12: return <Step12Review />;
    default: return null;
  }
}

export function WizardUI() {
  const { state } = useWizard();
  const [previewOpen, setPreviewOpen] = useState(false);

  return (
    <main
      style={{
        background: "var(--color-bg)",
        minHeight: "100vh",
        padding: "24px 16px 64px",
      }}
    >
      {/* Back to home */}
      <div style={{ maxWidth: 1100, margin: "0 auto 16px" }}>
        <a
          href="/"
          style={{
            fontSize: 13,
            color: "var(--color-text-muted)",
            textDecoration: "none",
          }}
        >
          ← Home
        </a>
      </div>

      <div
        className="wizard-layout"
        style={{ maxWidth: 1100, margin: "0 auto" }}
      >
        {/* Left: progress + question card */}
        <div>
          <ProgressBar
            current={state.currentStep}
            total={TOTAL_STEPS}
          />
          {renderStep(state.currentStep)}
        </div>

        {/* Right: live preview — desktop only */}
        <div className="preview-col">
          <LivePreviewPanel />
        </div>
      </div>

      {/* Mobile: floating preview button */}
      <button
        type="button"
        className="preview-fab"
        onClick={() => setPreviewOpen(true)}
        aria-label="Open tax preview"
      >
        📊 Preview
      </button>

      {/* Mobile: preview sheet */}
      {previewOpen && (
        <div className="preview-sheet-overlay" onClick={() => setPreviewOpen(false)}>
          <div
            className="preview-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                Live Tax Preview
              </span>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  fontFamily: "inherit",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
            <LivePreviewPanel />
          </div>
        </div>
      )}
    </main>
  );
}
