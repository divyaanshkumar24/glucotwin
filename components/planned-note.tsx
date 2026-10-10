import type { ReactNode } from "react";
import { Tag } from "@/components/ui/tag";

/** One quiet line saying what this page will do once it is built. */
export function PlannedNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted">
      <Tag label="Planned" />
      {children}
    </p>
  );
}
