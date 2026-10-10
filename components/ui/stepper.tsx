"use client";

import { Minus, Plus } from "lucide-react";
import { ICON } from "@/lib/icon";
import { formatPortions } from "@/lib/day-events";

type StepperProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Text after the value, e.g. "portions". */
  unit?: string;
};

const buttonClass =
  "inline-flex size-9 items-center justify-center text-muted transition-colors duration-150 ease-out hover:text-text disabled:pointer-events-none disabled:opacity-40";

/** Portion stepper: minus, value, plus. Changes by `step` (0.5 for portions). */
export function Stepper({ label, value, onChange, min = 0.5, max = 10, step = 0.5, unit }: StepperProps) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-md border border-border bg-surface">
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        className={buttonClass}
        disabled={value - step < min}
        onClick={() => onChange(value - step)}
      >
        <Minus {...ICON} />
      </button>
      <span className="min-w-14 px-1 text-center font-mono text-sm" aria-live="polite">
        {formatPortions(value)}
        {unit && <span className="text-muted"> {unit}</span>}
      </span>
      <button
        type="button"
        aria-label={`Increase ${label}`}
        className={buttonClass}
        disabled={value + step > max}
        onClick={() => onChange(value + step)}
      >
        <Plus {...ICON} />
      </button>
    </div>
  );
}
