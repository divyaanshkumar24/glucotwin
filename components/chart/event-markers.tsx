"use client";

import { Footprints, Pill, UtensilsCrossed } from "lucide-react";
import { usePlotArea, useXAxisScale } from "recharts";
import { describeItem, formatClock, groupEvents } from "@/lib/day-events";
import type { Event } from "@/lib/engine";

const ICONS = { meal: UtensilsCrossed, walk: Footprints, med: Pill } as const;
const ICON_SIZE = 14;
const TICK_HEIGHT = 8;
/** Icons closer together than this (in pixels) are stacked into separate rows. */
const MIN_GAP_PX = ICON_SIZE + 4;

type EventMarkersProps = {
  events: Event[];
  highlightedEventId?: string | null;
};

/**
 * Small ticks with an icon along the bottom of the plot, one for each meal, walk or dose.
 * A highlighted event also gets a faint vertical line so it is easy to find on the curve.
 * Must be drawn inside a Recharts chart, because it reads the chart's axis scale.
 */
export function EventMarkers({ events, highlightedEventId }: EventMarkersProps) {
  const plot = usePlotArea();
  const xScale = useXAxisScale();
  if (!plot || !xScale) return null;

  const bottom = plot.y + plot.height;

  // Place each marker in the lowest row where it does not touch the previous marker in that row.
  const laneEnds: number[] = [];
  const placed = groupEvents(events).flatMap((item) => {
    const x = xScale(item.minute);
    if (typeof x !== "number") return [];
    let lane = laneEnds.findIndex((end) => x - end >= MIN_GAP_PX);
    if (lane === -1) lane = laneEnds.length;
    laneEnds[lane] = x;
    return [{ item, x, lane }];
  });

  return (
    <g>
      {placed.map(({ item, x, lane }) => {
        const Icon = ICONS[item.type];
        const highlighted = item.events.some((e) => e.id === highlightedEventId);
        const color = highlighted ? "var(--accent)" : "var(--muted)";
        return (
          <g key={item.key}>
            <title>{`${formatClock(item.minute)} · ${describeItem(item)}`}</title>
            {highlighted && (
              <line x1={x} x2={x} y1={plot.y} y2={bottom} stroke="var(--accent)" strokeOpacity={0.5} strokeDasharray="2 3" />
            )}
            <line x1={x} x2={x} y1={bottom - TICK_HEIGHT} y2={bottom} stroke={color} strokeWidth={highlighted ? 2 : 1} />
            <Icon
              x={x - ICON_SIZE / 2}
              y={bottom - TICK_HEIGHT - ICON_SIZE - 3 - lane * (ICON_SIZE + 3)}
              width={ICON_SIZE}
              height={ICON_SIZE}
              strokeWidth={1.5}
              color={color}
              aria-hidden
            />
          </g>
        );
      })}
    </g>
  );
}
