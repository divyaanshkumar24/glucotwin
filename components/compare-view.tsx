"use client";

import { useMemo, type ReactNode } from "react";
import { EventBuilder } from "@/components/builder/event-builder";
import { CompareChart } from "@/components/compare-chart";
import { ComparisonTable } from "@/components/comparison-table";
import { SafetyNotice } from "@/components/safety-notice";
import { LoadingLine } from "@/components/loading-line";
import { TwinGate } from "@/components/twin-gate";
import { Button } from "@/components/ui/button";
import { COMPARE_PRESETS } from "@/lib/compare-presets";
import { useCompareScenarios } from "@/lib/compare-store";
import { compareMetrics, simulate, summarizeComparison } from "@/lib/engine";
import type { Event } from "@/lib/engine";
import type { StoredTwin } from "@/lib/twin-store";

/** The compare page once a twin exists, or a prompt to create one. */
export function CompareScreen() {
  return <TwinGate>{(twin) => <CompareView twin={twin} />}</TwinGate>;
}

function CompareView({ twin }: { twin: StoredTwin }) {
  const onMetformin = twin.profile.onMetformin;
  const [scenarios, setScenarios] = useCompareScenarios(onMetformin);

  const results = useMemo(
    () =>
      scenarios && {
        a: simulate(twin.params, { events: scenarios.a }),
        b: simulate(twin.params, { events: scenarios.b }),
      },
    [twin.params, scenarios],
  );

  if (!scenarios || !results) return <LoadingLine />;

  return (
    <div className="space-y-10">
      <section aria-labelledby="presets-heading">
        <h2 id="presets-heading" className="text-sm font-semibold tracking-tight">
          Quick comparisons
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {COMPARE_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              type="button"
              variant="secondary"
              className="h-8 px-3"
              onClick={() => setScenarios(preset.build(onMetformin))}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </section>

      <SafetyNotice metrics={[results.a.metrics, results.b.metrics]} />

      <section aria-labelledby="result-heading" className="space-y-6">
        <h2 id="result-heading" className="text-sm font-semibold tracking-tight">
          Glucose over 24 hours
        </h2>
        <CompareChart a={results.a.series} b={results.b.series} />
        <p className="max-w-2xl text-lg font-medium tracking-tight">
          {summarizeComparison(results.a.metrics, results.b.metrics)}
        </p>
        <ComparisonTable rows={compareMetrics(results.a.metrics, results.b.metrics)} />
      </section>

      <section aria-labelledby="edit-heading">
        <h2 id="edit-heading" className="text-sm font-semibold tracking-tight">
          Edit the scenarios
        </h2>
        <div className="mt-4 grid gap-10 md:grid-cols-2">
          <ScenarioEditor
            title="Scenario A"
            events={scenarios.a}
            onChange={(a) => setScenarios({ ...scenarios, a })}
            onMetformin={onMetformin}
          />
          <ScenarioEditor
            title="Scenario B"
            events={scenarios.b}
            onChange={(b) => setScenarios({ ...scenarios, b })}
            onMetformin={onMetformin}
            action={
              <Button
                type="button"
                variant="secondary"
                className="h-8 px-3"
                onClick={() => setScenarios({ ...scenarios, b: scenarios.a })}
              >
                Copy A to B
              </Button>
            }
          />
        </div>
      </section>
    </div>
  );
}

type ScenarioEditorProps = {
  title: string;
  events: Event[];
  onChange: (events: Event[]) => void;
  onMetformin: boolean;
  action?: ReactNode;
};

function ScenarioEditor({ title, events, onChange, onMetformin, action }: ScenarioEditorProps) {
  return (
    <div className="min-w-0 border-t border-border pt-4">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h3 className="font-semibold tracking-tight">{title}</h3>
        {action}
      </div>
      <EventBuilder events={events} onChange={onChange} onMetformin={onMetformin} hidePresets compact />
    </div>
  );
}
