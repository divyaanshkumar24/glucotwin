import { LandingChart } from "@/components/landing-chart";
import { SamplePatientButton } from "@/components/sample-patient-button";
import { ButtonLink } from "@/components/ui/button";
import { Tag } from "@/components/ui/tag";
import { buildLandingDemo } from "@/lib/landing-demo";

const STEPS = [
  {
    title: "Create your twin",
    text: "Enter your age, weight, activity level and latest HbA1c. GlucoTwin builds a model of your glucose-insulin system from them.",
  },
  {
    title: "Experiment",
    text: "Add meals, walks and metformin to a day and watch the glucose curve respond. Compare puts two versions of a day side by side.",
  },
  {
    title: "Calibrate",
    text: "Type in a few glucometer readings. The twin adjusts itself until its curve passes close to them.",
  },
];

const REAL = [
  "Glucose-insulin model (Bergman minimal model)",
  "Day simulator with Indian foods, walks and metformin",
  "Compare mode for what-if days",
  "Calibration from glucometer readings",
  "Rule-based insights with simulated benefits",
];

const PLANNED = [
  "Hindi and regional languages",
  "CGM and glucometer sync",
  "Conversational coach",
  "Doctor report",
  "Clinical validation",
];

export default function Home() {
  const demo = buildLandingDemo();
  const drop = demo.rice.peak - demo.roti.peak;

  return (
    <div className="space-y-20">
      <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-center lg:gap-14">
        <div>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl">
            Try tomorrow&apos;s meal on your digital twin before your body does.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted">
            If you live with Type 2 diabetes, GlucoTwin shows how a meal, a walk or a tablet is likely to move your
            glucose, so you can see cause and effect before you try it.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <ButtonLink href="/onboarding">Create your twin</ButtonLink>
            <SamplePatientButton />
          </div>
        </div>

        <figure className="min-w-0 rounded-md border border-border bg-surface p-4">
          <LandingChart data={demo.data} />
          <figcaption className="mt-4 border-t border-border pt-3 text-sm text-muted">
            <span className="mb-1.5 flex items-center gap-2 text-text">
              Sample patient, dinner at 20:00 <Tag label="Demo" />
            </span>
            Ramesh (HbA1c <span className="font-mono">8.1</span> %) peaks at{" "}
            <span className="font-mono text-text">{demo.rice.peak.toFixed(0)}</span> mg/dL after rice and dal (
            <span className="font-mono">{demo.riceCarbsG.toFixed(0)}</span> g carbs), and at{" "}
            <span className="font-mono text-text">{demo.roti.peak.toFixed(0)}</span> mg/dL after 2 rotis, dal and a
            15-minute walk (<span className="font-mono">{demo.rotiCarbsG.toFixed(0)}</span> g carbs):{" "}
            <span className="font-mono text-text">{drop.toFixed(0)}</span> mg/dL lower. Run by the same engine the
            simulator uses.
          </figcaption>
        </figure>
      </section>

      <section aria-labelledby="how-heading">
        <h2 id="how-heading" className="text-xl font-semibold tracking-tight">
          How it works
        </h2>
        <ol className="mt-6 max-w-2xl divide-y divide-border border-y border-border">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-5 py-5">
              <span className="w-6 shrink-0 pt-0.5 font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="mt-1 text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="status-heading">
        <h2 id="status-heading" className="text-xl font-semibold tracking-tight">
          What&apos;s real and what&apos;s planned
        </h2>
        <div className="mt-6 grid gap-10 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium">Working today</h3>
            <ul className="mt-3 space-y-2 text-muted">
              {REAL.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-medium">
              Not built yet <Tag label="Planned" />
            </h3>
            <ul className="mt-3 space-y-2 text-muted">
              {PLANNED.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
