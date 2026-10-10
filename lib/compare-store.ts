"use client";

import { useCallback } from "react";
import { isEventArray } from "@/lib/day-events";
import { useDayEvents } from "@/lib/day-store";
import type { Event } from "@/lib/engine";
import { useLocalStorage } from "@/lib/use-local-storage";

const COMPARE_KEY = "glucotwin.compare.v1";

export type CompareScenarios = { a: Event[]; b: Event[] };

function isCompareScenarios(value: unknown): value is CompareScenarios {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<CompareScenarios>;
  return isEventArray(v.a) && isEventArray(v.b);
}

/**
 * The two scenarios on the compare page. Until the user changes anything, both start as a
 * copy of the simulator's current day. `undefined` means storage has not been read yet.
 */
export function useCompareScenarios(onMetformin: boolean) {
  const [day] = useDayEvents(onMetformin);
  const [stored, setStored] = useLocalStorage<CompareScenarios>(COMPARE_KEY, isCompareScenarios);
  const scenarios = stored === undefined || day === undefined ? undefined : (stored ?? { a: day, b: day });

  const setScenarios = useCallback((next: CompareScenarios) => setStored(next), [setStored]);
  return [scenarios, setScenarios] as const;
}
