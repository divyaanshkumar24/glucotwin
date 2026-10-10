import { FOODS } from "../data/foods";
import { mealLabel } from "./meals";
import { simulate } from "./model";
import type {
  Event,
  MealEvent,
  MedEvent,
  Profile,
  Scenario,
  SimPoint,
  SimResult,
  TwinParams,
  WalkEvent,
} from "./types";

/** All the foods eaten at one time of day, treated as one meal. */
export type MealGroup = {
  minute: number;
  /** "Breakfast", "Lunch", "Snack" or "Dinner". */
  name: string;
  events: MealEvent[];
  carbsG: number;
  /** Glycaemic load: carbs weighted by how fast they digest (carbs x GI / 100). */
  load: number;
  /** Carbs-weighted glycaemic index of the whole meal. */
  gi: number;
};

/** Everything a rule needs to know about the day. */
export type DayContext = {
  params: TwinParams;
  scenario: Scenario;
  profile: Profile;
  result: SimResult;
  meals: MealGroup[];
  walks: WalkEvent[];
  meds: MedEvent[];
};

const FOOD_BY_ID = new Map(FOODS.map((food) => [food.id, food]));

export function foodNameOf(foodId: string): string {
  return FOOD_BY_ID.get(foodId)?.name ?? "food";
}

/** "08:15" for minute 495. */
export function clock(minute: number): string {
  const hours = Math.floor(minute / 60);
  return `${String(hours).padStart(2, "0")}:${String(Math.round(minute % 60)).padStart(2, "0")}`;
}

/** Group meal events by time and work out each meal's carbs, load and average GI. */
function groupMeals(meals: MealEvent[]): MealGroup[] {
  const byMinute = new Map<number, MealEvent[]>();
  for (const meal of meals) byMinute.set(meal.minute, [...(byMinute.get(meal.minute) ?? []), meal]);
  return [...byMinute.entries()]
    .sort(([a], [b]) => a - b)
    .map(([minute, events]) => {
      const carbsG = events.reduce((sum, e) => sum + e.carbsG, 0);
      const load = events.reduce((sum, e) => sum + (e.carbsG * e.gi) / 100, 0);
      return { minute, name: mealLabel(minute), events, carbsG, load, gi: carbsG > 0 ? (load / carbsG) * 100 : 0 };
    });
}

export function buildContext(
  params: TwinParams,
  scenario: Scenario,
  profile: Profile,
  result: SimResult,
): DayContext {
  const meals = scenario.events.filter((e): e is MealEvent => e.type === "meal");
  return {
    params,
    scenario,
    profile,
    result,
    meals: groupMeals(meals),
    walks: scenario.events.filter((e): e is WalkEvent => e.type === "walk"),
    meds: scenario.events.filter((e): e is MedEvent => e.type === "med"),
  };
}

/** Run the day again with different events, to measure what a change would do. */
export function rerun(ctx: DayContext, events: Event[]): SimResult {
  return simulate(ctx.params, { events });
}

/** The highest glucose between two minutes of the day. */
export function windowPeak(series: SimPoint[], from: number, to: number): number {
  let peak = -Infinity;
  for (let minute = Math.max(from, 0); minute <= Math.min(to, series.length - 1); minute++) {
    peak = Math.max(peak, series[minute].glucose);
  }
  return peak;
}

/** Minutes between two times of day with glucose above 180 mg/dL. */
export function minutesAbove180(series: SimPoint[], from: number, to: number): number {
  let count = 0;
  for (let minute = Math.max(from, 0); minute <= Math.min(to, series.length - 1); minute++) {
    if (series[minute].glucose > 180) count++;
  }
  return count;
}

/** How much lower the highest glucose in the 3 hours after `from` would be with a change. */
export function peakDrop(ctx: DayContext, changed: SimResult, from: number, spanMin = 180): number {
  return windowPeak(ctx.result.series, from, from + spanMin) - windowPeak(changed.series, from, from + spanMin);
}

/** A change smaller than this (mg/dL) is not worth telling the user about. */
export const MIN_BENEFIT_MG_DL = 5;

