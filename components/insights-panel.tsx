"use client";

import clsx from "clsx";
import type { Insight, InsightReport, Severity } from "@/lib/engine";

const DOT_CLASS: Record<Severity, string> = { info: "bg-muted", watch: "bg-high", alert: "bg-low" };
const SEVERITY_WORD: Record<Severity, string> = { info: "Info", watch: "Watch", alert: "Alert" };

type InsightsPanelProps = {
  report: InsightReport;
  highlightedEventId: string | null;
  /** Called with the insight's event id, or null to clear the highlight. */
  onHighlight: (eventId: string | null) => void;
};

/** A quiet list of what the day shows. Insights tied to an event can be clicked to find it on the chart. */
export function InsightsPanel({ report, highlightedEventId, onHighlight }: InsightsPanelProps) {
  return (
    <section aria-labelledby="insights-heading">
      <h2 id="insights-heading" className="text-sm font-semibold tracking-tight">
        What your day shows
      </h2>
      <p className="mt-3 max-w-2xl">
        <span className="block text-xs text-muted">Tip for this week</span>
        <span className="mt-1 block text-lg font-medium tracking-tight">{report.weeklyTip}</span>
      </p>
      <ul className="mt-5 divide-y divide-border border-y border-border">
        {report.insights.map((insight) => (
          <InsightRow
            key={insight.id}
            insight={insight}
            active={insight.relatedEventId !== undefined && insight.relatedEventId === highlightedEventId}
            onHighlight={onHighlight}
          />
        ))}
      </ul>
    </section>
  );
}

type InsightRowProps = {
  insight: Insight;
  active: boolean;
  onHighlight: (eventId: string | null) => void;
};

function InsightRow({ insight, active, onHighlight }: InsightRowProps) {
  const content = (
    <>
      <span aria-hidden className={clsx("mt-[7px] size-2 shrink-0 rounded-full", DOT_CLASS[insight.severity])} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-sm font-medium">{insight.title}</span>
          <span className="text-xs text-muted">{SEVERITY_WORD[insight.severity]}</span>
        </span>
        <span className="mt-0.5 block text-sm text-muted">{insight.body}</span>
        {insight.relatedEventId && (
          <span className="mt-1 block text-xs text-muted">
            {active ? "Shown on the chart. Click to clear." : "Click to show on the chart."}
          </span>
        )}
      </span>
    </>
  );

  return (
    <li>
      {insight.relatedEventId ? (
        <button
          type="button"
          aria-pressed={active}
          onClick={() => onHighlight(active ? null : (insight.relatedEventId ?? null))}
          className={clsx(
            "flex w-full gap-3 px-1 py-3 text-left transition-colors duration-150 ease-out hover:bg-surface",
            active && "bg-surface",
          )}
        >
          {content}
        </button>
      ) : (
        <div className="flex gap-3 px-1 py-3">{content}</div>
      )}
    </li>
  );
}
