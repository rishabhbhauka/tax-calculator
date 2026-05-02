"use client";

import { useState, type ReactNode } from "react";

export interface FAQ {
  question: string;
  answer: string;
}

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
  faqs?: FAQ[];
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  isSkippable?: boolean;
  canProceed?: boolean;
  nextLabel?: string;
  skipLabel?: string;
}

export function WizardCard({
  title,
  subtitle,
  children,
  faqs = [],
  onNext,
  onBack,
  onSkip,
  isSkippable = false,
  canProceed = true,
  nextLabel = "Next →",
  skipLabel = "Skip — I'll estimate this",
}: Props) {
  const [faqOpen, setFaqOpen] = useState(false);

  return (
    <div
      style={{
        background: "var(--color-surface)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--color-border)",
        padding: "32px",
      }}
    >
      <h2
        style={{
          fontSize: 22,
          fontWeight: 600,
          color: "var(--color-text-primary)",
          lineHeight: 1.3,
          marginBottom: subtitle ? 8 : 24,
        }}
      >
        {title}
      </h2>

      {subtitle && (
        <p
          style={{
            fontSize: 14,
            color: "var(--color-text-secondary)",
            lineHeight: 1.7,
            marginBottom: 24,
          }}
        >
          {subtitle}
        </p>
      )}

      <div style={{ marginBottom: 24 }}>{children}</div>

      {/* FAQ accordion */}
      {faqs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            onClick={() => setFaqOpen((v) => !v)}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: 13,
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>❓ Common doubts</span>
            <span
              style={{
                display: "inline-block",
                transition: "transform 180ms",
                transform: faqOpen ? "rotate(180deg)" : "none",
              }}
            >
              ▾
            </span>
          </button>
          {faqOpen && (
            <div
              style={{
                marginTop: 12,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "12px 14px",
                background: "#F8FAFC",
                borderRadius: 10,
                border: "1px solid var(--color-border)",
              }}
            >
              {faqs.map((faq) => (
                <div key={faq.question}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      marginBottom: 3,
                    }}
                  >
                    {faq.question}
                  </p>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Skip link */}
      {isSkippable && onSkip && (
        <div style={{ marginBottom: 16 }}>
          <button
            type="button"
            onClick={onSkip}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer",
              fontSize: 13,
              color: "var(--color-text-muted)",
              textDecoration: "underline",
            }}
          >
            {skipLabel}
          </button>
        </div>
      )}

      {/* Navigation */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 4,
        }}
      >
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "none",
              border: "1.5px solid var(--color-border)",
              borderRadius: "var(--radius-button)",
              padding: "10px 20px",
              cursor: "pointer",
              fontSize: 14,
              color: "var(--color-text-secondary)",
              fontFamily: "inherit",
            }}
          >
            ← Back
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={canProceed ? onNext : undefined}
          disabled={!canProceed}
          style={{
            background: canProceed ? "var(--color-primary)" : "var(--color-border)",
            color: canProceed ? "#fff" : "var(--color-text-muted)",
            border: "none",
            borderRadius: "var(--radius-button)",
            padding: "11px 26px",
            cursor: canProceed ? "pointer" : "not-allowed",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "inherit",
            transition: "background 150ms, transform 120ms",
          }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
