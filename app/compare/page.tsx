import type { Metadata } from "next";
import { CompareScreen } from "@/components/compare-view";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "Compare" };

export default function ComparePage() {
  return (
    <div className="space-y-8">
      <PageHeading
        title="Compare"
        description="Put two versions of a day side by side and change just one thing."
      />
      <CompareScreen />
    </div>
  );
}
