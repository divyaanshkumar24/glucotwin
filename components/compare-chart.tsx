"use client";

import { useMemo } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CompareTooltip } from "@/components/chart/compare-tooltip";
import { AXIS_TICK, X_TICKS, formatHourTick, thin, yDomain } from "@/components/chart/chart-theme";
import { TargetBand } from "@/components/chart/target-lines";
import type { SimPoint } from "@/lib/engine";

type CompareChartProps = { a: SimPoint[]; b: SimPoint[] };

/** Scenario A as a muted grey line, scenario B in teal, over the same target band. */
export function CompareChart({ a, b }: CompareChartProps) {
  const data = useMemo(
    () => thin(a).map((point) => ({ minute: point.minute, a: point.glucose, b: b[point.minute].glucose })),
    [a, b],
  );
  const values = data.flatMap((p) => [p.a, p.b]);
  const { domain, ticks } = yDomain(Math.max(...values), Math.min(...values));

  return (
    <div>
      <div className="mb-3 flex items-center gap-5 text-sm">
        <span className="flex items-center gap-2 text-muted">
          <span aria-hidden className="h-0.5 w-4 bg-muted" />
          Scenario A
        </span>
        <span className="flex items-center gap-2 text-accent">
          <span aria-hidden className="h-0.5 w-4 bg-accent" />
          Scenario B
        </span>
      </div>
      <div className="h-64 sm:h-80" role="img" aria-label="Line chart comparing glucose over 24 hours in scenarios A and B">
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
            <Tooltip content={(props) => <CompareTooltip {...props} />} cursor={{ stroke: "var(--muted)", strokeOpacity: 0.4 }} />
            <Line type="monotone" dataKey="a" stroke="var(--muted)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="b" stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
