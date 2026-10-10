import { Button } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";

const EXAMPLE_MESSAGES = [
  { from: "You", text: "Why did my glucose go up so much after dinner?" },
  {
    from: "Coach",
    text: "Dinner was about 64 g of carbs, mostly rice. That is more than lunch, and you did not walk afterwards. Your twin peaked at 22:15.",
  },
  { from: "You", text: "What is one thing I could change tomorrow?" },
  {
    from: "Coach",
    text: "Try 2 rotis instead of the rice, then a 15-minute walk. Your twin expects a lower and shorter evening peak.",
  },
];

/**
 * A static picture of a possible future feature. Nothing here is generated, the messages are
 * fixed examples, and the input is switched off.
 */
export function CoachPreview() {
  return (
    <section aria-labelledby="coach-heading" className="border-t border-border pt-6">
      <div className="flex items-center gap-2">
        <h2 id="coach-heading" className="text-sm font-semibold tracking-tight">
          Coach chat
        </h2>
        <Tag label="Planned" />
      </div>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        A conversational coach is on the roadmap. This is a fixed example of how it could look. It is not connected to
        anything and cannot answer you yet.
      </p>

      <div className="mt-4 max-w-2xl rounded-md border border-border bg-surface">
        <ul className="space-y-4 px-4 py-4" aria-label="Example conversation">
          {EXAMPLE_MESSAGES.map((message, i) => (
            <li key={i}>
              <span className="text-xs text-muted">{message.from}, example</span>
              <p className="mt-0.5 text-sm text-muted">{message.text}</p>
            </li>
          ))}
        </ul>
        <form className="flex gap-2 border-t border-border p-3" onSubmit={(e) => e.preventDefault()}>
          <label htmlFor="coach-input" className="sr-only">
            Message to the coach (not available yet)
          </label>
          <input
            id="coach-input"
            disabled
            placeholder="Ask about your day (not available yet)"
            className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm placeholder:text-muted"
          />
          <Button type="submit" variant="secondary" disabled className="h-9">
            Send
          </Button>
        </form>
      </div>
    </section>
  );
}
