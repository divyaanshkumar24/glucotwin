import type { Metadata } from "next";
import { CalibrateScreen } from "@/components/calibrate/calibrate-view";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "Calibrate" };

export default function CalibratePage() {
  return (
    <div className="space-y-8">
      <PageHeading
        title="Calibrate"
        description="Teach your twin with real glucometer readings, so it behaves more like you."
      />
      <CalibrateScreen />
    </div>
  );
}
