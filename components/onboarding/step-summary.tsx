import { Tag } from "@/components/ui/tag";
import { createTwin, estimatedAverageGlucose, type Profile } from "@/lib/engine";
import { DISCLAIMER } from "@/lib/disclaimer";

type StepSummaryProps = {
  profile: Profile;
  sampleName?: string;
  replacesExisting: boolean;
};

export function StepSummary({ profile, sampleName, replacesExisting }: StepSummaryProps) {
  const twin = createTwin(profile);
  const average = estimatedAverageGlucose(profile.hba1c);

  return (
    <div className="space-y-6">
      {sampleName && (
        <p className="flex items-center gap-2 text-sm">
          <Tag label="Demo" />
          <span>
            Sample patient: {sampleName}, <span className="font-mono">{profile.age}</span>
            {profile.onMetformin ? ", on metformin" : ""}.
          </span>
        </p>
      )}
      <dl className="divide-y divide-border rounded-md border border-border bg-surface">
        <SummaryRow
          label="Estimated average glucose"
          value={average.toFixed(0)}
          explanation={`Your HbA1c of ${profile.hba1c} % expressed as a 24-hour average, using the ADA formula (28.7 × HbA1c − 46.7).`}
        />
        <SummaryRow
          label="Fasting glucose"
          value={twin.Gb.toFixed(0)}
          explanation="Where your twin rests before meals. Set a little below the average, because meals pull the average up."
        />
      </dl>
      <p className="text-sm text-muted">
        Saved only in this browser. Nothing is sent anywhere.
        {replacesExisting && " Creating a new twin replaces the one saved here."}
      </p>
      <p className="rounded-md border border-border px-4 py-3 text-sm">{DISCLAIMER}</p>
    </div>
  );
}

function SummaryRow({ label, value, explanation }: { label: string; value: string; explanation: string }) {
  return (
    <div className="grid gap-1 px-4 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6">
      <div>
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-1 font-mono text-xl font-medium tracking-tight">
          {value} <span className="text-sm font-normal text-muted">mg/dL</span>
        </dd>
      </div>
      <p className="text-sm text-muted sm:pt-5">{explanation}</p>
    </div>
  );
}
