import Link from "next/link";
import { Tag } from "@/components/ui/tag";
import {
  estimatedAverageGlucose,
  insulinSensitivityIndex,
  sensitivityLevel,
} from "@/lib/engine";
import type { StoredTwin } from "@/lib/twin-store";

/** Compact summary of the saved twin, shown at the top of the working pages. */
export function TwinPanel({ twin }: { twin: StoredTwin }) {
  const { profile, params, sampleName } = twin;
  const sensitivity = insulinSensitivityIndex(params);

  return (
    <section className="rounded-md border border-border bg-surface" aria-labelledby="twin-panel-title">
      <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 id="twin-panel-title" className="text-sm font-semibold">
              {sampleName ? `${sampleName}, sample patient` : "Your twin"}
            </h2>
            {sampleName && <Tag label="Demo" />}
          </div>
          <p className="mt-0.5 text-xs text-muted">
            <span className="font-mono">{profile.age}</span> y ·{" "}
            <span className="font-mono">{profile.weightKg}</span> kg · {profile.activityLevel} activity ·
            HbA1c <span className="font-mono">{profile.hba1c}</span> %
            {profile.onMetformin && " · on metformin"}
          </p>
        </div>
        <Link
          href="/onboarding"
          className="shrink-0 rounded-sm text-sm text-muted transition-colors duration-150 ease-out hover:text-text"
        >
          Edit
        </Link>
      </div>
      <dl className="grid gap-4 px-4 py-4 sm:grid-cols-3">
        <Stat label="Fasting glucose" value={params.Gb.toFixed(0)} unit="mg/dL" />
        <Stat
          label="Estimated average glucose"
          value={estimatedAverageGlucose(profile.hba1c).toFixed(0)}
          unit="mg/dL"
        />
        <div>
          <dt className="text-xs text-muted">Insulin sensitivity</dt>
          <dd className="mt-1 text-lg font-medium tracking-tight">
            {sensitivityLevel(sensitivity)}{" "}
            <span className="font-mono text-sm font-normal text-muted">
              {sensitivity.toFixed(2)}× typical
            </span>
          </dd>
        </div>
      </dl>
    </section>
  );
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-1 font-mono text-lg font-medium tracking-tight">
        {value} <span className="text-sm font-normal text-muted">{unit}</span>
      </dd>
    </div>
  );
}
