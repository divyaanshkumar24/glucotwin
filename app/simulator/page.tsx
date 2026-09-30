import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "Simulator · GlucoTwin" };

export default function SimulatorPage() {
  return <PageHeading title="Simulator" />;
}
