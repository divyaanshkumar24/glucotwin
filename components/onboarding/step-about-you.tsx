import { ChoiceGroup, type Choice } from "@/components/ui/choice-group";
import { TextField } from "@/components/ui/text-field";
import type { ActivityLevel } from "@/lib/engine";
import type { DraftErrors, ProfileDraft } from "@/lib/profile-form";

const ACTIVITY_CHOICES: Choice<ActivityLevel>[] = [
  { value: "low", label: "Low", description: "Mostly sitting, under 30 min of walking a day." },
  { value: "moderate", label: "Moderate", description: "Walk 30-60 min most days or on your feet at work." },
  { value: "high", label: "High", description: "Exercise or physical work on most days." },
];

type StepProps = {
  draft: ProfileDraft;
  errors: DraftErrors;
  update: (patch: Partial<ProfileDraft>) => void;
};

export function StepAboutYou({ draft, errors, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:max-w-md sm:grid-cols-2">
        <TextField
          label="Age"
          unit="years"
          inputMode="numeric"
          value={draft.age}
          onChange={(age) => update({ age })}
          error={errors.age}
        />
        <TextField
          label="Weight"
          unit="kg"
          inputMode="decimal"
          value={draft.weightKg}
          onChange={(weightKg) => update({ weightKg })}
          error={errors.weightKg}
        />
      </div>
      <ChoiceGroup
        label="Activity level"
        columns={3}
        choices={ACTIVITY_CHOICES}
        value={draft.activityLevel}
        onChange={(activityLevel) => update({ activityLevel })}
        error={errors.activityLevel}
      />
    </div>
  );
}

export type { StepProps };
