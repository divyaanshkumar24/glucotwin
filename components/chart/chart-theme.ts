import { formatClock } from "@/lib/day-events";

/** Shared look for every chart: quiet mono axis labels, a three-hour grid. */
export const AXIS_TICK = { fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-geist-mono)" };

export const X_TICKS = [0, 180, 360, 540, 720, 900, 1080, 1260, 1440];

/** "00", "03", ... "24" */
export function formatHourTick(minute: number): string {
  return String(minute / 60).padStart(2, "0");
}

export const TARGET_LOW = 70;
export const TARGET_HIGH = 180;

/** Y axis from 40 mg/dL up to a round number above the highest value. */
export function yDomain(maxGlucose: number, minGlucose = 70): { domain: [number, number]; ticks: number[] } {
  const top = Math.max(260, Math.ceil((maxGlucose + 10) / 20) * 20);
  const bottom = minGlucose < 60 ? 30 : 40;
  const ticks = [50, 100, 150, 200, 250, 300, 350, 400].filter((t) => t >= bottom && t <= top);
  return { domain: [bottom, top], ticks };
}

export function tooltipTime(minute: number): string {
  return formatClock(minute);
}

/** Every 5th minute is plenty for drawing and keeps the chart light. */
export function thin<T extends { minute: number }>(series: T[], everyMin = 5): T[] {
  return series.filter((p) => p.minute % everyMin === 0);
}
