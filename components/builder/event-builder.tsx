"use client";

import { AddEventForm } from "@/components/builder/add-event-form";
import { EventList } from "@/components/builder/event-list";
import { Button } from "@/components/ui/button";
import type { Event } from "@/lib/engine";
import { DAY_PRESETS } from "@/lib/presets";

type EventBuilderProps = {
  events: Event[];
  onChange: (events: Event[]) => void;
  onMetformin: boolean;
  highlightedEventId?: string | null;
  /** Hide the preset buttons (the compare page has its own presets). */
  hidePresets?: boolean;
};

/** Everything needed to edit one day: presets, add forms and the list of events. */
export function EventBuilder({ events, onChange, onMetformin, highlightedEventId, hidePresets }: EventBuilderProps) {
  return (
    <div className="space-y-8">
      {!hidePresets && (
        <section aria-labelledby="presets-heading">
          <h2 id="presets-heading" className="text-sm font-semibold tracking-tight">
            Start from a day
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {DAY_PRESETS.map((preset) => (
              <Button
                key={preset.id}
                type="button"
                variant="secondary"
                className="h-8 px-3"
                onClick={() => onChange(preset.build(onMetformin))}
              >
                {preset.label}
              </Button>
            ))}
            <Button type="button" variant="secondary" className="h-8 px-3 text-muted" onClick={() => onChange([])}>
              Clear
            </Button>
          </div>
        </section>
      )}
      <AddEventForm events={events} onChange={onChange} />
      <EventList events={events} onChange={onChange} highlightedEventId={highlightedEventId} />
    </div>
  );
}
