import type { ActivityLevel, Profile, TwinParams } from "./types";

/**
 * Every tunable constant used to turn a profile into model parameters.
 * Values are population-level starting points; calibration then adjusts
 * the individual twin.
 */
export const DEFAULTS = {
  /** Fasting glucose sits a little below the 24 h average (meals pull the average up). */
  basalToAverageRatio: 0.85,
  basalGlucoseMin: 80,
  basalGlucoseMax: 220,

  /** Glucose distribution volume per kg of body weight, dL/kg. */
  glucoseVolumePerKg: 1.7,

  /** Glucose effectiveness: insulin-independent glucose uptake, /min. */
  p1: 0.028,
  /** Rate at which insulin's action on tissues fades, /min. */
  p2: 0.025,
  /**
   * Insulin sensitivity gain for a healthy adult at HbA1c 5.5 %, before T2D scaling.
   * Set to 2e-5 so that after scaling, a typical T2D profile (HbA1c 8 %, age 55) lands near
   * the textbook T2D value of ~1.3e-5. Starting from 1.3e-5 here gave a T2D twin whose
   * insulin barely moved glucose, which also made calibration unable to see sensitivity.
   */
  p3: 2e-5,
  /** Insulin clearance, /min (half-life about 5 min). */
  n: 0.14,
  /**
   * Beta-cell response for a healthy adult, (µU/mL)/min per mg/dL above threshold.
   * Tuned up from the textbook ~0.004: in the original Bergman model secretion also
   * grows with time since the meal, which we leave out. Without that extra factor,
   * 0.004 gave a post-meal insulin rise of only ~3 µU/mL, so insulin barely mattered.
   * 0.05 gives a rise of roughly 20-40 µU/mL after a meal, in line with clinical data.
   */
  gamma: 0.05,
  /** Basal insulin, µU/mL. */
  Ib: 10,

  /** HbA1c considered healthy; scaling starts from here, %. */
  healthyHba1c: 5.5,
  /** Insulin sensitivity falls by this fraction (exponentially) per HbA1c point above healthy. */
  sensitivityLossPerHba1c: 0.15,
  /** Beta-cell response falls by this fraction (linearly) per HbA1c point above healthy. */
  betaLossPerHba1c: 0.1,
  /** Lowest beta-cell response we allow, as a fraction of healthy. */
  betaFloor: 0.25,
  /** Regular activity improves insulin sensitivity. */
  activitySensitivity: { low: 0.85, moderate: 1, high: 1.15 } satisfies Record<ActivityLevel, number>,
  /** Insulin sensitivity drifts down slowly with age, per year past 40. */
  sensitivityLossPerYear: 0.004,
  /** Never let age alone reduce sensitivity below this fraction. */
  ageFactorFloor: 0.75,
};

/** ADA formula (Nathan et al., Diabetes Care 2008): estimated average glucose in mg/dL from HbA1c %. */
export function estimatedAverageGlucose(hba1c: number): number {
  return 28.7 * hba1c - 46.7;
}

/** Fasting glucose estimate: a little below the average, kept within a plausible range. */
function basalGlucose(hba1c: number): number {
  const raw = estimatedAverageGlucose(hba1c) * DEFAULTS.basalToAverageRatio;
  return clamp(raw, DEFAULTS.basalGlucoseMin, DEFAULTS.basalGlucoseMax);
}

/**
 * Insulin sensitivity relative to a healthy adult. Higher HbA1c means tissues respond
 * less to insulin (insulin resistance); regular activity improves it; age reduces it a little.
 */
function sensitivityScale(profile: Profile): number {
  const excessHba1c = Math.max(profile.hba1c - DEFAULTS.healthyHba1c, 0);
  const glycaemia = Math.exp(-DEFAULTS.sensitivityLossPerHba1c * excessHba1c);
  const activity = DEFAULTS.activitySensitivity[profile.activityLevel];
  const yearsPast40 = Math.max(profile.age - 40, 0);
  const age = Math.max(1 - DEFAULTS.sensitivityLossPerYear * yearsPast40, DEFAULTS.ageFactorFloor);
  return glycaemia * activity * age;
}

/** Beta-cell response relative to a healthy adult. In T2D the pancreas tires as HbA1c rises. */
function betaScale(hba1c: number): number {
  const excessHba1c = Math.max(hba1c - DEFAULTS.healthyHba1c, 0);
  return Math.max(1 - DEFAULTS.betaLossPerHba1c * excessHba1c, DEFAULTS.betaFloor);
}

/** Build a personal twin from a profile. Calibration multipliers start at 1 (no correction yet). */
export function createTwin(profile: Profile): TwinParams {
  const Gb = basalGlucose(profile.hba1c);
  return {
    Gb,
    p1: DEFAULTS.p1,
    p2: DEFAULTS.p2,
    p3: DEFAULTS.p3 * sensitivityScale(profile),
    n: DEFAULTS.n,
    gamma: DEFAULTS.gamma * betaScale(profile.hba1c),
    // Insulin release starts once glucose rises above the person's own fasting level.
    h: Gb,
    Ib: DEFAULTS.Ib,
    Vg: DEFAULTS.glucoseVolumePerKg * profile.weightKg,
    siMultiplier: 1,
    betaMultiplier: 1,
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
