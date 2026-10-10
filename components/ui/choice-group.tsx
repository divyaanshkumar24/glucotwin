"use client";

import clsx from "clsx";
import { useId } from "react";

export type Choice<T> = { value: T; label: string; description?: string };

type ChoiceGroupProps<T> = {
  label: string;
  choices: Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
  /** Lay choices out in a row from this many columns on wider screens. */
  columns: 2 | 3;
};

/** A set of radio choices drawn as bordered segments. Keyboard: arrow keys move the choice. */
export function ChoiceGroup<T extends string | boolean>({
  label,
  choices,
  value,
  onChange,
  error,
  columns,
}: ChoiceGroupProps<T>) {
  const name = useId();
  const errorId = `${name}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      <legend className="text-sm font-medium">{label}</legend>
      <div
        className={clsx(
          "mt-2 grid gap-2",
          columns === 3 ? "sm:grid-cols-3" : "grid-cols-2 sm:max-w-sm",
        )}
      >
        {choices.map((choice) => {
          const selected = choice.value === value;
          return (
            <label
              key={String(choice.value)}
              className={clsx(
                "flex cursor-pointer gap-3 rounded-md border bg-surface px-3 py-2.5 transition-colors duration-150 ease-out has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-accent",
                selected ? "border-accent" : error ? "border-low" : "border-border hover:border-muted",
              )}
            >
              <input
                type="radio"
                name={name}
                checked={selected}
                onChange={() => onChange(choice.value)}
                className="sr-only"
              />
              <span
                aria-hidden
                className={clsx(
                  "mt-0.5 size-3.5 shrink-0 rounded-full border transition-[border-width,border-color] duration-150 ease-out",
                  selected ? "border-[4px] border-accent" : "border-border",
                )}
              />
              <span>
                <span className={clsx("block text-sm", selected && "font-medium")}>{choice.label}</span>
                {choice.description && (
                  <span className="mt-0.5 block text-xs text-muted">{choice.description}</span>
                )}
              </span>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs text-low">
          {error}
        </p>
      )}
    </fieldset>
  );
}
