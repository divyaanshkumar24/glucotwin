"use client";

import clsx from "clsx";
import { useId } from "react";

export type SelectOption = { value: number; label: string };

type SelectFieldProps = {
  label: string;
  value: number;
  options: SelectOption[];
  onChange: (value: number) => void;
  /** Hide the label visually but keep it for screen readers. */
  hideLabel?: boolean;
  className?: string;
};

/** A native select with the same hairline look as the text fields. */
export function SelectField({ label, value, options, onChange, hideLabel, className }: SelectFieldProps) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className={clsx("block text-xs font-medium", hideLabel && "sr-only")}>
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={clsx(
          "h-9 w-full rounded-md border border-border bg-surface px-2 font-mono text-sm transition-colors duration-150 ease-out focus-visible:border-accent",
          !hideLabel && "mt-1.5",
        )}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
