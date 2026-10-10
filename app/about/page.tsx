import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Equation, V } from "@/components/equation";
import { PageHeading } from "@/components/page-heading";
import { Tag } from "@/components/ui/tag";

export const metadata: Metadata = { title: "About" };

const TERMS: { symbol: ReactNode; meaning: string }[] = [
  { symbol: <V name="G" />, meaning: "Glucose in your blood, in mg/dL." },
  { symbol: <V name="X" />, meaning: "How strongly insulin is working on your tissues right now. It rises after insulin does and fades slowly." },
  { symbol: <V name="I" />, meaning: "Insulin in your blood, in µU/mL." },
  { symbol: <V name="G" sub="b" />, meaning: "Basal glucose: where you settle when fasting." },
  { symbol: <V name="I" sub="b" />, meaning: "Basal insulin: your fasting insulin level." },
  { symbol: <V name="p" sub="1" />, meaning: "Glucose effectiveness: how fast glucose returns to basal on its own, with no extra insulin." },
  { symbol: <V name="p" sub="2" />, meaning: "How quickly insulin's effect on your tissues fades." },
  { symbol: <V name="p" sub="3" />, meaning: "Insulin sensitivity: how much effect each unit of extra insulin builds. Lower means more insulin resistance." },
  { symbol: <V name="n" />, meaning: "How fast your body clears insulin from the blood." },
  { symbol: <V name="γ" />, meaning: "Beta-cell response: how much insulin the pancreas releases for each mg/dL of glucose above the threshold." },
  { symbol: <V name="h" />, meaning: "The glucose level above which the pancreas starts releasing extra insulin." },
  { symbol: <V name="V" sub="g" />, meaning: "The volume glucose spreads through, set from your body weight (1.7 dL per kg)." },
  { symbol: <>Ra(<V name="t" />)</>, meaning: "Rate at which glucose from food enters the blood at time t." },
];

const LIMITS = [
  "GlucoTwin has not been clinically validated. It has not been tested against measured glucose from a group of patients.",
  "The physiology is simplified: one pool of glucose and one of insulin. It leaves out glucagon, fat and protein in meals, stress, illness, sleep, alcohol and hormones.",
  "Food values are approximate reference figures. Real glycaemic index and carbohydrate content vary with the recipe, cooking and portion.",
  "Several starting constants were chosen by us to give plausible curves, not fitted to patient data.",
  "A few readings from one day cannot separate insulin sensitivity from pancreas response, so calibration mostly adjusts sensitivity.",
  "Simulated numbers should never be used to decide a dose or to change treatment.",
];

