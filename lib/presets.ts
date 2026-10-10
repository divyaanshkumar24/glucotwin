import type { Event, MealEvent } from "@/lib/engine";
import { foodById } from "@/lib/day-events";

/** Presets use fixed ids so the same preset always gives the same events. */
function meal(prefix: string, minute: number, foodId: string, portions: number): MealEvent {
  const food = foodById(foodId);
  if (!food) throw new Error(`Unknown food: ${foodId}`);
  return {
    type: "meal",
    id: `${prefix}-${minute}-${foodId}`,
    minute,
    foodId,
    portions,
    carbsG: food.carbsPerPortionG * portions,
    gi: food.gi,
  };
}

function walk(prefix: string, minute: number, durationMin: number): Event {
  return { type: "walk", id: `${prefix}-walk-${minute}`, minute, durationMin };
}

function metformin(prefix: string, minute: number): Event {
  return { type: "med", id: `${prefix}-met-${minute}`, minute, kind: "metformin" };
}

const BREAKFAST = 8 * 60;
const LUNCH = 13 * 60;
const SNACK = 17 * 60;
const DINNER = 20 * 60;

type DayOptions = {
  prefix: string;
  /** Add a metformin dose with breakfast. */
  metformin: boolean;
  dinnerStaple: "rice" | "roti";
  /** Walk after lunch. */
  lunchWalk: boolean;
  chai: "sweet" | "plain";
};

/** A typical weekday of Indian meals; options change one thing at a time for the compare presets. */
export function buildDay(options: DayOptions): Event[] {
  const p = options.prefix;
  const chai = options.chai === "sweet" ? "chai-sugar" : "chai-no-sugar";
  const events: Event[] = [
    meal(p, BREAKFAST, "poha", 1),
    meal(p, BREAKFAST, chai, 1),
    meal(p, LUNCH, "roti", 2),
    meal(p, LUNCH, "dal", 1),
    meal(p, LUNCH, "mixed-veg", 1),
    meal(p, LUNCH, "curd", 1),
    meal(p, SNACK, chai, 1),
    meal(p, SNACK, "biscuits", 1),
    meal(p, DINNER, options.dinnerStaple === "rice" ? "white-rice" : "roti", options.dinnerStaple === "rice" ? 1 : 2),
    meal(p, DINNER, "dal", 1),
    meal(p, DINNER, "paneer-sabzi", 1),
  ];
  if (options.metformin) events.push(metformin(p, BREAKFAST));
  if (options.lunchWalk) events.push(walk(p, LUNCH + 30, 15));
  return events;
}

export type DayPreset = { id: string; label: string; build: (onMetformin: boolean) => Event[] };

export const DAY_PRESETS: DayPreset[] = [
  {
    id: "typical",
    label: "Typical day",
    build: (onMetformin) =>
      buildDay({ prefix: "typical", metformin: onMetformin, dinnerStaple: "roti", lunchWalk: true, chai: "sweet" }),
  },
  {
    id: "heavy-dinner",
    label: "Heavy dinner",
    build: (onMetformin) => {
      const day = buildDay({ prefix: "heavy", metformin: onMetformin, dinnerStaple: "roti", lunchWalk: true, chai: "sweet" });
      // Replace the usual dinner with a late, large one and no walk.
      const kept = day.filter((e) => !(e.type === "meal" && e.minute === DINNER));
      const late = 21 * 60 + 30;
      return [
        ...kept,
        meal("heavy", late, "white-rice", 1.5),
        meal("heavy", late, "rajma", 1),
        meal("heavy", late, "paneer-sabzi", 1),
        meal("heavy", late, "gulab-jamun", 1),
      ];
    },
  },
  {
    id: "light-day",
    label: "Light day",
    build: (onMetformin) => {
      const p = "light";
      const events: Event[] = [
        meal(p, BREAKFAST, "besan-chilla", 2),
        meal(p, BREAKFAST, "curd", 1),
        meal(p, BREAKFAST, "chai-no-sugar", 1),
        meal(p, LUNCH, "roti", 2),
        meal(p, LUNCH, "dal", 1),
        meal(p, LUNCH, "mixed-veg", 1),
        meal(p, SNACK, "apple", 1),
        meal(p, SNACK, "chai-no-sugar", 1),
        meal(p, DINNER, "roti", 1),
        meal(p, DINNER, "dal", 1),
        meal(p, DINNER, "mixed-veg", 1),
        walk(p, LUNCH + 30, 20),
        walk(p, DINNER + 30, 20),
      ];
      if (onMetformin) events.push(metformin(p, BREAKFAST));
      return events;
    },
  },
];

export function typicalDay(onMetformin: boolean): Event[] {
  return DAY_PRESETS[0].build(onMetformin);
}
