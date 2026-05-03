"use client";

import { useState } from "react";

export function SupportSection() {
  const [copied, setCopied] = useState(false);
  const upiId = "rishabhbhaukahuf@axisbank";

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(upiId);
      } else {
        const el = document.createElement("textarea");
        el.value = upiId;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // silent fail
    }
  };

  return (
    <section
      className="support-body"
      style={{
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        background: "var(--color-surface)",
        overflow: "hidden",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 16,
        textAlign: "center",
      }}
    >
      {/* QR Code */}
      <img
        src="/upi_qr.png"
        alt="UPI QR Code"
        className="support-qr"
        style={{
          width: 140,
          height: 140,
          borderRadius: 8,
          border: "1px solid var(--color-border)",
          display: "block",
        }}
      />

      {/* Text */}
      <p
        style={{
          fontSize: 13,
          color: "var(--color-text-secondary)",
          lineHeight: 1.65,
          margin: 0,
        }}
      >
        If this tool saved you some money, a small contribution keeps it
        running and helps me build more tools like this. Completely optional.
      </p>

      {/* UPI ID row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          background: "#F1F5F9",
          border: "1px solid var(--color-border)",
          borderRadius: 8,
          padding: "7px 12px",
          width: "100%",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--color-text-primary)",
            fontFamily: "monospace",
            letterSpacing: "0.01em",
          }}
        >
          {upiId}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: copied ? "#F0FDF4" : "var(--color-primary-light)",
            color: copied
              ? "var(--color-accent-green)"
              : "var(--color-primary)",
            border: `1px solid ${
              copied ? "var(--color-accent-green)" : "var(--color-primary)"
            }`,
            borderRadius: 6,
            padding: "3px 10px",
            fontSize: 12,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            transition: "all 150ms",
            flexShrink: 0,
          }}
        >
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
    </section>
  );
}
