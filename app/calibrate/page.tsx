import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "Calibrate · GlucoTwin" };

export default function CalibratePage() {
  return <PageHeading title="Calibrate" />;
}
