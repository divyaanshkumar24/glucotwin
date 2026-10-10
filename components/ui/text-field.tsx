"use client";

import clsx from "clsx";
import { useId } from "react";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Shown inside the field, after the value, e.g. "kg". */
  unit?: string;
  helper?: string;
  error?: string;
  inputMode?: "numeric" | "decimal";
  /** Hide the label visually but keep it for screen readers (for table cells). */
  hideLabel?: boolean;
};

export function TextField({ label, value, onChange, unit, helper, error, inputMode, hideLabel }: TextFieldProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const describedBy = [helper && helperId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className={clsx("block text-sm font-medium", hideLabel && "sr-only")}>
        {label}
      </label>
      <div
        className={clsx(
          hideLabel ? "mt-0" : "mt-2",
          "flex h-10 items-center rounded-md border bg-surface transition-colors duration-150 ease-out focus-within:border-accent focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent",
          error ? "border-low" : "border-border",
        )}
      >
        <input
          id={id}
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-full min-w-0 flex-1 bg-transparent px-3 font-mono text-sm outline-none"
        />
        {unit && <span className="pr-3 font-mono text-sm text-muted">{unit}</span>}
      </div>
      {helper && (
        <p id={helperId} className="mt-1.5 text-xs text-muted">
          {helper}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-low">
          {error}
        </p>
      )}
    </div>
  );
}
