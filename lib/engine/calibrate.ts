import { simulateSeries } from "./model";
import type { CalibrationResult, Reading, Scenario, TwinParams } from "./types";

/** Range searched for both calibration multipliers. */
const MULTIPLIER_MIN = 0.3;
const MULTIPLIER_MAX = 2.5;
/** Points per axis in the first, coarse pass over the whole range. */
const COARSE_STEPS = 15;
/** Points per axis in each finer pass around the best point so far. */
const FINE_STEPS = 9;
/** Number of finer passes; each one zooms in around the previous best point. */
const FINE_PASSES = 2;
/**
 * Why we nudge beta towards 1: in the minimal model, insulin action depends on sensitivity
 * times secretion, so finger-stick glucose alone cannot tell "less sensitive" apart from
 * "releases less insulin" (telling them apart would need insulin measurements). We add a
 * small penalty, in mg/dL, for moving beta away from the profile estimate. The fit therefore
 * explains a mismatch mainly as a change in insulin sensitivity, the quantity that day-to-day
 * habits like activity, sleep and illness actually move.
 */
const BETA_PRIOR_WEIGHT = 4;

/** Root-mean-square error: the typical gap between the twin and the readings, mg/dL. */
function rmse(simulated: number[], readings: Reading[]): number {
  let sum = 0;
  readings.forEach((r, i) => (sum += (simulated[i] - r.glucose) ** 2));
  return Math.sqrt(sum / readings.length);
}

/** Mean absolute percentage error between the twin and the readings, %. */
function mape(simulated: number[], readings: Reading[]): number {
  let sum = 0;
  readings.forEach((r, i) => (sum += Math.abs(simulated[i] - r.glucose) / r.glucose));
  return (sum / readings.length) * 100;
}

/** The twin's glucose at each reading time. Only simulates as far as the last reading. */
function predictAtReadings(params: TwinParams, scenario: Scenario, readings: Reading[]): number[] {
  const lastMinute = Math.max(...readings.map((r) => Math.round(r.minute)));
  const series = simulateSeries(params, scenario, lastMinute);
  return readings.map((r) => series[Math.round(r.minute)].glucose);
}

/**
 * `steps` values spread evenly on a log scale between min and max. Log spacing treats
 * "half as sensitive" and "twice as sensitive" as equally far from 1.
 */
function logGrid(min: number, max: number, steps: number): number[] {
  const logMin = Math.log(min);
  const step = (Math.log(max) - logMin) / (steps - 1);
  return Array.from({ length: steps }, (_, i) => Math.exp(logMin + i * step));
}

/**
 * Fit the twin to real glucometer readings (the "learning" step). We try many combinations
 * of insulin sensitivity and beta-cell response, simulate the day for each, and keep the one
 * whose curve passes closest to the readings. A coarse grid finds the right neighbourhood,
 * then finer grids zoom in around the best point (coarse-to-fine search).
 */
export function calibrate(
  params: TwinParams,
  scenario: Scenario,
  readings: Reading[],
): CalibrationResult {
  if (readings.length === 0) throw new Error("Calibration needs at least one reading.");

  const score = (si: number, beta: number) => {
    const trial = { ...params, siMultiplier: si, betaMultiplier: beta };
    const fit = rmse(predictAtReadings(trial, scenario, readings), readings);
    return fit + BETA_PRIOR_WEIGHT * Math.log(beta) ** 2;
  };

  let best = { si: params.siMultiplier, beta: params.betaMultiplier, score: Infinity };
  const searchGrid = (siValues: number[], betaValues: number[]) => {
    for (const si of siValues) {
      for (const beta of betaValues) {
        const s = score(si, beta);
        if (s < best.score) best = { si, beta, score: s };
      }
    }
  };

  const coarse = logGrid(MULTIPLIER_MIN, MULTIPLIER_MAX, COARSE_STEPS);
  searchGrid(coarse, coarse);

  // Each finer pass spans one previous grid step either side of the best point.
  let ratio = Math.pow(MULTIPLIER_MAX / MULTIPLIER_MIN, 1 / (COARSE_STEPS - 1));
  for (let pass = 0; pass < FINE_PASSES; pass++) {
    const around = (centre: number) =>
      logGrid(
        Math.max(centre / ratio, MULTIPLIER_MIN),
        Math.min(centre * ratio, MULTIPLIER_MAX),
        FINE_STEPS,
      );
    searchGrid(around(best.si), around(best.beta));
    ratio = Math.pow(ratio, 2 / (FINE_STEPS - 1));
  }

  const fitted = { ...params, siMultiplier: best.si, betaMultiplier: best.beta };
  const after = predictAtReadings(fitted, scenario, readings);
  return {
    params: fitted,
    rmseBefore: rmse(predictAtReadings(params, scenario, readings), readings),
    rmseAfter: rmse(after, readings),
    accuracyPct: Math.min(Math.max(100 - mape(after, readings), 0), 100),
  };
}
