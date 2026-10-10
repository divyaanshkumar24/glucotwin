/** Small neutral label for anything simulated ("Demo") or not built yet ("Planned"). */
export function Tag({ label }: { label: "Demo" | "Planned" }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-border px-1.5 py-px text-xs font-normal text-muted">
      {label}
    </span>
  );
}
