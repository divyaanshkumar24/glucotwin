import type { ActivityLevel, Profile } from "@/lib/engine";

/** Onboarding answers as typed, before they are checked and turned into a Profile. */
export type ProfileDraft = {
  age: string;
  weightKg: string;
  activityLevel: ActivityLevel | null;
  hba1c: string;
  onMetformin: boolean | null;
};

export type DraftErrors = Partial<Record<keyof ProfileDraft, string>>;

export const EMPTY_DRAFT: ProfileDraft = {
  age: "",
  weightKg: "",
  activityLevel: null,
  hba1c: "",
  onMetformin: null,
};

export const SAMPLE_PATIENT = {
  name: "Ramesh",
  profile: {
    age: 48,
    weightKg: 78,
    activityLevel: "low",
    hba1c: 8.1,
    onMetformin: true,
  } satisfies Profile,
};

export function draftFromProfile(profile: Profile): ProfileDraft {
  return {
    age: String(profile.age),
    weightKg: String(profile.weightKg),
    activityLevel: profile.activityLevel,
    hba1c: String(profile.hba1c),
    onMetformin: profile.onMetformin,
  };
}

function parseNumber(text: string): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function rangeError(text: string, min: number, max: number, label: string): string | undefined {
  const value = parseNumber(text);
  if (value === null) return `Enter your ${label}.`;
  if (value < min || value > max) return `Enter a ${label} between ${min} and ${max}.`;
  return undefined;
}

/** Errors for the fields on step 1 (about you). */
export function validateAboutYou(draft: ProfileDraft): DraftErrors {
  const errors: DraftErrors = {};
  const age = parseNumber(draft.age);
  if (age !== null && age < 18) errors.age = "GlucoTwin is built for adults (18 and over).";
  else if (age !== null && !Number.isInteger(age)) errors.age = "Enter your age in whole years.";
  else errors.age = rangeError(draft.age, 18, 100, "age");
  errors.weightKg = rangeError(draft.weightKg, 30, 250, "weight");
  if (!draft.activityLevel) errors.activityLevel = "Choose the option closest to a usual week.";
  return withoutEmpty(errors);
}

/** Errors for the fields on step 2 (diabetes). */
export function validateDiabetes(draft: ProfileDraft): DraftErrors {
  const errors: DraftErrors = {};
  errors.hba1c = rangeError(draft.hba1c, 4, 15, "HbA1c");
  if (draft.onMetformin === null) errors.onMetformin = "Choose yes or no.";
  return withoutEmpty(errors);
}

/** A complete Profile, or null while any answer is missing or invalid. */
export function profileFromDraft(draft: ProfileDraft): Profile | null {
  const errors = { ...validateAboutYou(draft), ...validateDiabetes(draft) };
  if (Object.keys(errors).length > 0) return null;
  return {
    age: Number(draft.age),
    weightKg: Number(draft.weightKg),
    activityLevel: draft.activityLevel as ActivityLevel,
    hba1c: Number(draft.hba1c),
    onMetformin: draft.onMetformin as boolean,
  };
}

function withoutEmpty(errors: DraftErrors): DraftErrors {
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message)) as DraftErrors;
}
