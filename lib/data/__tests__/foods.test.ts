import { describe, expect, it } from "vitest";
import { FOODS } from "../foods";

describe("food library", () => {
  it("has unique ids", () => {
    const ids = FOODS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps carbs and GI within plausible ranges", () => {
    for (const food of FOODS) {
      expect(food.carbsPerPortionG).toBeGreaterThan(0);
      expect(food.carbsPerPortionG).toBeLessThan(100);
      expect(food.gi).toBeGreaterThanOrEqual(10);
      expect(food.gi).toBeLessThanOrEqual(100);
    }
  });
});
