import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { PlannedNote } from "@/components/planned-note";
import { TwinGate } from "@/components/twin-gate";

export const metadata: Metadata = { title: "Calibrate · GlucoTwin" };

export default function CalibratePage() {
  return (
    <div className="space-y-8">
      <PageHeading title="Calibrate" description="Teach your twin with real glucometer readings." />
      <TwinGate>
        <PlannedNote>Entering glucometer readings comes next.</PlannedNote>
      </TwinGate>
    </div>
  );
}
