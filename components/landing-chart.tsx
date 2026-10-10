"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TooltipContentProps } from "recharts";
import { AXIS_TICK } from "@/components/chart/chart-theme";
import { TargetBand } from "@/components/chart/target-lines";
import { formatClock } from "@/lib/day-events";
import type { DemoPoint } from "@/lib/landing-demo";

const X_TICKS = [1080, 1200, 1320, 1440];
const Y_TICKS = [150, 200, 250];

function DemoTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length || typeof label !== "number") return null;
  const value = (key: string) => Math.round(Number(payload.find((p) => p.dataKey === key)?.value));
  return (
    <div className="rounded-md border border-border bg-surface px-3 py-2 text-xs">
      <div className="font-mono text-muted">{formatClock(label)}</div>
      <div className="mt-1 flex justify-between gap-4">
        <span className="text-muted">Rice</span>
        <span className="font-mono">{value("rice")} mg/dL</span>
      </div>
      <div className="mt-0.5 flex justify-between gap-4">
        <span className="text-accent">Roti and walk</span>
        <span className="font-mono">{value("roti")} mg/dL</span>
      </div>
    </div>
  );
}

/** Two evening glucose curves from the engine: rice for dinner against roti and a short walk. */
export function LandingChart({ data }: { data: DemoPoint[] }) {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <span className="flex items-center gap-2 text-muted">
          <span aria-hidden className="h-0.5 w-4 bg-muted" />
          Rice at dinner
        </span>
        <span className="flex items-center gap-2 text-accent">
          <span aria-hidden className="h-0.5 w-4 bg-accent" />
          Roti and a 15-minute walk
        </span>
      </div>
      <div className="h-56 sm:h-64" role="img" aria-label="Line chart of evening glucose after dinner: rice against roti and a walk">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="var(--border)" vertical={false} />
            <TargetBand />
            <XAxis
              dataKey="minute"
              type="number"
              domain={[1080, 1440]}
              ticks={X_TICKS}
              tickFormatter={(minute: number) => String(minute / 60).padStart(2, "0")}
              tick={AXIS_TICK}
              stroke="var(--border)"
              tickLine={false}
            />
            <YAxis domain={[120, 270]} ticks={Y_TICKS} width={36} tick={AXIS_TICK} stroke="var(--border)" tickLine={false} allowDataOverflow />
            <Tooltip content={(props) => <DemoTooltip {...props} />} cursor={{ stroke: "var(--muted)", strokeOpacity: 0.4 }} />
            <Line type="monotone" dataKey="rice" stroke="var(--muted)" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="roti" stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
