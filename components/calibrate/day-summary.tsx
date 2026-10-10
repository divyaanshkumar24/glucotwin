"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { describeItem, formatClock, groupEvents, totalCarbsG } from "@/lib/day-events";
import type { Event } from "@/lib/engine";
import { DAY_PRESETS } from "@/lib/presets";

type DaySummaryProps = {
  events: Event[];
  onChange: (events: Event[]) => void;
  onMetformin: boolean;
};

/** Step 1: the day the readings belong to. Shown read-only, with presets and a link to edit it. */
export function DaySummary({ events, onChange, onMetformin }: DaySummaryProps) {
  const items = groupEvents(events);
  return (
    <div>
      <p className="text-sm text-muted">
        The twin needs to know what happened that day. This is the day from the simulator.
      </p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm">Nothing planned yet.</p>
      ) : (
        <ul className="mt-3 max-w-xl divide-y divide-border rounded-md border border-border bg-surface text-sm">
          {items.map((item) => (
            <li key={item.key} className="flex items-baseline gap-3 px-3 py-2">
              <span className="w-11 shrink-0 font-mono">{formatClock(item.minute)}</span>
              <span className="min-w-0 flex-1">{describeItem(item)}</span>
              {item.type === "meal" && <span className="shrink-0 font-mono text-xs text-muted">{item.carbsG} g</span>}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted">
          <span className="font-mono">{totalCarbsG(events)}</span> g carbs.
        </span>
        {DAY_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant="secondary"
            className="h-8 px-3"
            onClick={() => onChange(preset.build(onMetformin))}
          >
            {preset.label}
          </Button>
        ))}
        <Link
          href="/simulator"
          className="rounded-sm text-sm text-muted underline decoration-border underline-offset-4 transition-colors duration-150 ease-out hover:text-text"
        >
          Edit in simulator
        </Link>
      </div>
    </div>
  );
}
