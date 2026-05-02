"use client";

import { useState, useEffect } from "react";

interface Toggle {
  options: string[];
  selected: string;
  onChange: (opt: string) => void;
}

interface Props {
  value: number | null;
  onChange: (value: number | null) => void;
  prefix?: string;
  placeholder?: string;
  toggle?: Toggle;
  hint?: string;
  error?: string;
  warning?: string;
}

function fmt(n: number): string {
  return n.toLocaleString("en-IN");
}

function parse(s: string): number | null {
  const stripped = s.replace(/,/g, "").trim();
  if (!stripped) return null;
  const n = Number(stripped);
  return isNaN(n) ? null : Math.round(n);
}

export function NumberInput({
  value,
  onChange,
  prefix = "₹",
  placeholder,
  toggle,
  hint,
  error,
  warning,
}: Props) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState("");

  // Sync raw from external value changes (e.g. toggle switch)
  useEffect(() => {
    if (!focused) {
      setRaw(value != null && value !== 0 ? fmt(value) : "");
    }
  }, [value, focused]);

  const displayed = focused ? raw : value != null && value !== 0 ? fmt(value) : "";

  const handleFocus = () => {
    setFocused(true);
    setRaw(value != null && value !== 0 ? String(value) : "");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    // allow digits, commas, one decimal
    if (/^[\d,]*\.?\d*$/.test(next) || next === "") {
      setRaw(next);
      onChange(parse(next));
    }
  };

  const handleBlur = () => {
    setFocused(false);
    const n = parse(raw);
    setRaw(n != null && n !== 0 ? fmt(n) : "");
  };

  const hasError = Boolean(error);
  const hasWarning = Boolean(warning) && !hasError;

  return (
    <div>
      {toggle && (
        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          {toggle.options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggle.onChange(opt)}
              style={{
                padding: "4px 14px",
                fontSize: 12,
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontWeight: toggle.selected === opt ? 600 : 400,
                background:
                  toggle.selected === opt
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                color:
                  toggle.selected === opt ? "#fff" : "var(--color-text-secondary)",
                transition: "background 120ms",
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          border: hasError
            ? "1.5px solid #EF4444"
            : hasWarning
            ? "1.5px solid var(--color-accent-amber)"
            : focused
            ? "1.5px solid var(--color-primary)"
            : "1.5px solid var(--color-border)",
          borderRadius: "var(--radius-input)",
          background: "var(--color-surface)",
          overflow: "hidden",
          transition: "border-color 150ms",
        }}
      >
        {prefix && (
          <span
            style={{
              padding: "0 12px",
              fontSize: 16,
              fontWeight: 600,
              color: "var(--color-text-secondary)",
              borderRight: "1px solid var(--color-border)",
              display: "flex",
              alignItems: "center",
              background: "#FAFAFA",
            }}
          >
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={displayed}
          placeholder={placeholder}
          onFocus={handleFocus}
          onChange={handleChange}
          onBlur={handleBlur}
          style={{
            flex: 1,
            padding: "13px 14px",
            fontSize: 18,
            fontWeight: 600,
            border: "none",
            outline: "none",
            color: "var(--color-text-primary)",
            background: "transparent",
            width: "100%",
            fontFamily: "inherit",
          }}
        />
      </div>

      {error && (
        <p style={{ fontSize: 12, color: "#EF4444", marginTop: 6 }}>{error}</p>
      )}
      {hasWarning && (
        <p
          style={{
            fontSize: 12,
            color: "var(--color-accent-amber)",
            marginTop: 6,
          }}
        >
          {warning}
        </p>
      )}
      {hint && !error && !warning && (
        <p
          style={{ fontSize: 12, color: "var(--color-text-muted)", marginTop: 6 }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}
