import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { PlannedNote } from "@/components/planned-note";
import { TwinGate } from "@/components/twin-gate";

export const metadata: Metadata = { title: "Simulator · GlucoTwin" };

export default function SimulatorPage() {
  return (
    <div className="space-y-8">
      <PageHeading title="Simulator" description="Plan a day of meals, walks and medication and watch your twin respond." />
      <TwinGate>
        <PlannedNote>Meal, walk and medication controls come next.</PlannedNote>
      </TwinGate>
    </div>
  );
}
