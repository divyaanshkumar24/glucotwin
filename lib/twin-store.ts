"use client";

import { createTwin, type Profile, type TwinParams } from "@/lib/engine";
import { useLocalStorage } from "@/lib/use-local-storage";

const STORAGE_KEY = "glucotwin.twin.v1";

/** Everything we keep about the user, in their own browser only. */
export type StoredTwin = {
  /** Only set for the built-in sample patient. */
  sampleName?: string;
  profile: Profile;
  params: TwinParams;
  createdAt: string;
  /** Set once the twin has been calibrated on real readings. */
  calibratedAt?: string;
  calibrationReadingCount?: number;
};

/** A fresh, uncalibrated twin for a profile. */
export function buildStoredTwin(profile: Profile, sampleName?: string): StoredTwin {
  return { sampleName, profile, params: createTwin(profile), createdAt: new Date().toISOString() };
}

function isStoredTwin(value: unknown): value is StoredTwin {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<StoredTwin>;
  return (
    typeof v.profile?.hba1c === "number" &&
    typeof v.profile?.weightKg === "number" &&
    typeof v.params?.Gb === "number" &&
    typeof v.params?.p3 === "number"
  );
}

export function useStoredTwin() {
  return useLocalStorage<StoredTwin>(STORAGE_KEY, isStoredTwin);
}
