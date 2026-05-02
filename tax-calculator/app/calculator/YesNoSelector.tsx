"use client";

import { OptionButton } from "./OptionButton";

interface Props {
  value: boolean | undefined;
  onChange: (v: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
}

export function YesNoSelector({
  value,
  onChange,
  yesLabel = "Yes",
  noLabel = "No",
}: Props) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <OptionButton
        label={yesLabel}
        selected={value === true}
        onClick={() => onChange(true)}
      />
      <OptionButton
        label={noLabel}
        selected={value === false}
        onClick={() => onChange(false)}
      />
    </div>
  );
}