export function plural(count: number, one: string, many: string): string {
  return `${Number(count.toFixed(2))} ${count === 1 ? one : many}`;
}

export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** A small, specific food swap and how to word it. */
export type Swap = {
  toFoodId: string;
  toPortions: (fromPortions: number) => number;
  /** Lower-case phrase, e.g. "swap 1 katori of rice for 2 rotis". */
  describe: (fromPortions: number) => string;
};

const RICE_TO_ROTI: Swap = {
  toFoodId: "roti",
  toPortions: (p) => p * 2,
  describe: (p) => `swap ${plural(p, "katori", "katori")} of rice for ${plural(p * 2, "roti", "rotis")}`,
};

/** Swaps worth suggesting, keyed by the food being replaced. */
export const SWAPS: Record<string, Swap> = {
  "white-rice": RICE_TO_ROTI,
  "jeera-rice": RICE_TO_ROTI,
  dosa: {
    toFoodId: "besan-chilla",
    toPortions: (p) => p * 2,
    describe: (p) => `swap ${plural(p, "dosa", "dosas")} for ${plural(p * 2, "besan chilla", "besan chillas")}`,
  },
  upma: {
    toFoodId: "besan-chilla",
    toPortions: (p) => p * 2,
    describe: (p) => `swap ${plural(p, "plate", "plates")} of upma for ${plural(p * 2, "besan chilla", "besan chillas")}`,
  },
  poha: {
    toFoodId: "oats",
    toPortions: (p) => p,
    describe: (p) => `swap ${plural(p, "plate", "plates")} of poha for ${plural(p, "bowl", "bowls")} of oats`,
  },
  "bread-slice": {
    toFoodId: "roti",
    toPortions: (p) => p,
    describe: (p) => `swap ${plural(p, "slice", "slices")} of white bread for ${plural(p, "roti", "rotis")}`,
  },
  "chai-sugar": {
    toFoodId: "chai-no-sugar",
    toPortions: (p) => p,
    describe: () => "have your chai without sugar",
  },
  "sweet-lassi": {
    toFoodId: "curd",
    toPortions: (p) => p,
    describe: () => "swap sweet lassi for plain curd",
  },
};

/** The events with one meal food replaced by its swap. */
export function applySwap(events: Event[], original: MealEvent, swap: Swap): Event[] {
  const food = FOOD_BY_ID.get(swap.toFoodId);
  if (!food) return events;
  const portions = swap.toPortions(original.portions);
  const replacement: MealEvent = {
    type: "meal",
    id: `${original.id}-swap`,
    minute: original.minute,
    foodId: food.id,
    portions,
    carbsG: food.carbsPerPortionG * portions,
    gi: food.gi,
  };
  return events.map((e) => (e.id === original.id ? replacement : e));
}

export type SwapSuggestion = { event: MealEvent; swap: Swap; benefit: number };

/**
 * Try each swappable food among `candidates` by re-running the day, and return the swap that
 * lowers the following peak the most (if it helps by at least MIN_BENEFIT_MG_DL).
 */
export function bestSwap(ctx: DayContext, candidates: MealEvent[]): SwapSuggestion | null {
  let best: SwapSuggestion | null = null;
  for (const event of candidates) {
    const swap = SWAPS[event.foodId];
    if (!swap) continue;
    const changed = rerun(ctx, applySwap(ctx.scenario.events, event, swap));
    const benefit = peakDrop(ctx, changed, event.minute);
    if (benefit >= MIN_BENEFIT_MG_DL && (!best || benefit > best.benefit)) best = { event, swap, benefit };
  }
  return best;
}

/** The meal most likely to have caused the day's peak: the heaviest load in the 2 hours before it. */
export function spikeMeal(ctx: DayContext): MealGroup | null {
  const { peak, peakMinute } = ctx.result.metrics;
  if (peak <= 180) return null;
  const before = ctx.meals.filter((m) => m.minute <= peakMinute && peakMinute - m.minute <= 120);
  return before.sort((a, b) => b.load - a.load)[0] ?? null;
}
