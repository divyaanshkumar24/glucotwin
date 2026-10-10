import { describe, expect, it } from "vitest";
import { analyzeDay, createTwin, safetyReason, simulate, type Event, type Insight } from "../index";
import { meal, profile } from "./fixtures";

const twin = createTwin(profile());
const walk = (minute: number, durationMin = 15): Event => ({ type: "walk", id: `walk-${minute}`, minute, durationMin });
const dose = (minute: number): Event => ({ type: "med", id: `dose-${minute}`, minute, kind: "metformin" });

function food(id: string, foodId: string, minute: number, portions: number, carbsPerPortion: number, gi: number): Event {
  return { type: "meal", id, minute, foodId, portions, carbsG: carbsPerPortion * portions, gi };
}

const rice = (minute: number, portions = 1) => food(`rice-${minute}`, "white-rice", minute, portions, 42, 73);
const roti = (minute: number, portions = 2) => food(`roti-${minute}`, "roti", minute, portions, 18, 62);

function find(insights: Insight[], idStart: string) {
  return insights.find((i) => i.id.startsWith(idStart));
}

function analyse(events: Event[], overrides = {}) {
  return analyzeDay(twin, { events }, profile(overrides));
}

describe("insight rules", () => {
  it("blames the heavy dinner, not the light breakfast, for the biggest spike", () => {
    const events = [roti(480, 1), rice(1200, 2), roti(1200, 1)];
    const insight = find(analyse(events).insights, "biggest-spike");
    expect(insight?.title).toMatch(/Highest point/);
    expect(insight?.body).toMatch(/Dinner at 20:00/);
    expect(insight?.relatedEventId).toBe("rice-1200");
  });

  it("suggests swapping rice for rotis with a simulated benefit", () => {
    const report = analyse([rice(1200, 1), food("dal", "dal", 1200, 1, 20, 32)]);
    const insight = find(report.insights, "biggest-spike");
    expect(insight?.body).toMatch(/swap 1 katori of rice for 2 rotis/);
    expect(insight?.benefitMgDl).toBeGreaterThan(5);
    expect(report.weeklyTip).toMatch(/swap 1 katori of rice for 2 rotis at dinner/);
  });

  it("notices a walk that lowers the spike and stays quiet about activity", () => {
    const events = [rice(780, 1), roti(780, 1), walk(795)];
    const insights = analyse(events).insights;
    expect(find(insights, "walk-helped")?.relatedEventId).toBe("walk-795");
    expect(find(insights, "no-activity")).toBeUndefined();
  });

  it("suggests a walk when there is none, with a number from re-running the day", () => {
    const events = [rice(780, 1.5), roti(780, 1)];
    // Only people with low activity get a "watch"; others get a gentle "info".
    expect(find(analyse(events).insights, "no-activity")?.severity).toBe("info");
    const insight = find(analyse(events, { activityLevel: "low" }).insights, "no-activity");
    expect(insight?.severity).toBe("watch");
    expect(insight?.body).toMatch(/15-minute walk after lunch/);
    expect(insight?.benefitMgDl).toBeGreaterThan(0);
  });

  it("warns about a long high after dinner and offers a walk", () => {
    const insight = find(analyse([rice(1170, 1.5), roti(1170, 2)]).insights, "long-high-after-dinner");
    expect(insight?.title).toMatch(/Above 180 mg\/dL for about/);
    expect(insight?.severity).toBe("watch");
  });

  it("flags a fast-digesting breakfast", () => {
    const events = [food("poha", "poha", 480, 1.5, 38, 64), food("bread", "bread-slice", 480, 2, 14, 75)];
    expect(find(analyse(events).insights, "fast-breakfast")).toBeDefined();
  });

  it("flags sweet drinks", () => {
    const events = [food("c1", "chai-sugar", 480, 1, 14, 58), food("c2", "chai-sugar", 1020, 2, 14, 58)];
    expect(find(analyse(events).insights, "sugary-drinks")?.severity).toBe("watch");
  });

  it("flags a late heavy dinner", () => {
    const events = [rice(1320, 2), food("rajma", "rajma", 1320, 1, 25, 29)];
    expect(find(analyse(events).insights, "late-heavy-dinner")).toBeDefined();
  });

  it("raises an alert when glucose goes below 70", () => {
    const lowTwin = { ...twin, Gb: 75 };
    const events = [dose(420), walk(480, 30), walk(600, 30)];
    const report = analyzeDay(lowTwin, { events }, profile({ onMetformin: true }));
    const low = find(report.insights, "low-glucose");
    expect(low?.severity).toBe("alert");
    expect(report.insights[0].severity).toBe("alert");
  });

  it("points out metformin taken away from meals", () => {
    const events = [dose(300), roti(480, 2)];
    expect(find(analyse(events, { onMetformin: true }).insights, "metformin-timing")).toBeDefined();
    const withFood = [dose(450), roti(480, 2)];
    expect(find(analyse(withFood, { onMetformin: true }).insights, "metformin-timing")).toBeUndefined();
  });

  it("notes a missing metformin dose when the profile says metformin", () => {
    expect(find(analyse([roti(480, 2)], { onMetformin: true }).insights, "missing-metformin")).toBeDefined();
    expect(find(analyse([roti(480, 2)], { onMetformin: false }).insights, "missing-metformin")).toBeUndefined();
  });

  it("praises a day mostly in range", () => {
    const healthy = createTwin(profile({ hba1c: 6, activityLevel: "high" }));
    const report = analyzeDay(healthy, { events: [roti(480, 2), walk(500)] }, profile({ hba1c: 6, activityLevel: "high" }));
    expect(find(report.insights, "good-time-in-range")?.title).toMatch(/Good day/);
  });

  it("handles an empty day", () => {
    const report = analyse([]);
    expect(report.insights).toHaveLength(1);
    expect(report.weeklyTip).toMatch(/walk/);
  });

  it("lists alerts before watch items before info", () => {
    const events = [rice(1200, 2), roti(1200, 1), roti(480, 1)];
    const ranks = analyse(events).insights.map((i) => ({ alert: 0, watch: 1, info: 2 })[i.severity]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });
});

describe("safety guardrail", () => {
  it("stays quiet for a normal day", () => {
    expect(safetyReason(simulate(twin, { events: [meal(80)] }).metrics)).toBeNull();
  });

  it("speaks up above 300 mg/dL", () => {
    const result = simulate(createTwin(profile({ hba1c: 11 })), { events: [meal(80, 120)] });
    expect(result.metrics.peak).toBeGreaterThan(300);
    expect(safetyReason(result.metrics)).toMatch(/above 300/);
  });

  it("speaks up below 70 mg/dL", () => {
    const result = simulate({ ...twin, Gb: 75 }, { events: [dose(420), walk(480, 30)] });
    expect(safetyReason(result.metrics)).toMatch(/below 70/);
  });
});
