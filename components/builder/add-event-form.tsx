"use client";

import clsx from "clsx";
import { useState } from "react";
import { FoodPicker } from "@/components/builder/food-picker";
import { Button } from "@/components/ui/button";
import { SelectField } from "@/components/ui/select-field";
import { Stepper } from "@/components/ui/stepper";
import { TimeSelect } from "@/components/ui/time-select";
import type { Food } from "@/lib/data/foods";
import {
  WALK_DURATIONS_MIN,
  addFood,
  addMetformin,
  addWalk,
  formatClock,
  groupEvents,
  mealName,
} from "@/lib/day-events";
import type { Event } from "@/lib/engine";

type Kind = "meal" | "walk" | "med";

const KINDS: { kind: Kind; label: string }[] = [
  { kind: "meal", label: "Meal" },
  { kind: "walk", label: "Walk" },
  { kind: "med", label: "Metformin" },
];

type AddEventFormProps = {
  events: Event[];
  onChange: (events: Event[]) => void;
};

/** Three small forms behind tabs: add a food to a meal, a walk, or a metformin dose. */
export function AddEventForm({ events, onChange }: AddEventFormProps) {
  const [kind, setKind] = useState<Kind>("meal");
  const [minute, setMinute] = useState(13 * 60);
  const [food, setFood] = useState<Food | null>(null);
  const [portions, setPortions] = useState(1);
  const [duration, setDuration] = useState<number>(15);

  const mealAtTime = groupEvents(events).find((item) => item.type === "meal" && item.minute === minute);

  function submit() {
    if (kind === "meal" && food) {
      onChange(addFood(events, minute, food, portions));
      // Keep the time so more foods can join the same meal.
      setFood(null);
      setPortions(1);
    } else if (kind === "walk") {
      onChange(addWalk(events, minute, duration));
    } else if (kind === "med") {
      onChange(addMetformin(events, minute));
    }
  }

  const canAdd = kind !== "meal" || food !== null;

  return (
    <section aria-labelledby="add-heading">
      <h2 id="add-heading" className="text-sm font-semibold tracking-tight">
        Add to your day
      </h2>
      <div role="tablist" aria-label="Kind of event" className="mt-3 flex border-b border-border">
        {KINDS.map((item) => (
          <button
            key={item.kind}
            role="tab"
            type="button"
            aria-selected={kind === item.kind}
            onClick={() => setKind(item.kind)}
            className={clsx(
              "-mb-px border-b px-3 py-2 text-sm transition-colors duration-150 ease-out",
              kind === item.kind ? "border-accent text-text" : "border-transparent text-muted hover:text-text",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <TimeSelect value={minute} onChange={setMinute} />
          {kind === "walk" && (
            <SelectField
              label="Duration"
              value={duration}
              options={WALK_DURATIONS_MIN.map((d) => ({ value: d, label: `${d} min` }))}
              onChange={setDuration}
            />
          )}
        </div>

        {kind === "meal" && (
          <>
            <FoodPicker selected={food} onSelect={setFood} />
            {food && (
              <div className="flex items-center gap-3">
                <Stepper label="portions" value={portions} onChange={setPortions} />
                <span className="text-xs text-muted">
                  <span className="font-mono">{food.carbsPerPortionG * portions}</span> g carbs
                </span>
              </div>
            )}
            {mealAtTime && (
              <p className="text-xs text-muted">
                {mealName(minute)} at <span className="font-mono">{formatClock(minute)}</span> has{" "}
                <span className="font-mono">{mealAtTime.carbsG}</span> g carbs so far. Foods added at the same time
                join this meal.
              </p>
            )}
          </>
        )}

        {kind === "med" && (
          <p className="text-xs text-muted">
            Metformin lowers how much glucose the liver releases, building up over about 2 hours and lasting around
            10.
          </p>
        )}

        <Button type="button" variant="secondary" onClick={submit} disabled={!canAdd} className="w-full">
          {kind === "meal" ? "Add food" : kind === "walk" ? "Add walk" : "Add metformin"}
        </Button>
      </div>
    </section>
  );
}