const REFERENCES = [
  "Bergman RN, Ider YZ, Bowden CR, Cobelli C. Quantitative estimation of insulin sensitivity. American Journal of Physiology 236(6): E667-E677, 1979.",
  "Bergman RN, Phillips LS, Cobelli C. Physiologic evaluation of factors controlling glucose tolerance in man. Journal of Clinical Investigation 68(6): 1456-1467, 1981.",
  "Nathan DM, Kuenen J, Borg R, Zheng H, Schoenfeld D, Heine RJ. Translating the A1C assay into estimated average glucose values. Diabetes Care 31(8): 1473-1478, 2008.",
  "Atkinson FS, Foster-Powell K, Brand-Miller JC. International tables of glycemic index and glycemic load values: 2008. Diabetes Care 31(12): 2281-2283, 2008.",
  "Atkinson FS, Brand-Miller JC, Foster-Powell K, Buyken AE, Goletzko J. International tables of glycaemic index and glycaemic load values 2021. American Journal of Clinical Nutrition 114(5): 1625-1632, 2021.",
  "Longvah T, Ananthan R, Bhaskarachary K, Venkaiah K. Indian Food Composition Tables 2017. National Institute of Nutrition, Hyderabad.",
];

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-border pt-8">
      <h2 id={id} className="text-xl font-semibold tracking-tight">
        {title}
      </h2>
      <div className="mt-4 max-w-2xl space-y-4 text-muted [&_strong]:font-medium [&_strong]:text-text">{children}</div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-12">
      <PageHeading
        title="About"
        description="How GlucoTwin works, written for someone curious rather than expert."
      />

      <Section id="what" title="What the twin is">
        <p>
          A digital twin is a small model that behaves like a part of you. GlucoTwin&apos;s model covers how glucose,
          insulin and your tissues interact over a day. You describe yourself, add meals, walks and medication, and
          the model works out a glucose curve. Everything runs in your browser. No data leaves your device.
        </p>
      </Section>

      <Section id="model" title="The model">
        <p>
          The core is the Bergman minimal model, published in 1979 and still used in diabetes research. Three
          equations describe how three quantities change from minute to minute.
        </p>
        <div className="space-y-3">
          <Equation label="Change in glucose equals minus p1 plus X times G, plus p1 times Gb, plus Ra of t over Vg">
            <V name="dG" />/<V name="dt" /> = −(<V name="p" sub="1" /> + <V name="X" />) · <V name="G" /> +{" "}
            <V name="p" sub="1" /> · <V name="G" sub="b" /> + Ra(<V name="t" />) / <V name="V" sub="g" />
          </Equation>
          <Equation label="Change in X equals minus p2 times X, plus p3 times insulin above basal">
            <V name="dX" />/<V name="dt" /> = −<V name="p" sub="2" /> · <V name="X" /> + <V name="p" sub="3" /> · (
            <V name="I" /> − <V name="I" sub="b" />)
          </Equation>
          <Equation label="Change in insulin equals minus n times insulin above basal, plus gamma times glucose above h, never below zero">
            <V name="dI" />/<V name="dt" /> = −<V name="n" /> · (<V name="I" /> − <V name="I" sub="b" />) +{" "}
            <V name="γ" /> · max(<V name="G" /> − <V name="h" />, 0)
          </Equation>
        </div>
        <p>
          In words: glucose drifts back to its resting level and is pulled down by insulin&apos;s action, while food
          pushes it up. Insulin&apos;s action builds when insulin is above its resting level. The pancreas releases
          insulin when glucose rises above a threshold, and the body clears it again.
        </p>
        <dl className="divide-y divide-border border-y border-border text-sm">
          {TERMS.map((term, i) => (
            <div key={i} className="grid grid-cols-[4.5rem_1fr] gap-4 py-2.5">
              <dt className="font-mono text-text">{term.symbol}</dt>
              <dd>{term.meaning}</dd>
            </div>
          ))}
        </dl>
        <p>
          The equations are solved on a computer one minute at a time over a full day, using a standard method
          called fourth-order Runge-Kutta. Glucose is never allowed below 40 mg/dL.
        </p>
      </Section>

      <Section id="personal" title="Making it personal">
        <p>Your HbA1c reflects your average glucose over about three months. The twin converts it with the formula from the American Diabetes Association:</p>
        <Equation label="Estimated average glucose equals 28.7 times HbA1c minus 46.7">
          eAG (mg/dL) = 28.7 × HbA1c − 46.7
        </Equation>
        <p>
          Fasting glucose is set to <strong>85 %</strong> of that average, because meals pull the average above the
          fasting level. A higher HbA1c lowers the twin&apos;s insulin sensitivity and beta-cell response. Low
          activity and older age reduce sensitivity a little further. Your weight sets the volume glucose spreads
          through.
        </p>
      </Section>

      <Section id="events" title="Meals, walks and metformin">
        <p>
          <strong>Meals</strong> release glucose along a curve that rises, peaks and tails off. The peak comes about
          35 minutes after eating for fast, high-glycaemic-index foods and about 70 minutes for slow ones. About 90 %
          of the carbohydrate reaches the blood.
        </p>
        <p>
          <strong>Walking</strong> makes muscles take up glucose directly, and raises insulin sensitivity by up to
          1.6 times while you walk, fading over the next 90 minutes.
        </p>
        <p>
          <strong>Metformin</strong> lowers how much glucose the liver releases, by up to 12 %. The effect builds over
          about 2 hours and lasts around 10.
        </p>
      </Section>

      <Section id="calibration" title="Calibration">
        <p>
          Two numbers describe how your body differs from the average person with the same HbA1c: insulin
          sensitivity and beta-cell response. When you enter glucometer readings, GlucoTwin tries many combinations of
          the two, simulates your day for each, and keeps the combination whose curve passes closest to your readings.
          It searches a coarse grid first and then finer grids around the best point.
        </p>
        <p>
          Glucose readings alone cannot fully tell the two apart, so the search prefers explanations that change
          insulin sensitivity.
        </p>
      </Section>

      <Section id="insights" title="Insights">
        <p>
          The insights are fixed rules, such as &quot;find the meal with the largest carbohydrate load before the
          peak&quot;. Where a suggestion has a number, such as a lower peak after swapping rice for rotis, GlucoTwin
          gets it by running the simulation again with that change. There is no AI service behind them.
        </p>
      </Section>

      <Section id="limits" title="Limitations">
        <p className="flex items-center gap-2 text-text">
          Please read these. <Tag label="Demo" />
          <span className="text-sm text-muted">The sample patient and sample readings are made up.</span>
        </p>
        <ul className="list-disc space-y-2 pl-5">
          {LIMITS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="text-text">Educational tool. Not a medical device. Always follow your doctor&apos;s advice.</p>
      </Section>

      <Section id="references" title="References">
        <ul className="space-y-2 text-sm">
          {REFERENCES.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
