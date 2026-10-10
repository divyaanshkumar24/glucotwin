import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { PlannedNote } from "@/components/planned-note";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  return (
    <div className="space-y-8">
      <PageHeading title="Compare" description="Put two versions of a day side by side." />
      <PlannedNote>Side-by-side scenarios come next.</PlannedNote>
    </div>
  );
}
