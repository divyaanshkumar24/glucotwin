import type { Event, MealEvent, Profile } from "../types";

export const BREAKFAST = 480;

export function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    age: 55,
    weightKg: 80,
    activityLevel: "moderate",
    hba1c: 8,
    onMetformin: false,
    ...overrides,
  };
}

export function meal(gi: number, carbsG = 60, minute = BREAKFAST): MealEvent {
  return { type: "meal", id: `meal-${gi}`, minute, foodId: "test", portions: 1, carbsG, gi };
}

export const walkAfterBreakfast: Event = {
  type: "walk",
  id: "walk",
  minute: BREAKFAST,
  durationMin: 15,
};

export const morningMetformin: Event = {
  type: "med",
  id: "metformin",
  minute: BREAKFAST - 30,
  kind: "metformin",
};
