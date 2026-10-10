"use client";

import type { Profile, TwinParams } from "@/lib/engine";
import { useLocalStorage } from "@/lib/use-local-storage";

const STORAGE_KEY = "glucotwin.twin.v1";

/** Everything we keep about the user, in their own browser only. */
export type StoredTwin = {
  /** Only set for the built-in sample patient. */
  sampleName?: string;
  profile: Profile;
  params: TwinParams;
  createdAt: string;
};

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
