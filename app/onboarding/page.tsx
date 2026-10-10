import type { Metadata } from "next";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";

export const metadata: Metadata = { title: "Create your twin · GlucoTwin" };

export default function OnboardingPage() {
  return <OnboardingFlow />;
}
