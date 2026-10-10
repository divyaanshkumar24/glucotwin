"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { createTwin, simulate, type Scenario } from "@/lib/engine";

const twin = createTwin({
  age: 55,
  weightKg: 80,
  activityLevel: "moderate",
  hba1c: 8,
  onMetformin: true,
});

const scenario: Scenario = {
  events: [
    { type: "med", id: "met", minute: 450, kind: "metformin" },
    { type: "meal", id: "breakfast", minute: 480, foodId: "white-bread", portions: 2, carbsG: 60, gi: 75 },
    { type: "walk", id: "walk", minute: 480, durationMin: 15 },
    { type: "meal", id: "lunch", minute: 780, foodId: "lentils", portions: 1, carbsG: 50, gi: 35 },
  ],
};

const result = simulate(twin, scenario);
// One point every 5 minutes is plenty for the chart.
const data = result.series.filter((p) => p.minute % 5 === 0);

function clock(minute: number) {
  const h = Math.floor(minute / 60) % 24;
  return `${String(h).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

const axisTick = { fill: "var(--muted)", fontSize: 12, fontFamily: "var(--font-geist-mono)" };

export function EngineCheckChart() {
  const m = result.metrics;
  const rows: [string, string, string][] = [
    ["Peak", m.peak.toFixed(0), `mg/dL at ${clock(m.peakMinute)}`],
    ["Mean", m.mean.toFixed(0), "mg/dL"],
    ["Lowest", m.lowest.toFixed(0), "mg/dL"],
    ["Time in range", m.timeInRangePct.toFixed(0), "%"],
    ["Above 180", m.hoursAbove180.toFixed(1), "h"],
    ["Below 70", m.minutesBelow70.toFixed(0), "min"],
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-surface p-4">
        <div className="mb-4 flex items-center gap-2 text-sm">
          <span className="font-medium">HbA1c 8 %, 80 kg</span>
          <span className="rounded-sm border border-border px-1.5 py-0.5 text-xs text-muted">
            Demo
          </span>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <ReferenceArea y1={70} y2={180} fill="var(--target-band)" fillOpacity={1} />
              <XAxis
                dataKey="minute"
                type="number"
                domain={[0, 1440]}
                ticks={[0, 180, 360, 540, 720, 900, 1080, 1260, 1440]}
                tickFormatter={clock}
                tick={axisTick}
                stroke="var(--border)"
              />
              <YAxis domain={[40, 300]} ticks={[40, 70, 140, 180, 250, 300]} tick={axisTick} stroke="var(--border)" />
              <Line
                dataKey="glucose"
                stroke="var(--accent)"
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm sm:grid-cols-3">
        {rows.map(([label, value, unit]) => (
          <div key={label}>
            <dt className="text-muted">{label}</dt>
            <dd className="font-mono">
              {value} <span className="text-muted">{unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
