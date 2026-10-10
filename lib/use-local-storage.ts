"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

// Fired on this tab after we write, since the browser's "storage" event only reaches other tabs.
const LOCAL_CHANGE_EVENT = "glucotwin:storage";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCAL_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCAL_CHANGE_EVENT, onChange);
  };
}

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    // Storage can be blocked (private mode, strict settings); behave as if empty.
    return null;
  }
}

/**
 * A JSON value kept in localStorage, safe to use in server-rendered pages.
 * The value is `undefined` until the browser has been read (server render and first
 * hydration pass), `null` when nothing valid is stored, and the parsed value otherwise.
 * `isValid` should be a stable, module-level function.
 */
export function useLocalStorage<T>(key: string, isValid: (value: unknown) => value is T) {
  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => undefined,
  );

  const value = useMemo((): T | null | undefined => {
    if (raw === undefined || raw === null) return raw;
    try {
      const parsed: unknown = JSON.parse(raw);
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }, [raw, isValid]);

  /** Store a value (or remove it with null). Returns false if the browser refused. */
  const setValue = useCallback(
    (next: T | null): boolean => {
      try {
        if (next === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        return false;
      }
      window.dispatchEvent(new Event(LOCAL_CHANGE_EVENT));
      return true;
    },
    [key],
  );

  return [value, setValue] as const;
}
