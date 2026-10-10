import { ChevronDown } from "lucide-react";
import { ICON } from "@/lib/icon";

/** Collapsible plain-English explanation, for anyone who wants to know what the button does. */
export function HowCalibrationWorks() {
  return (
    <details className="group max-w-2xl border-t border-border pt-6">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-sm text-sm font-semibold tracking-tight [&::-webkit-details-marker]:hidden">
        How calibration works
        <ChevronDown {...ICON} aria-hidden className="text-muted transition-transform duration-150 ease-out group-open:rotate-180" />
      </summary>
      <div className="mt-3 space-y-3 text-sm text-muted">
        <p>
          Your twin has two dials that differ from person to person: how strongly your body responds to insulin
          (insulin sensitivity), and how much insulin your pancreas releases when glucose rises (beta-cell response).
        </p>
        <p>
          When you enter readings, GlucoTwin tries many settings of the two dials. For each setting it simulates your
          day and measures how far the twin&apos;s curve is from your readings. A coarse search over the full range
          comes first, then finer searches around the best spot. The setting with the smallest error wins.
        </p>
        <p>
          Glucose readings alone cannot fully separate the two dials, so GlucoTwin prefers explanations that change
          insulin sensitivity and leaves beta-cell response close to its starting estimate. A few readings from one
          day fit that day well, but they may not describe every day.
        </p>
      </div>
    </details>
  );
}
