"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, X_TICKS, formatHourTick, thin, yDomain } from "@/components/chart/chart-theme";
import { TargetBand } from "@/components/chart/target-lines";
import { formatClock } from "@/lib/day-events";
import type { Reading, SimPoint } from "@/lib/engine";
import type { TooltipContentProps } from "recharts";

type CalibrateChartProps = {
  before: SimPoint[];
  /** The curve after calibration (already animated), or null before calibrating. */
  after: SimPoint[] | null;
  readings: Reading[];
};

function CurveTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length || typeof label !== "number") return null;
  const rows = [
    { key: "before", name: "Before", color: "text-muted" },
    { key: "after", name: "After", color: "text-accent" },
  ];
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
      <div className="font-mono text-muted">{formatClock(label)}</div>
      {rows.map((row) => {
        const value = payload.find((p) => p.dataKey === row.key)?.value;
        if (value === undefined || value === null) return null;
        return (
          <div key={row.key} className="mt-1 flex items-baseline justify-between gap-4">
            <span className={row.color}>{row.name}</span>
            <span className="font-mono text-sm font-medium">
              {Math.round(Number(value))} <span className="text-xs font-normal text-muted">mg/dL</span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Readings as dots, the twin before calibration as a dashed grey line, and after in teal. */
export function CalibrateChart({ before, after, readings }: CalibrateChartProps) {
  const data = useMemo(
    () =>
      thin(before).map((point) => ({
        minute: point.minute,
        before: point.glucose,
        after: after ? after[point.minute].glucose : null,
      })),
    [before, after],
  );
  const values = [...before.map((p) => p.glucose), ...readings.map((r) => r.glucose), ...(after?.map((p) => p.glucose) ?? [])];
  const { domain, ticks } = yDomain(Math.max(...values), Math.min(...values));

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <span className="flex items-center gap-2">
          <span aria-hidden className="size-2.5 rounded-full border-[1.5px] border-text bg-surface" />
          Your readings
        </span>
        <span className="flex items-center gap-2 text-muted">
          <span aria-hidden className="w-4 border-t-2 border-dashed border-muted" />
          Twin before
        </span>
        <span className="flex items-center gap-2 text-accent">
          <span aria-hidden className="h-0.5 w-4 bg-accent" />
          Twin after
        </span>
      </div>
      <div className="h-64 sm:h-80" role="img" aria-label="Line chart of the twin before and after calibration, with your glucometer readings as dots">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <TargetBand />
            <XAxis
              dataKey="minute"
              type="number"
              domain={[0, 1440]}
              ticks={X_TICKS}
              tickFormatter={formatHourTick}
              tick={AXIS_TICK}
              stroke="var(--border)"
              tickLine={false}
            />
            <YAxis domain={domain} ticks={ticks} width={36} tick={AXIS_TICK} stroke="var(--border)" tickLine={false} allowDataOverflow />
            <Tooltip content={(props) => <CurveTooltip {...props} />} cursor={{ stroke: "var(--muted)", strokeOpacity: 0.4 }} />
            <Line
              type="monotone"
              dataKey="before"
              stroke="var(--muted)"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            <Line type="monotone" dataKey="after" stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} connectNulls={false} />
            {readings.map((reading, i) => (
              <ReferenceDot
                key={`${reading.minute}-${i}`}
                x={reading.minute}
                y={reading.glucose}
                r={4.5}
                fill="var(--surface)"
                stroke="var(--text)"
                strokeWidth={1.5}
                ifOverflow="visible"
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
