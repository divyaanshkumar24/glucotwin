"use client";

import clsx from "clsx";
import { ChevronDown, Footprints, Pill, Trash2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { SelectField } from "@/components/ui/select-field";
import { Stepper } from "@/components/ui/stepper";
import { TimeSelect } from "@/components/ui/time-select";
import {
  WALK_DURATIONS_MIN,
  describeItem,
  foodById,
  formatClock,
  groupEvents,
  moveEvents,
  removeEvents,
  setPortions,
  setWalkDuration,
  totalCarbsG,
  type DayItem,
} from "@/lib/day-events";
import type { Event, MealEvent, WalkEvent } from "@/lib/engine";
import { ICON } from "@/lib/icon";

const TYPE_ICON = { meal: UtensilsCrossed, walk: Footprints, med: Pill } as const;

type EventListProps = {
  events: Event[];
  onChange: (events: Event[]) => void;
  highlightedEventId?: string | null;
};

/** The day as compact rows in time order. Each row opens to edit time, portions or duration. */
export function EventList({ events, onChange, highlightedEventId }: EventListProps) {
  const items = groupEvents(events);
  const [openKey, setOpenKey] = useState<string | null>(null);

  return (
    <section aria-labelledby="day-heading">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="day-heading" className="text-sm font-semibold tracking-tight">
          Your day
        </h2>
        <span className="text-xs text-muted">
          <span className="font-mono">{totalCarbsG(events)}</span> g carbs in total
        </span>
      </div>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nothing planned. Add a meal above or start from a preset.</p>
      ) : (
        <ul className="mt-3 divide-y divide-border rounded-md border border-border bg-surface">
          {items.map((item) => (
            <EventRow
              key={item.key}
              item={item}
              open={openKey === item.key}
              onToggle={() => setOpenKey(openKey === item.key ? null : item.key)}
              highlighted={item.events.some((e) => e.id === highlightedEventId)}
              events={events}
              onChange={onChange}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

type EventRowProps = {
  item: DayItem;
  open: boolean;
  onToggle: () => void;
  highlighted: boolean;
  events: Event[];
  onChange: (events: Event[]) => void;
};

function EventRow({ item, open, onToggle, highlighted, events, onChange }: EventRowProps) {
  const Icon = TYPE_ICON[item.type];
  const ids = item.events.map((e) => e.id);
  const panelId = `row-${item.key}`;

  return (
    <li className={clsx(highlighted && "bg-background")}>
      <div className="flex items-start">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-start gap-3 px-3 py-2.5 text-left"
        >
          <span className="w-11 shrink-0 font-mono text-sm">{formatClock(item.minute)}</span>
          <Icon {...ICON} className="mt-0.5 shrink-0 text-muted" aria-hidden />
          <span className="min-w-0 flex-1 text-sm">{describeItem(item)}</span>
          {item.type === "meal" && (
            <span className="shrink-0 font-mono text-xs text-muted">{item.carbsG} g</span>
          )}
          <ChevronDown
            {...ICON}
            aria-hidden
            className={clsx("mt-0.5 shrink-0 text-muted transition-transform duration-150 ease-out", open && "rotate-180")}
          />
        </button>
        <button
          type="button"
          aria-label={`Remove ${describeItem(item)} at ${formatClock(item.minute)}`}
          onClick={() => onChange(removeEvents(events, ids))}
          className="px-3 py-2.5 text-muted transition-colors duration-150 ease-out hover:text-low"
        >
          <Trash2 {...ICON} />
        </button>
      </div>

      {open && (
        <div id={panelId} className="space-y-3 border-t border-border bg-background px-3 py-3">
          <TimeSelect
            label="Time"
            value={item.minute}
            onChange={(minute) => onChange(moveEvents(events, ids, minute))}
            className="max-w-32"
          />
          {item.type === "walk" && (
            <SelectField
              label="Duration"
              value={(item.events[0] as WalkEvent).durationMin}
              options={WALK_DURATIONS_MIN.map((d) => ({ value: d, label: `${d} min` }))}
              onChange={(d) => onChange(setWalkDuration(events, item.events[0].id, d))}
              className="max-w-32"
            />
          )}
          {item.type === "meal" &&
            item.events.map((event) => {
              const meal = event as MealEvent;
              const food = foodById(meal.foodId);
              return (
                <div key={meal.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 text-sm">
                    {food?.name}
                    <span className="block text-xs text-muted">{food?.portionLabel}</span>
                  </span>
                  <Stepper
                    label={`portions of ${food?.name ?? "food"}`}
                    value={meal.portions}
                    min={0}
                    onChange={(p) => onChange(setPortions(events, meal.id, p))}
                  />
                </div>
              );
            })}
        </div>
      )}
    </li>
  );
}
