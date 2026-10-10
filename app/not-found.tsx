import { PageHeading } from "@/components/page-heading";
import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="space-y-6">
      <PageHeading title="Page not found" description="That address does not lead anywhere in GlucoTwin." />
      <ButtonLink href="/">Back to the start</ButtonLink>
    </div>
  );
}
