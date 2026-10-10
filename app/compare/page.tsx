import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { PlannedNote } from "@/components/planned-note";
import { TwinGate } from "@/components/twin-gate";

export const metadata: Metadata = { title: "Compare · GlucoTwin" };

export default function ComparePage() {
  return (
    <div className="space-y-8">
      <PageHeading title="Compare" description="Put two versions of a day side by side." />
      <TwinGate>
        <PlannedNote>Side-by-side scenarios come next.</PlannedNote>
      </TwinGate>
    </div>
  );
}
