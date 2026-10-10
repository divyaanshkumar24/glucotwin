import type { MedEvent, WalkEvent } from "./types";

/**
 * Walking. Working muscles take up glucose two ways:
 * 1. Directly, without needing insulin (contraction moves GLUT4 transporters to the cell
 *    surface). We model this as extra first-order glucose uptake while the walk lasts, so a
 *    longer walk removes proportionally more glucose.
 * 2. By becoming more sensitive to insulin, an effect that outlasts the walk itself.
 */
export const WALK = {
  /** Insulin sensitivity multiplier while walking. */
  peakSensitivityBoost: 1.6,
  /** After the walk the extra sensitivity decays exponentially with this time constant, min. */
  boostDecayMin: 30,
  /** The after-effect is ignored beyond this many minutes after the walk ends. */
  afterEffectMin: 90,
  /**
   * Extra insulin-independent glucose uptake while walking, /min (fraction of G per minute).
   * 0.008 means ~1.4 mg/dL per minute at 170 mg/dL, about 2.4 mg/kg/min of muscle uptake,
   * within the 2-4 mg/kg/min reported for brisk walking. An earlier 0.004 cut the peak of a
   * post-meal walk by only ~4 mg/dL, smaller than studies of post-meal walks report.
   */
  directUptakeRate: 0.008,
};

/**
 * Metformin mainly lowers glucose by making the liver release less of it. We model this as a
 * reduction of the basal glucose the body settles towards.
 */
export const METFORMIN = {
  /** Largest reduction in liver glucose output, as a fraction. */
  maxReduction: 0.12,
  /** Time to reach full effect, min. */
  rampInMin: 120,
  /** Time from dose until the effect starts wearing off, min. */
  durationMin: 600,
  /** Time to wear off fully after that, min. */
  rampOutMin: 120,
};

/** Multiplier on insulin sensitivity at a given minute: 1.6x during a walk, fading over the next 90 min. */
export function walkBoost(minute: number, walks: WalkEvent[]): number {
  let boost = 1;
  for (const walk of walks) {
    const end = walk.minute + walk.durationMin;
    let thisBoost = 1;
    if (minute >= walk.minute && minute < end) {
      thisBoost = WALK.peakSensitivityBoost;
    } else if (minute >= end && minute < end + WALK.afterEffectMin) {
      const extra = WALK.peakSensitivityBoost - 1;
      thisBoost = 1 + extra * Math.exp(-(minute - end) / WALK.boostDecayMin);
    }
    // Overlapping walks do not stack; the strongest effect wins.
    boost = Math.max(boost, thisBoost);
  }
  return boost;
}

/** Extra glucose uptake rate (/min) from muscles that are working right now. */
export function walkUptakeRate(minute: number, walks: WalkEvent[]): number {
  for (const walk of walks) {
    if (minute >= walk.minute && minute < walk.minute + walk.durationMin) {
      return WALK.directUptakeRate;
    }
  }
  return 0;
}

/**
 * Multiplier on basal glucose from metformin: ramps from 1 down to 0.88 over 2 hours after a
 * dose, holds until 10 hours, then wears off over 2 hours. Doses do not stack.
 */
export function metforminFactor(minute: number, meds: MedEvent[]): number {
  let strongest = 0;
  for (const med of meds) {
    const t = minute - med.minute;
    strongest = Math.max(strongest, metforminEffect(t));
  }
  return 1 - METFORMIN.maxReduction * strongest;
}

/** Fraction (0..1) of full metformin effect, t minutes after one dose. */
function metforminEffect(t: number): number {
  const { rampInMin, durationMin, rampOutMin } = METFORMIN;
  if (t < 0) return 0;
  if (t < rampInMin) return t / rampInMin;
  if (t < durationMin) return 1;
  if (t < durationMin + rampOutMin) return 1 - (t - durationMin) / rampOutMin;
  return 0;
}
