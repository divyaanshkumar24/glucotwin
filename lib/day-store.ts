"use client";

import { useCallback } from "react";
import { isEventArray } from "@/lib/day-events";
import type { Event } from "@/lib/engine";
import { typicalDay } from "@/lib/presets";
import { useLocalStorage } from "@/lib/use-local-storage";

const DAY_KEY = "glucotwin.day.v1";

/**
 * The day's events shared by the simulator and calibration pages, kept in localStorage.
 * Until the user changes anything the "typical day" preset is shown. `undefined` means
 * storage has not been read yet.
 */
export function useDayEvents(onMetformin: boolean) {
  const [stored, setStored] = useLocalStorage<Event[]>(DAY_KEY, isEventArray);
  const events = stored === undefined ? undefined : (stored ?? typicalDay(onMetformin));
  const setEvents = useCallback((next: Event[]) => setStored(next), [setStored]);
  return [events, setEvents] as const;
}
