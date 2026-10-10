import type { TooltipContentProps } from "recharts";
import { formatClock } from "@/lib/day-events";

/** Hover card for the compare chart: the time and both scenarios' glucose. */
export function CompareTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length || typeof label !== "number") return null;
  const value = (key: string) => payload.find((p) => p.dataKey === key)?.value;
  const rows = [
    { name: "Scenario A", value: value("a"), color: "text-muted" },
    { name: "Scenario B", value: value("b"), color: "text-accent" },
  ];

  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
      <div className="font-mono text-muted">{formatClock(label)}</div>
      {rows.map((row) => (
        <div key={row.name} className="mt-1 flex items-baseline justify-between gap-4">
          <span className={row.color}>{row.name}</span>
          <span className="font-mono text-sm font-medium">
            {Math.round(Number(row.value))} <span className="text-xs font-normal text-muted">mg/dL</span>
          </span>
        </div>
      ))}
    </div>
  );
}
