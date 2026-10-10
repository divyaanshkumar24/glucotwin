import type { TooltipContentProps } from "recharts";
import { formatClock, groupEvents, itemLabel, nearestItem } from "@/lib/day-events";
import type { Event } from "@/lib/engine";

type GlucoseTooltipProps = TooltipContentProps & { events: Event[] };

/** Hover card: the time, the glucose value and the closest meal, walk or dose. */
export function GlucoseTooltip({ active, payload, label, events }: GlucoseTooltipProps) {
  if (!active || !payload?.length || typeof label !== "number") return null;
  const glucose = Number(payload[0].value);
  const near = nearestItem(groupEvents(events), label);

  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
      <div className="font-mono text-muted">{formatClock(label)}</div>
      <div className="mt-0.5 font-mono text-sm font-medium">
        {Math.round(glucose)} <span className="font-normal text-muted">mg/dL</span>
      </div>
      {near && (
        <div className="mt-1 text-muted">
          {near.offsetMin === 0 ? (
            itemLabel(near.item)
          ) : (
            <>
              <span className="font-mono">{Math.abs(near.offsetMin)}</span> min{" "}
              {near.offsetMin > 0 ? "after" : "before"} {itemLabel(near.item).toLowerCase()}
            </>
          )}
        </div>
      )}
    </div>
  );
}
