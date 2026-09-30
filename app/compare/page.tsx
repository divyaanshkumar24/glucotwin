import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "Compare · GlucoTwin" };

export default function ComparePage() {
  return <PageHeading title="Compare" />;
}
