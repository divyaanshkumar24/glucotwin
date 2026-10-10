// Shared types for the GlucoTwin engine. Times are minutes since midnight (0..1440).

export type ActivityLevel = "low" | "moderate" | "high";

/** What the user tells us about themselves. */
export type Profile = {
  age: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  /** Glycated haemoglobin, %. Reflects average glucose over ~3 months. */
  hba1c: number;
  onMetformin: boolean;
};

/** Parameters of the Bergman minimal model for one person. */
export type TwinParams = {
  /** Basal (fasting) glucose, mg/dL. */
  Gb: number;
  /** Glucose effectiveness: how fast glucose returns to basal on its own, /min. */
  p1: number;
  /** How fast insulin's effect on tissues fades, /min. */
  p2: number;
  /** How strongly extra insulin builds up its effect (insulin sensitivity gain). */
  p3: number;
  /** Insulin clearance rate, /min. */
  n: number;
  /** Beta-cell response: insulin released per mg/dL of glucose above threshold. */
  gamma: number;
  /** Glucose level above which the pancreas releases extra insulin, mg/dL. */
  h: number;
  /** Basal insulin, µU/mL. */
  Ib: number;
  /** Glucose distribution volume, dL. */
  Vg: number;
  /** Calibration knob for insulin sensitivity (1 = profile estimate). */
  siMultiplier: number;
  /** Calibration knob for beta-cell response (1 = profile estimate). */
  betaMultiplier: number;
};

export type MealEvent = {
  type: "meal";
  id: string;
  minute: number;
  foodId: string;
  portions: number;
  carbsG: number;
  /** Glycaemic index, 0-100. */
  gi: number;
};

export type WalkEvent = {
  type: "walk";
  id: string;
  minute: number;
  durationMin: number;
};

export type MedEvent = {
  type: "med";
  id: string;
  minute: number;
  kind: "metformin";
};

export type Event = MealEvent | WalkEvent | MedEvent;

export type Scenario = {
  events: Event[];
};

export type SimPoint = {
  minute: number;
  /** mg/dL */
  glucose: number;
  /** µU/mL */
  insulin: number;
};

export type Metrics = {
  /** mg/dL */
  peak: number;
  peakMinute: number;
  /** mg/dL */
  mean: number;
  /** Share of the day spent in 70-180 mg/dL, %. */
  timeInRangePct: number;
  hoursAbove180: number;
  minutesBelow70: number;
  /** mg/dL */
  lowest: number;
};

export type SimResult = {
  series: SimPoint[];
  metrics: Metrics;
};

export type Reading = {
  minute: number;
  /** mg/dL */
  glucose: number;
};

export type CalibrationResult = {
  params: TwinParams;
  /** mg/dL */
  rmseBefore: number;
  /** mg/dL */
  rmseAfter: number;
  /** 100 minus mean absolute percentage error after fitting, clamped 0-100. */
  accuracyPct: number;
};
