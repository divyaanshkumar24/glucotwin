import { describe, expect, it } from "vitest";
import { compareMetrics, summarizeComparison, type Metrics } from "../index";

function metrics(overrides: Partial<Metrics> = {}): Metrics {
  return {
    peak: 240,
    peakMinute: 500,
    mean: 170,
    timeInRangePct: 50,
    hoursAbove180: 6,
    minutesBelow70: 0,
    lowest: 140,
    ...overrides,
  };
}

describe("compare", () => {
  it("judges lower peak and more time in range as better", () => {
    const rows = compareMetrics(metrics(), metrics({ peak: 198, timeInRangePct: 62.5, hoursAbove180: 4.5, mean: 160 }));
    expect(rows.map((r) => r.verdict)).toEqual(["better", "better", "better", "better"]);
    expect(rows[0].diff).toBe(-42);
  });

  it("judges a higher peak as worse and tiny changes as the same", () => {
    const rows = compareMetrics(metrics(), metrics({ peak: 260, mean: 170.4 }));
    expect(rows.find((r) => r.key === "peak")?.verdict).toBe("worse");
    expect(rows.find((r) => r.key === "mean")?.verdict).toBe("same");
  });

  it("writes the sentence from the numbers", () => {
    const better = metrics({ peak: 198, timeInRangePct: 56.25 });
    expect(summarizeComparison(metrics(), better)).toBe(
      "Scenario B lowers your peak by 42 mg/dL and adds 1.5 hours in range.",
    );
  });

  it("describes a worse scenario and an identical one", () => {
    expect(summarizeComparison(metrics(), metrics({ peak: 255, timeInRangePct: 25 }))).toBe(
      "Scenario B raises your peak by 15 mg/dL and loses 6.0 hours in range.",
    );
    expect(summarizeComparison(metrics(), metrics({ peak: 220, timeInRangePct: 45 }))).toBe(
      "Scenario B lowers your peak by 20 mg/dL but loses 1.2 hours in range.",
    );
    expect(summarizeComparison(metrics(), metrics())).toBe("The two scenarios give almost the same result.");
  });
});
