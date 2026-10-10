import { describe, expect, it } from "vitest";
import { createTwin, simulate } from "../index";
import { BREAKFAST, meal, morningMetformin, profile, walkAfterBreakfast } from "./fixtures";

const HIGH_GI = 80;
const LOW_GI = 45;

describe("Bergman minimal model", () => {
  it("stays at basal glucose all day when nothing happens", () => {
    const twin = createTwin(profile());
    const { series } = simulate(twin, { events: [] });
    for (const point of series) {
      expect(Math.abs(point.glucose - twin.Gb)).toBeLessThanOrEqual(5);
    }
  });

  it("peaks at 180-280 mg/dL, 30-90 min after a 60 g high-GI meal (HbA1c 8 %)", () => {
    const { metrics } = simulate(createTwin(profile()), { events: [meal(HIGH_GI)] });
    expect(metrics.peak).toBeGreaterThanOrEqual(180);
    expect(metrics.peak).toBeLessThanOrEqual(280);
    const minutesAfterMeal = metrics.peakMinute - BREAKFAST;
    expect(minutesAfterMeal).toBeGreaterThanOrEqual(30);
    expect(minutesAfterMeal).toBeLessThanOrEqual(90);
  });

  it("gives a lower, later peak for the same meal with low GI", () => {
    const twin = createTwin(profile());
    const high = simulate(twin, { events: [meal(HIGH_GI)] }).metrics;
    const low = simulate(twin, { events: [meal(LOW_GI)] }).metrics;
    expect(low.peak).toBeLessThan(high.peak);
    expect(low.peakMinute).toBeGreaterThan(high.peakMinute);
  });

  it("lowers the peak with a 15 min walk right after the meal", () => {
    const twin = createTwin(profile());
    const noWalk = simulate(twin, { events: [meal(HIGH_GI)] }).metrics;
    const withWalk = simulate(twin, { events: [meal(HIGH_GI), walkAfterBreakfast] }).metrics;
    expect(withWalk.peak).toBeLessThan(noWalk.peak);
  });

  it("lowers mean glucose with metformin", () => {
    const twin = createTwin(profile());
    const without = simulate(twin, { events: [meal(HIGH_GI)] }).metrics;
    const withMed = simulate(twin, { events: [meal(HIGH_GI), morningMetformin] }).metrics;
    expect(withMed.mean).toBeLessThan(without.mean);
  });

  it("gives a higher peak for the same meal when HbA1c is higher", () => {
    const events = [meal(HIGH_GI)];
    const lower = simulate(createTwin(profile({ hba1c: 7 })), { events }).metrics;
    const higher = simulate(createTwin(profile({ hba1c: 9.5 })), { events }).metrics;
    expect(higher.peak).toBeGreaterThan(lower.peak);
  });
});
