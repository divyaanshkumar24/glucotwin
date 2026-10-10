import { describe, expect, it } from "vitest";
import {
  createTwin,
  estimatedAverageGlucose,
  insulinSensitivityIndex,
  sensitivityLevel,
} from "../index";
import { profile } from "./fixtures";

describe("personalisation", () => {
  it("converts HbA1c to average glucose with the ADA formula", () => {
    expect(estimatedAverageGlucose(7)).toBeCloseTo(154.2, 1);
  });

  it("rates a healthy profile's insulin sensitivity as good", () => {
    const twin = createTwin(profile({ hba1c: 5.5, age: 35, activityLevel: "moderate" }));
    expect(insulinSensitivityIndex(twin)).toBeCloseTo(1, 5);
    expect(sensitivityLevel(insulinSensitivityIndex(twin))).toBe("Good");
  });

  it("rates high HbA1c with low activity as low sensitivity", () => {
    const twin = createTwin(profile({ hba1c: 8.1, age: 48, activityLevel: "low" }));
    expect(sensitivityLevel(insulinSensitivityIndex(twin))).toBe("Low");
  });

  it("includes the calibration multiplier", () => {
    const twin = createTwin(profile());
    const calibrated = { ...twin, siMultiplier: 2 };
    expect(insulinSensitivityIndex(calibrated)).toBeCloseTo(2 * insulinSensitivityIndex(twin), 10);
  });
});
