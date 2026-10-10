"use client";

import { SelectField } from "@/components/ui/select-field";
import { TIME_STEP_MIN, formatClock } from "@/lib/day-events";

const DEFAULT_OPTIONS = timeOptions(TIME_STEP_MIN);

function timeOptions(stepMin: number) {
  const options = [];
  for (let minute = 0; minute < 1440; minute += stepMin) {
    options.push({ value: minute, label: formatClock(minute) });
  }
  return options;
}

const FIVE_MINUTE_OPTIONS = timeOptions(5);

type TimeSelectProps = {
  label?: string;
  value: number;
  onChange: (minute: number) => void;
  /** 15 (meals, walks, doses) or 5 (glucometer readings). */
  stepMin?: 5 | 15;
  hideLabel?: boolean;
  className?: string;
};

export function TimeSelect({ label = "Time", value, onChange, stepMin = 15, hideLabel, className }: TimeSelectProps) {
  const options = stepMin === 5 ? FIVE_MINUTE_OPTIONS : DEFAULT_OPTIONS;
  return (
    <SelectField
      label={label}
      value={value}
      options={options}
      onChange={onChange}
      hideLabel={hideLabel}
      className={className}
    />
  );
}
