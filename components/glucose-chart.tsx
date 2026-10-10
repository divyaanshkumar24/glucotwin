"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AXIS_TICK, X_TICKS, formatHourTick, thin, yDomain } from "@/components/chart/chart-theme";
import { EventMarkers } from "@/components/chart/event-markers";
import { GlucoseTooltip } from "@/components/chart/glucose-tooltip";
import { TargetBand } from "@/components/chart/target-lines";
import type { Event, SimPoint } from "@/lib/engine";

const DRAW_IN_MS = 700;

type GlucoseChartProps = {
  series: SimPoint[];
  events: Event[];
  highlightedEventId?: string | null;
};

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

/** True unless the user has asked their system to reduce motion. */
function motionAllowed() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The day's glucose curve. The line is teal in range, amber above 180 and red below 70:
 * one gradient with hard stops placed where those two values fall between the curve's
 * lowest and highest point. The curve draws in once when the page opens, then updates
 * instantly as events change.
 */
export function GlucoseChart({ series, events, highlightedEventId }: GlucoseChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const [drawIn, setDrawIn] = useState(motionAllowed);

  useEffect(() => {
    const timer = window.setTimeout(() => setDrawIn(false), DRAW_IN_MS + 100);
    return () => window.clearTimeout(timer);
  }, []);

  const data = useMemo(() => thin(series), [series]);
  const { min, max } = useMemo(() => {
    const values = series.map((p) => p.glucose);
    return { min: Math.min(...values), max: Math.max(...values) };
  }, [series]);
  const { domain, ticks } = yDomain(max, min);

  // A perfectly flat line has no height for a gradient to span, so it gets a plain colour.
  const flat = max - min < 0.5;
  const highStop = clamp01((max - 180) / (max - min));
  const lowStop = clamp01((max - 70) / (max - min));
  const flatColor = max > 180 ? "var(--high)" : min < 70 ? "var(--low)" : "var(--accent)";

  return (
    <div className="h-64 sm:h-80" role="img" aria-label="Line chart of simulated glucose over 24 hours">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset={0} stopColor="var(--high)" />
              <stop offset={highStop} stopColor="var(--high)" />
              <stop offset={highStop} stopColor="var(--accent)" />
              <stop offset={lowStop} stopColor="var(--accent)" />
              <stop offset={lowStop} stopColor="var(--low)" />
              <stop offset={1} stopColor="var(--low)" />
            </linearGradient>
          </defs>
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
          <YAxis
            domain={domain}
            ticks={ticks}
            width={36}
            tick={AXIS_TICK}
            stroke="var(--border)"
            tickLine={false}
            allowDataOverflow
          />
          <Tooltip
            content={(props) => <GlucoseTooltip {...props} events={events} />}
            cursor={{ stroke: "var(--muted)", strokeOpacity: 0.4 }}
          />
          <Line
            type="monotone"
            dataKey="glucose"
            stroke={flat ? flatColor : `url(#${gradientId})`}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, fill: "var(--surface)", stroke: "var(--text)", strokeWidth: 1.5 }}
            isAnimationActive={drawIn}
            animationDuration={DRAW_IN_MS}
            animationEasing="ease-out"
          />
          <EventMarkers events={events} highlightedEventId={highlightedEventId} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
