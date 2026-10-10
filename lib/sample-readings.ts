import { simulateSeries, type Event, type Reading, type TwinParams } from "@/lib/engine";

/** How much less insulin-sensitive the hidden "real" body is than the twin starts out. */
const HIDDEN_SENSITIVITY = 0.65;

// Mostly 2-3 hours after meals, where insulin sensitivity shows most clearly, plus a fasting value.
const READING_MINUTES = [450, 600, 660, 900, 990, 1320, 1380];
// Fixed glucometer-style scatter, in mg/dL, so the demo gives the same readings every time.
const NOISE_MG_DL = [2, -3, 3, -2, 3, -3, 2];

/**
 * Demo readings: simulate the same day with a hidden twin that is less insulin sensitive than
 * the real one, then add a little fixed noise. Calibration should then find that gap.
 * These are generated, not measured, and the page labels them as a demo.
 */
export function sampleReadings(params: TwinParams, events: Event[]): Reading[] {
  const hidden = { ...params, siMultiplier: params.siMultiplier * HIDDEN_SENSITIVITY };
  const series = simulateSeries(hidden, { events });
  return READING_MINUTES.map((minute, i) => ({
    minute,
    glucose: Math.round(series[minute].glucose + NOISE_MG_DL[i]),
  }));
}
