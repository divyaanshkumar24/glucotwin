"use client";

import { useMemo, useState } from "react";
import { CalibrateChart } from "@/components/calibrate/calibrate-chart";
import { CalibrationResults } from "@/components/calibrate/calibration-results";
import { DaySummary } from "@/components/calibrate/day-summary";
import { HowCalibrationWorks } from "@/components/calibrate/how-calibration-works";
import { ReadingsTable } from "@/components/calibrate/readings-table";
import { StepSection } from "@/components/calibrate/step-section";
import { useCurveTween } from "@/components/calibrate/use-curve-tween";
import { LoadingLine } from "@/components/loading-line";
import { TwinGate } from "@/components/twin-gate";
import { Button } from "@/components/ui/button";
import { useDayEvents } from "@/lib/day-store";
import { calibrate, createTwin, simulate, type CalibrationResult, type TwinParams } from "@/lib/engine";
import { checkReadings, partialReadings, type ReadingDraft, type ReadingsCheck } from "@/lib/readings";
import { sampleReadings } from "@/lib/sample-readings";
import { useStoredTwin, type StoredTwin } from "@/lib/twin-store";

/** The calibrate page once a twin exists, or a prompt to create one. */
export function CalibrateScreen() {
  return <TwinGate>{(twin) => <CalibrateView twin={twin} />}</TwinGate>;
}

/** What one run of the calibration produced, and what it was based on. */
type Outcome = {
  /** Identifies the day and readings used; a different day or reading makes the outcome stale. */
  signature: string;
  result: CalibrationResult;
  /** The twin as it was before this run. */
  start: TwinParams;
  saved: boolean;
};

const STARTING_ROWS: ReadingDraft[] = [
  { id: "r-1", minute: 450, glucose: "" },
  { id: "r-2", minute: 600, glucose: "" },
  { id: "r-3", minute: 900, glucose: "" },
];

function CalibrateView({ twin }: { twin: StoredTwin }) {
  const [events, setEvents] = useDayEvents(twin.profile.onMetformin);
  const [, saveTwin] = useStoredTwin();
  const [rows, setRows] = useState<ReadingDraft[]>(STARTING_ROWS);
  const [check, setCheck] = useState<ReadingsCheck | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);

  const readings = useMemo(() => partialReadings(rows), [rows]);
  const signature = useMemo(() => JSON.stringify([events, readings]), [events, readings]);
  // A result only applies to the day and readings it was fitted to.
  const current = outcome?.signature === signature ? outcome : null;

  const beforeParams = current ? current.start : twin.params;
  const before = useMemo(
    () => (events ? simulate(beforeParams, { events }).series : null),
    [beforeParams, events],
  );
  const afterSeries = useMemo(
    () => (events && current ? simulate(current.result.params, { events }).series : null),
    [events, current],
  );
  const animatedAfter = useCurveTween(before ?? [], afterSeries);

  if (!events || !before) return <LoadingLine />;

  function runCalibration() {
    const found = checkReadings(rows);
    setCheck(found);
    if (!found.readings || !events) return;
    const validReadings = found.readings;
    setBusy(true);
    // Let the button repaint as "Calibrating" before the (brief) search starts.
    setTimeout(() => {
      const result = calibrate(twin.params, { events }, validReadings);
      setOutcome({ signature, result, start: twin.params, saved: false });
      setBusy(false);
    }, 30);
  }

  function fillSampleReadings() {
    // Based on the uncalibrated twin, so the demo gives the same readings every time.
    const demo = sampleReadings(createTwin(twin.profile), events ?? []);
    setRows(demo.map((r, i) => ({ id: `sample-${i}`, minute: r.minute, glucose: String(r.glucose) })));
    setCheck(null);
  }

  function save() {
    if (!current) return;
    const saved = saveTwin({
      ...twin,
      params: current.result.params,
      calibratedAt: new Date().toISOString(),
      calibrationReadingCount: readings.length,
    });
    if (saved) setOutcome({ ...current, saved: true });
  }

  return (
    <div className="max-w-5xl space-y-10">
      <StepSection number={1} title="Confirm the day">
        <DaySummary events={events} onChange={setEvents} onMetformin={twin.profile.onMetformin} />
      </StepSection>

      <StepSection number={2} title="Enter your readings">
        <ReadingsTable rows={rows} onChange={setRows} onUseSample={fillSampleReadings} check={check} />
      </StepSection>

      <StepSection number={3} title="Calibrate">
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={runCalibration} disabled={busy}>
            {busy ? "Calibrating..." : current ? "Calibrate again" : "Calibrate"}
          </Button>
          <p className="text-sm text-muted">Searches over two body parameters to fit your readings.</p>
        </div>

        <div className="mt-6">
          <CalibrateChart before={before} after={animatedAfter} readings={readings} />
        </div>

        {current && (
          <div className="mt-8 space-y-6" aria-live="polite">
            <CalibrationResults result={current.result} start={current.start} />
            <p className="max-w-2xl text-sm">
              Your twin now matches these readings. More readings on different days make it more reliable.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={save} disabled={current.saved}>
                {current.saved ? "Saved" : "Save calibrated twin"}
              </Button>
              {current.saved && (
                <p className="text-sm text-muted">The simulator and compare pages now use this twin.</p>
              )}
            </div>
          </div>
        )}
      </StepSection>

      <HowCalibrationWorks />
    </div>
  );
}
