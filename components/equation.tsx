import type { ReactNode } from "react";

/** A display equation in mono type. Scrolls sideways on narrow screens instead of wrapping. */
export function Equation({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div
      role="math"
      aria-label={label}
      className="overflow-x-auto whitespace-nowrap rounded-md border border-border bg-surface px-4 py-3 font-mono text-sm"
    >
      {children}
    </div>
  );
}

/** A variable name with a subscript, e.g. <V name="p" sub="1" /> for p₁. */
export function V({ name, sub }: { name: string; sub?: string }) {
  return (
    <i className="not-italic">
      <span className="italic">{name}</span>
      {sub && <sub className="text-[0.75em]">{sub}</sub>}
    </i>
  );
}
