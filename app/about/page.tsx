import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return <PageHeading title="About" />;
}
