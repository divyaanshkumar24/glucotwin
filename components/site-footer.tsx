import { DISCLAIMER } from "@/lib/disclaimer";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-1 px-4 py-6 text-sm text-muted sm:flex-row sm:justify-between sm:gap-6 sm:px-6">
        <p>{DISCLAIMER}</p>
        <p className="shrink-0">Built for UnivaBio 2026</p>
      </div>
    </footer>
  );
}
