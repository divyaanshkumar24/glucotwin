import Link from "next/link";
import { PageHeading } from "@/components/page-heading";
import { ButtonLink } from "@/components/ui/button";

export default function Home() {
  return (
    <div>
      <PageHeading
        title="GlucoTwin"
        description="A personal model of your glucose-insulin system, for trying out meals, walks and medication before you live them."
      />
      <div className="mt-6 flex items-center gap-4">
        <ButtonLink href="/onboarding">Create your twin</ButtonLink>
        <Link href="/simulator" className="text-sm text-muted transition-colors duration-150 ease-out hover:text-text">
          Open simulator
        </Link>
      </div>
    </div>
  );
}
