import { describe, expect, it } from "vitest";
import { calibrate, createTwin, simulateSeries } from "@/lib/engine";
import { typicalDay } from "@/lib/presets";
import { checkReadings, type ReadingDraft } from "../readings";
import { sampleReadings } from "../sample-readings";
import { SAMPLE_PATIENT } from "../profile-form";

const row = (id: string, minute: number, glucose: string): ReadingDraft => ({ id, minute, glucose });

describe("readings table", () => {
  it("accepts 3 valid readings", () => {
    const check = checkReadings([row("a", 450, "150"), row("b", 600, "210"), row("c", 900, "180")]);
    expect(check.readings).toHaveLength(3);
    expect(check.tableError).toBeUndefined();
  });

  it("asks for at least 3 readings", () => {
    expect(checkReadings([row("a", 450, "150")]).tableError).toMatch(/at least 3/);
  });

  it("flags empty, non-numeric and implausible values per row", () => {
    const check = checkReadings([row("a", 450, ""), row("b", 600, "abc"), row("c", 900, "900")]);
    expect(Object.keys(check.rowErrors)).toEqual(["a", "b", "c"]);
    expect(check.readings).toBeNull();
  });

  it("rejects more than 8 readings", () => {
    const rows = Array.from({ length: 9 }, (_, i) => row(String(i), 400 + i * 30, "150"));
    expect(checkReadings(rows).tableError).toMatch(/at most 8/);
  });
});

describe("sample readings", () => {
  const twin = createTwin(SAMPLE_PATIENT.profile);
  const events = typicalDay(true);

  it("are fully valid and fit visibly better after calibration", () => {
    const readings = sampleReadings(twin, events);
    expect(readings.length).toBeGreaterThanOrEqual(3);
    const result = calibrate(twin, { events }, readings);
    expect(result.rmseAfter).toBeLessThan(result.rmseBefore);
    expect(result.params.siMultiplier).toBeGreaterThan(0.5);
    expect(result.params.siMultiplier).toBeLessThan(0.8);
    expect(result.accuracyPct).toBeGreaterThan(97);
  });

  it("match the hidden twin's curve within the noise", () => {
    const hidden = simulateSeries({ ...twin, siMultiplier: 0.65 }, { events });
    for (const r of sampleReadings(twin, events)) {
      expect(Math.abs(r.glucose - hidden[r.minute].glucose)).toBeLessThanOrEqual(4);
    }
  });
});
