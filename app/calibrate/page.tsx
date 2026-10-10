import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { PlannedNote } from "@/components/planned-note";

export const metadata: Metadata = { title: "Calibrate" };

export default function CalibratePage() {
  return (
    <div className="space-y-8">
      <PageHeading title="Calibrate" description="Teach your twin with real glucometer readings." />
      <PlannedNote>Entering glucometer readings comes next.</PlannedNote>
    </div>
  );
}
