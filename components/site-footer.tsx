import { DISCLAIMER } from "@/lib/disclaimer";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto w-full max-w-[1120px] px-4 py-6 text-sm text-muted sm:px-6">
        {DISCLAIMER}
      </div>
    </footer>
  );
}
