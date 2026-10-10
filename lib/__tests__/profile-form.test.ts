import { describe, expect, it } from "vitest";
import {
  EMPTY_DRAFT,
  SAMPLE_PATIENT,
  draftFromProfile,
  profileFromDraft,
  validateAboutYou,
  validateDiabetes,
} from "../profile-form";

describe("onboarding form", () => {
  it("asks for every answer on an empty form", () => {
    expect(Object.keys(validateAboutYou(EMPTY_DRAFT))).toEqual(["age", "weightKg", "activityLevel"]);
    expect(Object.keys(validateDiabetes(EMPTY_DRAFT))).toEqual(["hba1c", "onMetformin"]);
    expect(profileFromDraft(EMPTY_DRAFT)).toBeNull();
  });

  it("rejects out-of-range and non-numeric values", () => {
    const draft = { ...draftFromProfile(SAMPLE_PATIENT.profile), age: "12", weightKg: "abc", hba1c: "22" };
    expect(validateAboutYou(draft).age).toMatch(/adults/);
    expect(validateAboutYou(draft).weightKg).toBeDefined();
    expect(validateDiabetes(draft).hba1c).toMatch(/between 4 and 15/);
  });

  it("round-trips the sample patient", () => {
    expect(profileFromDraft(draftFromProfile(SAMPLE_PATIENT.profile))).toEqual(SAMPLE_PATIENT.profile);
  });
});
