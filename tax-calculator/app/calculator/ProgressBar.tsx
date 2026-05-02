"use client";

interface Props {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: Props) {
  return (
    <div style={{ marginBottom: 28 }}>
      <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 8 }}>
        Step {current} of {total}
      </p>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: total }, (_, i) => {
          const n = i + 1;
          const done = n < current;
          const active = n === current;
          return (
            <div
              key={n}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background:
                  done || active
                    ? "var(--color-primary)"
                    : "var(--color-border)",
                opacity: active ? 1 : done ? 0.7 : 0.35,
                transition: "all 300ms ease",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
