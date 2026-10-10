import { FOODS, type Food } from "@/lib/data/foods";
import type { Event, MealEvent, MedEvent, WalkEvent } from "@/lib/engine";

/** Meal, walk and medication times are chosen in steps of this many minutes. */
export const TIME_STEP_MIN = 15;
export const WALK_DURATIONS_MIN = [10, 15, 20, 30] as const;

const FOODS_BY_ID = new Map(FOODS.map((food) => [food.id, food]));

export function foodById(id: string): Food | undefined {
  return FOODS_BY_ID.get(id);
}

let idCounter = 0;
/** A short id that is unique within this browser session and across reloads. */
export function newEventId(): string {
  idCounter += 1;
  return `ev-${Date.now().toString(36)}-${idCounter}`;
}

/** "08:15" for minute 495. Minute 1440 reads "24:00" so chart axes can end on it. */
export function formatClock(minute: number): string {
  const hours = Math.floor(minute / 60);
  const mins = Math.round(minute % 60);
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

/** 1 -> "1", 1.5 -> "1.5" */
export function formatPortions(portions: number): string {
  return String(Number(portions.toFixed(2)));
}

/** One row of the day: all foods eaten at one time, or a single walk or dose. */
export type DayItem = {
  /** Stable key for lists: type plus time. */
  key: string;
  type: Event["type"];
  minute: number;
  events: Event[];
  /** Only for meals: total carbohydrate eaten at this time. */
  carbsG: number;
};

const TYPE_ORDER: Record<Event["type"], number> = { med: 0, meal: 1, walk: 2 };

/** Group the flat event list into rows for display, in time order. Foods at one time form one meal. */
export function groupEvents(events: Event[]): DayItem[] {
  const items = new Map<string, DayItem>();
  for (const event of events) {
    // Walks and doses are listed one by one; meals at the same minute are merged.
    const key = event.type === "meal" ? `meal-${event.minute}` : `${event.type}-${event.id}`;
    const item = items.get(key) ?? { key, type: event.type, minute: event.minute, events: [], carbsG: 0 };
    item.events.push(event);
    if (event.type === "meal") item.carbsG += event.carbsG;
    items.set(key, item);
  }
  return [...items.values()].sort(
    (a, b) => a.minute - b.minute || TYPE_ORDER[a.type] - TYPE_ORDER[b.type],
  );
}

export function totalCarbsG(events: Event[]): number {
  return events.reduce((sum, e) => (e.type === "meal" ? sum + e.carbsG : sum), 0);
}

function mealEvent(minute: number, food: Food, portions: number): MealEvent {
  return {
    type: "meal",
    id: newEventId(),
    minute,
    foodId: food.id,
    portions,
    carbsG: food.carbsPerPortionG * portions,
    gi: food.gi,
  };
}

/** Add a food to the meal at `minute`; the same food at the same time just adds portions. */
export function addFood(events: Event[], minute: number, food: Food, portions: number): Event[] {
  const existing = events.find((e) => e.type === "meal" && e.minute === minute && e.foodId === food.id);
  if (!existing) return [...events, mealEvent(minute, food, portions)];
  return setPortions(events, existing.id, (existing as MealEvent).portions + portions);
}

/** Change a food's portions; zero or less removes it. */
export function setPortions(events: Event[], id: string, portions: number): Event[] {
  if (portions <= 0) return removeEvents(events, [id]);
  return events.map((e) => {
    if (e.type !== "meal" || e.id !== id) return e;
    const food = foodById(e.foodId);
    return { ...e, portions, carbsG: (food?.carbsPerPortionG ?? e.carbsG / e.portions) * portions };
  });
}

export function addWalk(events: Event[], minute: number, durationMin: number): Event[] {
  const walk: WalkEvent = { type: "walk", id: newEventId(), minute, durationMin };
  return [...events, walk];
}

export function addMetformin(events: Event[], minute: number): Event[] {
  const dose: MedEvent = { type: "med", id: newEventId(), minute, kind: "metformin" };
  return [...events, dose];
}

export function setWalkDuration(events: Event[], id: string, durationMin: number): Event[] {
  return events.map((e) => (e.type === "walk" && e.id === id ? { ...e, durationMin } : e));
}

/** Move events (all foods of a meal, or one walk or dose) to a new time. */
export function moveEvents(events: Event[], ids: string[], minute: number): Event[] {
  return events.map((e) => (ids.includes(e.id) ? { ...e, minute } : e));
}

export function removeEvents(events: Event[], ids: string[]): Event[] {
  return events.filter((e) => !ids.includes(e.id));
}

/** Plain-language description of a row, e.g. "2 × Roti / chapati, 1 × Dal (toor / moong)". */
export function describeItem(item: DayItem): string {
  if (item.type === "walk") {
    const walk = item.events[0] as WalkEvent;
    return `Walk, ${walk.durationMin} min`;
  }
  if (item.type === "med") return "Metformin";
  return item.events
    .map((e) => {
      const meal = e as MealEvent;
      return `${formatPortions(meal.portions)} × ${foodById(meal.foodId)?.name ?? "Food"}`;
    })
    .join(", ");
}

/** Short label for the kind of meal, from the time of day. */
export function mealName(minute: number): string {
  if (minute < 600) return "Breakfast";
  if (minute < 900) return "Lunch";
  if (minute < 1080) return "Snack";
  return "Dinner";
}

/** Guard for data read back from localStorage. */
export function isEventArray(value: unknown): value is Event[] {
  return (
    Array.isArray(value) &&
    value.every(
      (e) =>
        typeof e === "object" &&
        e !== null &&
        typeof e.id === "string" &&
        typeof e.minute === "number" &&
        (e.type === "meal" || e.type === "walk" || e.type === "med"),
    )
  );
}

/** What to call a row in the chart tooltip: "Lunch", "Walk" or "Metformin". */
export function itemLabel(item: DayItem): string {
  if (item.type === "meal") return mealName(item.minute);
  return item.type === "walk" ? "Walk" : "Metformin";
}

const NEAREST_PRIORITY: Record<Event["type"], number> = { meal: 0, walk: 1, med: 2 };

/** The row closest in time to `minute`, if any is within `maxDistanceMin`. A meal wins a tie. */
export function nearestItem(
  items: DayItem[],
  minute: number,
  maxDistanceMin = 180,
): { item: DayItem; offsetMin: number } | null {
  let best: { item: DayItem; offsetMin: number } | null = null;
  for (const item of items) {
    const offsetMin = minute - item.minute;
    if (Math.abs(offsetMin) > maxDistanceMin) continue;
    const closer = !best || Math.abs(offsetMin) < Math.abs(best.offsetMin);
    const tiedButPreferred =
      best && Math.abs(offsetMin) === Math.abs(best.offsetMin) && NEAREST_PRIORITY[item.type] < NEAREST_PRIORITY[best.item.type];
    if (closer || tiedButPreferred) best = { item, offsetMin };
  }
  return best;
}
