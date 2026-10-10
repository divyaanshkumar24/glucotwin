import { ChoiceGroup, type Choice } from "@/components/ui/choice-group";
import { TextField } from "@/components/ui/text-field";
import type { StepProps } from "./step-about-you";

const METFORMIN_CHOICES: Choice<boolean>[] = [
  { value: true, label: "Yes" },
  { value: false, label: "No" },
];

export function StepDiabetes({ draft, errors, update }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="sm:max-w-[13rem]">
        <TextField
          label="Latest HbA1c"
          unit="%"
          inputMode="decimal"
          value={draft.hba1c}
          onChange={(hba1c) => update({ hba1c })}
          helper="Find this on your last lab report."
          error={errors.hba1c}
        />
      </div>
      <ChoiceGroup
        label="Do you take metformin?"
        columns={2}
        choices={METFORMIN_CHOICES}
        value={draft.onMetformin}
        onChange={(onMetformin) => update({ onMetformin })}
        error={errors.onMetformin}
      />
    </div>
  );
}
