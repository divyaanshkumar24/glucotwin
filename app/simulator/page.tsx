import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { SimulatorScreen } from "@/components/simulator-view";

export const metadata: Metadata = { title: "Simulator" };

export default function SimulatorPage() {
  return (
    <div className="space-y-8">
      <PageHeading
        title="Simulator"
        description="Plan a day of meals, walks and medication and watch your twin respond."
      />
      <SimulatorScreen />
    </div>
  );
}
