"use client";

import { useEffect, useState } from "react";
import type { SimPoint } from "@/lib/engine";

const TWEEN_MS = 600;

const easeOut = (t: number) => 1 - (1 - t) ** 3;

type Tween = { target: SimPoint[]; progress: number };

/**
 * Moves from the `from` curve to the `to` curve over about 600 ms, so the line visibly
 * settles onto the readings. Returns the curve to draw, or null while there is no `to`.
 * With reduced motion switched on it jumps straight to the end.
 */
export function useCurveTween(from: SimPoint[], to: SimPoint[] | null): SimPoint[] | null {
  // Progress is stored with the curve it belongs to, so a new target always starts at 0.
  const [tween, setTween] = useState<Tween>({ target: [], progress: 0 });

  useEffect(() => {
    if (!to) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const progress = reduceMotion ? 1 : Math.min((now - start) / TWEEN_MS, 1);
      setTween({ target: to, progress: easeOut(progress) });
      if (progress < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [to]);

  if (!to) return null;
  const progress = tween.target === to ? tween.progress : 0;
  return to.map((point, i) => ({
    minute: point.minute,
    insulin: point.insulin,
    glucose: from[i].glucose + (point.glucose - from[i].glucose) * progress,
  }));
}
