"use client";

import { useMemo } from "react";
import { EventBuilder } from "@/components/builder/event-builder";
import { GlucoseChart } from "@/components/glucose-chart";
import { MetricsRow } from "@/components/metrics-row";
import { TwinGate } from "@/components/twin-gate";
import { useDayEvents } from "@/lib/day-store";
import { simulate } from "@/lib/engine";
import type { StoredTwin } from "@/lib/twin-store";

/** The simulator once a twin exists, or a prompt to create one. */
export function SimulatorScreen() {
  return <TwinGate>{(twin) => <SimulatorView twin={twin} />}</TwinGate>;
}

/** The main screen: event builder on the left, live glucose curve and numbers on the right. */
function SimulatorView({ twin }: { twin: StoredTwin }) {
  const [events, setEvents] = useDayEvents(twin.profile.onMetformin);
  const result = useMemo(
    () => (events ? simulate(twin.params, { events }) : null),
    [twin.params, events],
  );

  if (!events || !result) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
      <div className="min-w-0 space-y-8 lg:sticky lg:top-6 lg:order-2">
        <section aria-labelledby="chart-heading">
          <h2 id="chart-heading" className="text-sm font-semibold tracking-tight">
            Glucose over 24 hours
          </h2>
          <div className="mt-4">
            <GlucoseChart series={result.series} events={events} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Simulated by your twin from the events on the left. It shows a pattern, not a forecast of a real day.
          </p>
        </section>
        <MetricsRow metrics={result.metrics} />
      </div>
      <aside className="min-w-0 lg:order-1">
        <EventBuilder events={events} onChange={setEvents} onMetformin={twin.profile.onMetformin} />
      </aside>
    </div>
  );
}
