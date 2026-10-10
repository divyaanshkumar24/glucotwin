import { describe, expect, it } from "vitest";
import { foodById } from "../day-events";
import {
  addFood,
  addMetformin,
  addWalk,
  formatClock,
  groupEvents,
  moveEvents,
  nearestItem,
  removeEvents,
  setPortions,
  totalCarbsG,
} from "../day-events";
import { DAY_PRESETS } from "../presets";

const roti = foodById("roti")!;
const dal = foodById("dal")!;

describe("day events", () => {
  it("groups foods at the same time into one meal with total carbs", () => {
    let events = addFood([], 780, roti, 2);
    events = addFood(events, 780, dal, 1);
    const items = groupEvents(events);
    expect(items).toHaveLength(1);
    expect(items[0].carbsG).toBe(roti.carbsPerPortionG * 2 + dal.carbsPerPortionG);
  });

  it("adds portions when the same food is added twice at one time", () => {
    const events = addFood(addFood([], 480, roti, 1), 480, roti, 0.5);
    expect(events).toHaveLength(1);
    expect(totalCarbsG(events)).toBe(roti.carbsPerPortionG * 1.5);
  });

  it("removes a food when its portions reach zero", () => {
    const events = addFood([], 480, roti, 1);
    expect(setPortions(events, events[0].id, 0)).toEqual([]);
  });

  it("lists items in time order and moves whole meals", () => {
    let events = addWalk([], 900, 15);
    events = addFood(events, 480, roti, 1);
    expect(groupEvents(events).map((i) => i.type)).toEqual(["meal", "walk"]);
    const meal = events.find((e) => e.type === "meal")!;
    expect(moveEvents(events, [meal.id], 1000).find((e) => e.id === meal.id)?.minute).toBe(1000);
    expect(removeEvents(events, [meal.id])).toHaveLength(1);
  });

  it("formats clock times", () => {
    expect(formatClock(495)).toBe("08:15");
    expect(formatClock(1440)).toBe("24:00");
  });
});

describe("presets", () => {
  it("build valid events with unique ids", () => {
    for (const preset of DAY_PRESETS) {
      const events = preset.build(true);
      expect(events.length).toBeGreaterThan(5);
      expect(new Set(events.map((e) => e.id)).size).toBe(events.length);
      expect(events.some((e) => e.type === "med")).toBe(true);
      expect(preset.build(false).some((e) => e.type === "med")).toBe(false);
    }
  });
});

describe("nearest item", () => {
  it("prefers a meal over a dose at the same time", () => {
    let events = addMetformin([], 480);
    events = addFood(events, 480, roti, 1);
    const near = nearestItem(groupEvents(events), 600);
    expect(near?.item.type).toBe("meal");
    expect(near?.offsetMin).toBe(120);
  });

  it("returns nothing when no event is close", () => {
    expect(nearestItem(groupEvents(addWalk([], 100, 15)), 900)).toBeNull();
  });
});

describe("landing demo", () => {
  it("shows a lower evening peak for roti and a walk than for rice", async () => {
    const { buildLandingDemo } = await import("../landing-demo");
    const demo = buildLandingDemo();
    expect(demo.roti.peak).toBeLessThan(demo.rice.peak);
    expect(demo.data[0].minute).toBe(18 * 60);
    expect(demo.data.at(-1)?.minute).toBe(1440);
  });
});
