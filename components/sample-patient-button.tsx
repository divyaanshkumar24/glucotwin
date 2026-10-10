"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SAMPLE_PATIENT } from "@/lib/profile-form";
import { buildStoredTwin, useStoredTwin } from "@/lib/twin-store";

/** Loads the sample patient (Ramesh) as the saved twin and opens the simulator. */
export function SamplePatientButton() {
  const router = useRouter();
  const [, saveTwin] = useStoredTwin();
  const [failed, setFailed] = useState(false);

  function load() {
    const saved = saveTwin(buildStoredTwin(SAMPLE_PATIENT.profile, SAMPLE_PATIENT.name));
    if (saved) router.push("/simulator");
    else setFailed(true);
  }

  return (
    <>
      <Button type="button" variant="secondary" onClick={load}>
        Try with a sample patient
      </Button>
      {failed && (
        <p className="basis-full text-sm text-low">
          This browser would not let GlucoTwin save. Check that site storage is allowed, then try again.
        </p>
      )}
    </>
  );
}
