import clsx from "clsx";
import type { ComparisonRow, Verdict } from "@/lib/engine";

const VERDICT_CLASS: Record<Verdict, string> = {
  better: "text-in-range",
  worse: "text-high",
  same: "text-muted",
};

/** "+12" or "−1.5"; a true minus sign lines up better with the plus in mono type. */
function signed(value: number, decimals: number): string {
  const rounded = Number(value.toFixed(decimals));
  if (rounded === 0) return (0).toFixed(decimals);
  return `${rounded > 0 ? "+" : "−"}${Math.abs(rounded).toFixed(decimals)}`;
}

/** Metric by metric: A, B and B minus A. Green where B is better, amber where it is worse. */
export function ComparisonTable({ rows }: { rows: ComparisonRow[] }) {
  return (
    <table className="w-full border-collapse text-sm">
      <caption className="sr-only">Comparison of scenario A and scenario B</caption>
      <thead>
        <tr className="border-b border-border text-left text-xs text-muted">
          <th scope="col" className="py-2 pr-3 font-normal">Metric</th>
          <th scope="col" className="px-3 py-2 text-right font-normal">A</th>
          <th scope="col" className="px-3 py-2 text-right font-normal">B</th>
          <th scope="col" className="py-2 pl-3 text-right font-normal">Difference (B − A)</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-b border-border">
            <th scope="row" className="py-3 pr-3 text-left font-normal">
              {row.label}
            </th>
            <td className="px-3 py-3 text-right font-mono">{row.a.toFixed(row.decimals)}</td>
            <td className="px-3 py-3 text-right font-mono">{row.b.toFixed(row.decimals)}</td>
            <td className={clsx("py-3 pl-3 text-right font-mono", VERDICT_CLASS[row.verdict])}>
              {signed(row.diff, row.decimals)} <span className="text-xs text-muted">{row.unit}</span>
              <span className="sr-only"> ({row.verdict === "same" ? "about the same" : `${row.verdict} in B`})</span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
