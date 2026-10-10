import { betaCellIndex, insulinSensitivityIndex, sensitivityLevel, type CalibrationResult, type TwinParams } from "@/lib/engine";

type CalibrationResultsProps = {
  result: CalibrationResult;
  /** The twin the calibration started from. */
  start: TwinParams;
};

/** Fit accuracy, error before and after, and the two updated body parameters. */
export function CalibrationResults({ result, start }: CalibrationResultsProps) {
  const sensitivityBefore = insulinSensitivityIndex(start);
  const sensitivityAfter = insulinSensitivityIndex(result.params);
  const betaBefore = betaCellIndex(start);
  const betaAfter = betaCellIndex(result.params);

  return (
    <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
      <div className="border-t border-border pt-3">
        <dt className="text-xs text-muted">Fit accuracy</dt>
        <dd className="mt-1">
          <span className="font-mono text-4xl font-medium tracking-tight">{result.accuracyPct.toFixed(1)}</span>{" "}
          <span className="font-mono text-sm text-muted">%</span>
        </dd>
      </div>
      <div className="border-t border-border pt-3">
        <dt className="text-xs text-muted">Typical error (RMSE)</dt>
        <dd className="mt-1 font-mono text-2xl font-medium tracking-tight">
          {result.rmseBefore.toFixed(1)} <span className="text-muted">→</span> {result.rmseAfter.toFixed(1)}{" "}
          <span className="text-sm font-normal text-muted">mg/dL</span>
        </dd>
        <dd className="mt-1 text-xs text-muted">Before and after calibration.</dd>
      </div>
      <div className="border-t border-border pt-3">
        <dt className="text-xs text-muted">Insulin sensitivity</dt>
        <dd className="mt-1 text-2xl font-medium tracking-tight">
          {sensitivityLevel(sensitivityAfter)}{" "}
          <span className="font-mono text-sm font-normal text-muted">{sensitivityAfter.toFixed(2)}× typical</span>
        </dd>
        <dd className="mt-1 font-mono text-xs text-muted">was {sensitivityBefore.toFixed(2)}×</dd>
      </div>
      <div className="border-t border-border pt-3">
        <dt className="text-xs text-muted">Beta-cell response</dt>
        <dd className="mt-1 text-2xl font-medium tracking-tight">
          <span className="font-mono">{betaAfter.toFixed(2)}×</span>{" "}
          <span className="text-sm font-normal text-muted">typical</span>
        </dd>
        <dd className="mt-1 font-mono text-xs text-muted">was {betaBefore.toFixed(2)}×</dd>
      </div>
    </dl>
  );
}
