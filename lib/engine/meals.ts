import type { MealEvent } from "./types";

/** Share of eaten carbohydrate that reaches the blood as glucose. */
const ABSORBED_FRACTION = 0.9;

/** Time to peak absorption (tmax, min) at the edges of the glycaemic index scale. */
const HIGH_GI = { gi: 70, tmax: 35 };
const LOW_GI = { gi: 55, tmax: 70 };

/**
 * How quickly a food's carbohydrate is absorbed. Fast (high-GI) foods peak at ~35 min,
 * slow (low-GI) foods at ~70 min; in between we interpolate linearly, so medium GI
 * (56-69) lands around 50 min.
 */
export function tmaxForGi(gi: number): number {
  if (gi >= HIGH_GI.gi) return HIGH_GI.tmax;
  if (gi <= LOW_GI.gi) return LOW_GI.tmax;
  const fraction = (gi - LOW_GI.gi) / (HIGH_GI.gi - LOW_GI.gi);
  return LOW_GI.tmax + fraction * (HIGH_GI.tmax - LOW_GI.tmax);
}

/**
 * Rate of glucose appearance in the blood from one meal, mg/min, at a given minute of the day.
 * Uses a gamma-shaped curve D * (t / tmax²) * e^(-t / tmax): it starts at zero, peaks at
 * t = tmax, then tails off. The area under the curve equals D, the total glucose absorbed.
 */
export function mealRa(minute: number, meal: MealEvent): number {
  const t = minute - meal.minute;
  if (t < 0) return 0;
  const absorbedMg = meal.carbsG * 1000 * ABSORBED_FRACTION;
  const tmax = tmaxForGi(meal.gi);
  return absorbedMg * (t / (tmax * tmax)) * Math.exp(-t / tmax);
}

/** Total glucose appearance from all meals at a given minute, mg/min. */
export function totalRa(minute: number, meals: MealEvent[]): number {
  let total = 0;
  for (const meal of meals) total += mealRa(minute, meal);
  return total;
}

/** Name of the meal for a time of day: before 10:00 breakfast, then lunch, snack, dinner. */
export function mealLabel(minute: number): string {
  if (minute < 600) return "Breakfast";
  if (minute < 900) return "Lunch";
  if (minute < 1080) return "Snack";
  return "Dinner";
}
