import type { Metrics } from "./types";

export type Verdict = "better" | "worse" | "same";

export type ComparisonRow = {
  key: "peak" | "timeInRange" | "hoursAbove180" | "mean";
  label: string;
  unit: string;
  /** Digits after the decimal point when showing this metric. */
  decimals: number;
  a: number;
  b: number;
  /** B minus A. */
  diff: number;
  /** Whether B is better, worse or about the same as A. */
  verdict: Verdict;
};

type MetricSpec = {
  key: ComparisonRow["key"];
  label: string;
  unit: string;
  decimals: number;
  read: (m: Metrics) => number;
  /** More time in range is good; for the others, lower is good. */
  higherIsBetter: boolean;
  /** Differences smaller than this count as "the same". */
  tolerance: number;
};

const SPECS: MetricSpec[] = [
  { key: "peak", label: "Peak", unit: "mg/dL", decimals: 0, read: (m) => m.peak, higherIsBetter: false, tolerance: 1 },
  { key: "timeInRange", label: "Time in range", unit: "%", decimals: 0, read: (m) => m.timeInRangePct, higherIsBetter: true, tolerance: 0.5 },
  { key: "hoursAbove180", label: "Above 180 mg/dL", unit: "h", decimals: 1, read: (m) => m.hoursAbove180, higherIsBetter: false, tolerance: 0.05 },
  { key: "mean", label: "Mean glucose", unit: "mg/dL", decimals: 0, read: (m) => m.mean, higherIsBetter: false, tolerance: 1 },
];

/** Line up the headline metrics of two days and judge whether B is better or worse than A. */
export function compareMetrics(a: Metrics, b: Metrics): ComparisonRow[] {
  return SPECS.map((spec) => {
    const valueA = spec.read(a);
    const valueB = spec.read(b);
    const diff = valueB - valueA;
    let verdict: Verdict = "same";
    if (Math.abs(diff) >= spec.tolerance) {
      verdict = diff > 0 === spec.higherIsBetter ? "better" : "worse";
    }
    return { key: spec.key, label: spec.label, unit: spec.unit, decimals: spec.decimals, a: valueA, b: valueB, diff, verdict };
  });
}

const PEAK_TOLERANCE = 1;
const RANGE_HOURS_TOLERANCE = 0.1;
const MEAN_TOLERANCE = 1;

/**
 * One plain sentence about what changed from A to B, built from the numbers with simple
 * templates: the change in peak, and the change in hours spent in range.
 */
export function summarizeComparison(a: Metrics, b: Metrics): string {
  const peakChange = b.peak - a.peak;
  const rangeHoursChange = ((b.timeInRangePct - a.timeInRangePct) / 100) * 24;
  const parts: string[] = [];
  let peakIsBetter = false;
  let rangeIsBetter = false;

  if (Math.abs(peakChange) >= PEAK_TOLERANCE) {
    peakIsBetter = peakChange < 0;
    const verb = peakIsBetter ? "lowers" : "raises";
    parts.push(`${verb} your peak by ${Math.abs(peakChange).toFixed(0)} mg/dL`);
  }
  if (Math.abs(rangeHoursChange) >= RANGE_HOURS_TOLERANCE) {
    rangeIsBetter = rangeHoursChange > 0;
    const hours = Math.abs(rangeHoursChange).toFixed(1);
    parts.push(rangeIsBetter ? `adds ${hours} hours in range` : `loses ${hours} hours in range`);
  }

  if (parts.length === 0) {
    const meanChange = b.mean - a.mean;
    if (Math.abs(meanChange) >= MEAN_TOLERANCE) {
      const verb = meanChange < 0 ? "lowers" : "raises";
      return `Scenario B ${verb} your average glucose by ${Math.abs(meanChange).toFixed(0)} mg/dL.`;
    }
    return "The two scenarios give almost the same result.";
  }
  // "but" when one change helps and the other hurts.
  const joiner = parts.length === 2 && peakIsBetter !== rangeIsBetter ? " but " : " and ";
  return `Scenario B ${parts.join(joiner)}.`;
}
