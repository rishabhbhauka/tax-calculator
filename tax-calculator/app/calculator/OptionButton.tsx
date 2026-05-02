"use client";

interface Props {
  label: string;
  subLabel?: string;
  selected: boolean;
  onClick: () => void;
}

export function OptionButton({ label, subLabel, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        padding: "14px 16px",
        border: selected
          ? "2px solid var(--color-primary)"
          : "1.5px solid var(--color-border)",
        borderRadius: 12,
        background: selected
          ? "var(--color-primary-light)"
          : "var(--color-surface)",
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        transition: "border-color 120ms, background 120ms",
      }}
    >
      <span
        style={{
          fontSize: 15,
          fontWeight: 600,
          color: selected
            ? "var(--color-primary)"
            : "var(--color-text-primary)",
        }}
      >
        {label}
      </span>
      {subLabel && (
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>
          {subLabel}
        </span>
      )}
    </button>
  );
}
