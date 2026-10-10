import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EngineCheckChart } from "@/components/engine-check-chart";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "Engine check · GlucoTwin" };

// Development aid only: the production build renders a 404 here.
export default function EngineCheckPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="space-y-8">
      <PageHeading
        title="Engine check"
        description="One fixed scenario run through the engine, to eyeball the curve. Development only."
      />
      <EngineCheckChart />
    </div>
  );
}
