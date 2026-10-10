import { totalRa } from "./meals";
import { metforminFactor, walkBoost, walkUptakeRate } from "./modifiers";
import type {
  MealEvent,
  MedEvent,
  Metrics,
  Scenario,
  SimPoint,
  SimResult,
  TwinParams,
  WalkEvent,
} from "./types";

export const MINUTES_PER_DAY = 1440;
/** Glucose never drops below this in the model; the body defends it with counter-regulation. */
const GLUCOSE_FLOOR = 40;
const TARGET_LOW = 70;
const TARGET_HIGH = 180;

/** The three quantities the Bergman minimal model tracks. */
type State = {
  /** Plasma glucose, mg/dL. */
  G: number;
  /** Insulin action in tissues ("remote insulin"), /min. */
  X: number;
  /** Plasma insulin, µU/mL. */
  I: number;
};

type EventsByType = { meals: MealEvent[]; walks: WalkEvent[]; meds: MedEvent[] };

/**
 * Bergman minimal model: how fast glucose, insulin action and insulin are changing right now.
 * - Glucose falls back towards basal on its own (p1), is pulled down further by insulin
 *   action X and by working muscles, and is pushed up by food absorbed from the gut (Ra / Vg).
 * - Insulin action X builds up when insulin is above basal and fades at rate p2.
 * - Insulin is cleared at rate n and released by the pancreas when glucose exceeds threshold h.
 */
function derivatives(minute: number, s: State, p: TwinParams, ev: EventsByType): State {
  const p3Eff = p.p3 * p.siMultiplier * walkBoost(minute, ev.walks);
  const gammaEff = p.gamma * p.betaMultiplier;
  const GbEff = p.Gb * metforminFactor(minute, ev.meds);
  const muscleUptake = walkUptakeRate(minute, ev.walks) * s.G;

  return {
    G: -(p.p1 + s.X) * s.G + p.p1 * GbEff + totalRa(minute, ev.meals) / p.Vg - muscleUptake,
    X: -p.p2 * s.X + p3Eff * (s.I - p.Ib),
    I: -p.n * (s.I - p.Ib) + gammaEff * Math.max(s.G - p.h, 0),
  };
}

/**
 * One classic 4th-order Runge-Kutta step of 1 minute. It samples the slope at the start,
 * twice at the midpoint and at the end, then takes a weighted average: far more accurate
 * than simply adding the starting slope.
 */
function rk4Step(minute: number, s: State, p: TwinParams, ev: EventsByType): State {
  const dt = 1;
  const k1 = derivatives(minute, s, p, ev);
  const k2 = derivatives(minute + dt / 2, advance(s, k1, dt / 2), p, ev);
  const k3 = derivatives(minute + dt / 2, advance(s, k2, dt / 2), p, ev);
  const k4 = derivatives(minute + dt, advance(s, k3, dt), p, ev);
  return {
    G: s.G + (dt / 6) * (k1.G + 2 * k2.G + 2 * k3.G + k4.G),
    X: s.X + (dt / 6) * (k1.X + 2 * k2.X + 2 * k3.X + k4.X),
    I: s.I + (dt / 6) * (k1.I + 2 * k2.I + 2 * k3.I + k4.I),
  };
}

/** Move a state forward by `h` minutes along slope `d`. */
function advance(s: State, d: State, h: number): State {
  return { G: s.G + h * d.G, X: s.X + h * d.X, I: s.I + h * d.I };
}

function splitEvents(scenario: Scenario): EventsByType {
  const ev: EventsByType = { meals: [], walks: [], meds: [] };
  for (const e of scenario.events) {
    if (e.type === "meal") ev.meals.push(e);
    else if (e.type === "walk") ev.walks.push(e);
    else ev.meds.push(e);
  }
  return ev;
}

/**
 * Run the twin minute by minute from midnight up to `endMinute`. The day starts at rest:
 * glucose at basal, no extra insulin action, insulin at basal.
 */
export function simulateSeries(
  params: TwinParams,
  scenario: Scenario,
  endMinute = MINUTES_PER_DAY,
): SimPoint[] {
  const ev = splitEvents(scenario);
  let state: State = { G: params.Gb, X: 0, I: params.Ib };
  const series: SimPoint[] = [{ minute: 0, glucose: state.G, insulin: state.I }];

  for (let minute = 0; minute < endMinute; minute++) {
    state = rk4Step(minute, state, params, ev);
    state.G = Math.max(state.G, GLUCOSE_FLOOR);
    series.push({ minute: minute + 1, glucose: state.G, insulin: state.I });
  }
  return series;
}

/** Simulate a full day and summarise it. */
export function simulate(params: TwinParams, scenario: Scenario): SimResult {
  const series = simulateSeries(params, scenario);
  return { series, metrics: computeMetrics(series) };
}

/**
 * Daily summary. Each point is one minute, so counting points gives minutes. Time in range
 * uses the standard clinical target of 70-180 mg/dL.
 */
export function computeMetrics(series: SimPoint[]): Metrics {
  let peak = -Infinity;
  let peakMinute = 0;
  let lowest = Infinity;
  let sum = 0;
  let inRange = 0;
  let above = 0;
  let below = 0;

  for (const { minute, glucose } of series) {
    if (glucose > peak) {
      peak = glucose;
      peakMinute = minute;
    }
    lowest = Math.min(lowest, glucose);
    sum += glucose;
    if (glucose > TARGET_HIGH) above++;
    else if (glucose < TARGET_LOW) below++;
    else inRange++;
  }

  return {
    peak,
    peakMinute,
    mean: sum / series.length,
    timeInRangePct: (inRange / series.length) * 100,
    hoursAbove180: above / 60,
    minutesBelow70: below,
    lowest,
  };
}
