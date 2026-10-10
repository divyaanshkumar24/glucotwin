"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  EMPTY_DRAFT,
  SAMPLE_PATIENT,
  draftFromProfile,
  profileFromDraft,
  validateAboutYou,
  validateDiabetes,
  type ProfileDraft,
} from "@/lib/profile-form";
import { buildStoredTwin, useStoredTwin, type StoredTwin } from "@/lib/twin-store";
import { StepAboutYou } from "./step-about-you";
import { StepDiabetes } from "./step-diabetes";
import { StepSummary } from "./step-summary";

const STEPS = [
  { title: "About you", intro: "Age, weight and activity change how your body handles glucose." },
  { title: "Your diabetes", intro: "Your HbA1c tells the twin your usual glucose level." },
  { title: "Your twin", intro: "This is where your twin starts. It can learn more from real readings later." },
] as const;

type StepIndex = 0 | 1 | 2;

/** Waits until saved data has been read, so an existing twin can prefill the form. */
export function OnboardingFlow() {
  const [stored, save] = useStoredTwin();
  if (stored === undefined) return null;
  return <Flow existing={stored} save={save} />;
}

type FlowProps = {
  existing: StoredTwin | null;
  save: (twin: StoredTwin) => boolean;
};

function Flow({ existing, save }: FlowProps) {
  const router = useRouter();
  const [step, setStep] = useState<StepIndex>(0);
  const [draft, setDraft] = useState<ProfileDraft>(
    existing ? draftFromProfile(existing.profile) : EMPTY_DRAFT,
  );
  const [sampleName, setSampleName] = useState(existing?.sampleName);
  const [showErrors, setShowErrors] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);

  // Move keyboard and screen-reader focus to the new step's heading.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  const errors = step === 0 ? validateAboutYou(draft) : step === 1 ? validateDiabetes(draft) : {};
  const profile = profileFromDraft(draft);

  function update(patch: Partial<ProfileDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    // Any change makes this the user's own profile rather than the sample.
    setSampleName(undefined);
  }

  function fillSamplePatient() {
    setDraft(draftFromProfile(SAMPLE_PATIENT.profile));
    setSampleName(SAMPLE_PATIENT.name);
    setShowErrors(false);
    setStep(2);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (step < 2) {
      if (Object.keys(errors).length > 0) {
        setShowErrors(true);
        return;
      }
      setShowErrors(false);
      setStep((step + 1) as StepIndex);
      return;
    }
    if (!profile) return;
    const saved = save(buildStoredTwin(profile, sampleName));
    if (saved) router.push("/simulator");
    else setSaveFailed(true);
  }

  const visibleErrors = showErrors ? errors : {};
  const { title, intro } = STEPS[step];

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-2xl">
      <div className="flex items-center justify-between gap-4 text-sm">
        <span className="text-muted">
          Step <span className="font-mono">{step + 1}</span> of <span className="font-mono">3</span>
        </span>
        <button
          type="button"
          onClick={fillSamplePatient}
          className="rounded-sm text-muted underline decoration-border underline-offset-4 transition-colors duration-150 ease-out hover:text-text"
        >
          Use sample patient
        </button>
      </div>
      <div className="mt-3 h-px bg-border" aria-hidden>
        <div
          className="h-px bg-accent transition-[width] duration-300 ease-out"
          style={{ width: `${((step + 1) / 3) * 100}%` }}
        />
      </div>

      <h1 ref={headingRef} tabIndex={-1} className="mt-8 text-2xl font-semibold tracking-tight outline-none">
        {title}
      </h1>
      <p className="mt-2 text-muted">{intro}</p>

      <div className="mt-8">
        {step === 0 && <StepAboutYou draft={draft} errors={visibleErrors} update={update} />}
        {step === 1 && <StepDiabetes draft={draft} errors={visibleErrors} update={update} />}
        {step === 2 && profile && (
          <StepSummary
            profile={profile}
            sampleName={sampleName}
            replacesExisting={existing !== null}
            replacesCalibration={Boolean(existing?.calibratedAt)}
          />
        )}
      </div>

      {saveFailed && (
        <p className="mt-6 text-sm text-low">
          This browser would not let GlucoTwin save. Check that site storage is allowed, then try again.
        </p>
      )}

      <div className="mt-10 flex items-center gap-3">
        {step > 0 && (
          <Button type="button" variant="secondary" onClick={() => setStep((step - 1) as StepIndex)}>
            Back
          </Button>
        )}
        <Button type="submit">{step < 2 ? "Continue" : "Create my twin"}</Button>
      </div>
    </form>
  );
}
