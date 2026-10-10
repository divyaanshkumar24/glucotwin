import { Info } from "lucide-react";
import { SAFETY_MESSAGE, safetyReason, type Metrics } from "@/lib/engine";
import { ICON } from "@/lib/icon";

/** A calm, plain notice when the simulated day goes below 70 or above 300 mg/dL. */
export function SafetyNotice({ metrics }: { metrics: Metrics[] | Metrics }) {
  const list = Array.isArray(metrics) ? metrics : [metrics];
  const reason = list.map(safetyReason).find((r) => r !== null);
  if (!reason) return null;

  return (
    <div role="status" className="flex max-w-2xl gap-3 rounded-md border border-text bg-surface px-4 py-3">
      <Info {...ICON} aria-hidden className="mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium">{SAFETY_MESSAGE}</p>
        <p className="mt-0.5 text-sm text-muted">{reason}</p>
      </div>
    </div>
  );
}
