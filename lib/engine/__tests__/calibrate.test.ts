import { describe, expect, it } from "vitest";
import { calibrate, createTwin, simulateSeries } from "../index";
import type { Reading } from "../types";
import { BREAKFAST, meal, profile } from "./fixtures";

describe("calibration", () => {
  it("recovers a lower insulin sensitivity from glucometer readings", () => {
    const twin = createTwin(profile());
    const scenario = { events: [meal(80)] };

    // Pretend the real person is less insulin sensitive than their profile suggests.
    const truth = simulateSeries({ ...twin, siMultiplier: 0.6 }, scenario);
    const readingMinutes = [BREAKFAST - 30, 510, 540, 570, 600, 660, 720];
    const readings: Reading[] = readingMinutes.map((minute) => ({
      minute,
      glucose: truth[minute].glucose,
    }));

    const started = performance.now();
    const result = calibrate(twin, scenario, readings);
    const elapsedMs = performance.now() - started;

    expect(Math.abs(result.params.siMultiplier - 0.6)).toBeLessThanOrEqual(0.15);
    expect(result.rmseAfter).toBeLessThan(result.rmseBefore);
    expect(result.accuracyPct).toBeGreaterThan(95);
    expect(elapsedMs).toBeLessThan(300);
  });
});
