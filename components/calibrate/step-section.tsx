import type { ReactNode } from "react";

type StepSectionProps = { number: number; title: string; children: ReactNode };

/** A numbered block of the calibrate page. The number is small and mono, not a stepper. */
export function StepSection({ number, title, children }: StepSectionProps) {
  const headingId = `step-${number}`;
  return (
    <section aria-labelledby={headingId} className="border-t border-border pt-6">
      <h2 id={headingId} className="flex items-baseline gap-3 text-lg font-semibold tracking-tight">
        <span className="font-mono text-sm font-normal text-muted">{number}</span>
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
