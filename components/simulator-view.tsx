"use client";

import { useMemo, useRef, useState } from "react";
import { EventBuilder } from "@/components/builder/event-builder";
import { CoachPreview } from "@/components/coach-preview";
import { GlucoseChart } from "@/components/glucose-chart";
import { InsightsPanel } from "@/components/insights-panel";
import { MetricsRow } from "@/components/metrics-row";
import { SafetyNotice } from "@/components/safety-notice";
import { LoadingLine } from "@/components/loading-line";
import { TwinGate } from "@/components/twin-gate";
import { useDayEvents } from "@/lib/day-store";
import { analyzeDay, simulate } from "@/lib/engine";
import type { StoredTwin } from "@/lib/twin-store";

/** The simulator once a twin exists, or a prompt to create one. */
export function SimulatorScreen() {
  return <TwinGate>{(twin) => <SimulatorView twin={twin} />}</TwinGate>;
}

/** The main screen: event builder on the left, live glucose curve and numbers on the right. */
function SimulatorView({ twin }: { twin: StoredTwin }) {
  const [events, setEvents] = useDayEvents(twin.profile.onMetformin);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const chartRef = useRef<HTMLElement>(null);
  const result = useMemo(
    () => (events ? simulate(twin.params, { events }) : null),
    [twin.params, events],
  );

  const report = useMemo(
    () => (events && result ? analyzeDay(twin.params, { events }, twin.profile, result) : null),
    [twin.params, twin.profile, events, result],
  );

  if (!events || !result || !report) return <LoadingLine />;

  function highlight(eventId: string | null) {
    setHighlightedEventId(eventId);
    // Bring the chart into view if the insight list is far below it.
    if (eventId) chartRef.current?.scrollIntoView({ block: "nearest" });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
      <div className="min-w-0 space-y-10 lg:order-2">
        <SafetyNotice metrics={result.metrics} />
        <section aria-labelledby="chart-heading" ref={chartRef} className="scroll-mt-4">
          <h2 id="chart-heading" className="text-sm font-semibold tracking-tight">
            Glucose over 24 hours
          </h2>
          <div className="mt-4">
            <GlucoseChart series={result.series} events={events} highlightedEventId={highlightedEventId} />
          </div>
          <p className="mt-2 text-xs text-muted">
            Simulated by your twin from the events on the left. It shows a pattern, not a forecast of a real day.
          </p>
        </section>
        <MetricsRow metrics={result.metrics} />
        <InsightsPanel report={report} highlightedEventId={highlightedEventId} onHighlight={highlight} />
        <CoachPreview />
      </div>
      <aside className="min-w-0 lg:order-1">
        <EventBuilder
          events={events}
          onChange={setEvents}
          onMetformin={twin.profile.onMetformin}
          highlightedEventId={highlightedEventId}
        />
      </aside>
    </div>
  );
}
