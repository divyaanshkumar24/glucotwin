import clsx from "clsx";
import { formatClock } from "@/lib/day-events";
import type { Metrics } from "@/lib/engine";

/** Colour a value only when it is outside the healthy range; healthy values stay plain. */
type Tone = "plain" | "high" | "low";

function peakTone(m: Metrics): Tone {
  return m.peak > 180 ? "high" : "plain";
}
function rangeTone(m: Metrics): Tone {
  // International consensus goal: more than 70 % of the day in 70-180 mg/dL.
  return m.timeInRangePct < 70 ? "high" : "plain";
}
function aboveTone(m: Metrics): Tone {
  return m.hoursAbove180 >= 0.1 ? "high" : "plain";
}
function lowestTone(m: Metrics): Tone {
  return m.lowest < 70 ? "low" : "plain";
}

const TONE_CLASS: Record<Tone, string> = { plain: "text-text", high: "text-high", low: "text-low" };

type StatProps = { label: string; value: string; unit: string; note?: string; tone: Tone };

function Stat({ label, value, unit, note, tone }: StatProps) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1">
        <span className={clsx("font-mono text-3xl font-medium tracking-tight", TONE_CLASS[tone])}>{value}</span>{" "}
        <span className="font-mono text-sm text-muted">{unit}</span>
        {note && <span className="mt-0.5 block font-mono text-xs text-muted">{note}</span>}
      </dd>
    </div>
  );
}

/** The four numbers that summarise a day. */
export function MetricsRow({ metrics }: { metrics: Metrics }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
      <Stat
        label="Peak"
        value={metrics.peak.toFixed(0)}
        unit="mg/dL"
        note={`at ${formatClock(metrics.peakMinute)}`}
        tone={peakTone(metrics)}
      />
      <Stat label="Time in range" value={metrics.timeInRangePct.toFixed(0)} unit="%" note="70-180 mg/dL" tone={rangeTone(metrics)} />
      <Stat label="Above 180 mg/dL" value={metrics.hoursAbove180.toFixed(1)} unit="h" tone={aboveTone(metrics)} />
      <Stat label="Lowest" value={metrics.lowest.toFixed(0)} unit="mg/dL" tone={lowestTone(metrics)} />
    </dl>
  );
}
