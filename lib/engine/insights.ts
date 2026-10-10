import {
  MIN_BENEFIT_MG_DL,
  applySwap,
  bestSwap,
  buildContext,
  capitalise,
  clock,
  foodNameOf,
  minutesAbove180,
  peakDrop,
  rerun,
  spikeMeal,
  SWAPS,
  windowPeak,
  type DayContext,
  type MealGroup,
} from "./insight-context";
import { simulate } from "./model";
import type { Event, MealEvent, Metrics, Profile, Scenario, SimResult, TwinParams, WalkEvent } from "./types";

export type Severity = "info" | "watch" | "alert";

export type Insight = {
  id: string;
  severity: Severity;
  title: string;
  body: string;
  /** The meal, walk or dose on the chart that this insight is about. */
  relatedEventId?: string;
  /** Estimated drop in the following peak (mg/dL) if the suggestion is followed, from re-running the day. */
  benefitMgDl?: number;
  /** One-sentence version of the suggestion, a candidate for the weekly tip. */
  tip?: string;
};

export type InsightReport = {
  insights: Insight[];
  weeklyTip: string;
};

type Rule = (ctx: DayContext) => Insight[];

const SEVERITY_RANK: Record<Severity, number> = { alert: 0, watch: 1, info: 2 };

/** Shown when no rule found a specific suggestion with a number attached. */
const DEFAULT_TIP = "This week, try a 15-minute walk after your largest meal.";

const SAFETY_LOW = 70;
const SAFETY_HIGH = 300;

export const SAFETY_MESSAGE = "This pattern could be unsafe. Please discuss it with your doctor.";

/** Whether the simulated day goes low enough or high enough that we should say so plainly. */
export function safetyReason(metrics: Metrics): string | null {
  if (metrics.lowest < SAFETY_LOW) return `Simulated glucose drops below ${SAFETY_LOW} mg/dL.`;
  if (metrics.peak > SAFETY_HIGH) return `Simulated glucose rises above ${SAFETY_HIGH} mg/dL.`;
  return null;
}

const round = (value: number) => Math.round(value);

/** A 15-minute walk added to the day, starting at `minute`. */
function withWalk(events: Event[], minute: number): Event[] {
  const walk: WalkEvent = { type: "walk", id: "insight-walk", minute, durationMin: 15 };
  return [...events, walk];
}

function mainFoodOf(meal: MealGroup): MealEvent {
  return meal.events.reduce((a, b) => (b.carbsG > a.carbsG ? b : a));
}

// ---------------------------------------------------------------------------
// Rules. Each looks at one pattern in the day and returns zero or more insights.
// ---------------------------------------------------------------------------

/** The day's highest point, which meal most likely caused it, and one small change that would help. */
const biggestSpike: Rule = (ctx) => {
  const { peak, peakMinute } = ctx.result.metrics;
  const cause = spikeMeal(ctx);
  if (peak <= 180) return [];
  const severity: Severity = peak > SAFETY_HIGH ? "alert" : "watch";
  const title = `Highest point: ${round(peak)} mg/dL at ${clock(peakMinute)}`;
  if (!cause) {
    return [{ id: "biggest-spike", severity, title, body: "No meal in the 2 hours before it explains this peak." }];
  }

  const main = mainFoodOf(cause);
  const cluster = `${cause.name} at ${clock(cause.minute)} is the likely cause: about ${round(cause.carbsG)} g of carbs, mostly ${foodNameOf(main.foodId).toLowerCase()}.`;
  const swap = bestSwap(ctx, cause.events);
  if (swap) {
    const text = swap.swap.describe(swap.event.portions);
    return [
      {
        id: "biggest-spike",
        severity,
        title,
        body: `${cluster} In the simulation, you could ${text}: about ${round(swap.benefit)} mg/dL lower peak.`,
        relatedEventId: cause.events[0].id,
        benefitMgDl: round(swap.benefit),
        tip: `This week, ${text} at ${cause.name.toLowerCase()}; in the simulation it lowers your biggest spike by about ${round(swap.benefit)} mg/dL.`,
      },
    ];
  }

  // No ready-made swap: see what a quarter less of the largest item would do.
  const trimmed = ctx.scenario.events.map((e) =>
    e.id === main.id ? { ...main, portions: main.portions * 0.75, carbsG: main.carbsG * 0.75 } : e,
  );
  const benefit = peakDrop(ctx, rerun(ctx, trimmed), cause.minute);
  const advice =
    benefit >= MIN_BENEFIT_MG_DL
      ? ` Having about a quarter less ${foodNameOf(main.foodId).toLowerCase()} would lower the peak by about ${round(benefit)} mg/dL.`
      : "";
  return [
    {
      id: "biggest-spike",
      severity,
      title,
      body: `${cluster}${advice}`,
      relatedEventId: cause.events[0].id,
      ...(advice
        ? {
            benefitMgDl: round(benefit),
            tip: `This week, have a quarter less ${foodNameOf(main.foodId).toLowerCase()} at ${cause.name.toLowerCase()}; in the simulation it lowers your biggest spike by about ${round(benefit)} mg/dL.`,
          }
        : {}),
    },
  ];
};

/** A helpful swap in a meal other than the one behind the peak, for example rice at lunch. */
const swapElsewhere: Rule = (ctx) => {
  const cause = spikeMeal(ctx);
  const others = ctx.meals.filter((m) => m !== cause).flatMap((m) => m.events);
  const swap = bestSwap(ctx, others);
  if (!swap) return [];
  const meal = ctx.meals.find((m) => m.events.includes(swap.event));
  const text = swap.swap.describe(swap.event.portions);
  const when = meal ? `${meal.name.toLowerCase()} at ${clock(meal.minute)}` : "that meal";
  return [
    {
      id: "swap-elsewhere",
      severity: "info",
      title: `A small swap at ${meal?.name.toLowerCase() ?? "a meal"}`,
      body: `In the simulation, you could ${text} at ${when}: about ${round(swap.benefit)} mg/dL lower peak after that meal.`,
      relatedEventId: swap.event.id,
      benefitMgDl: round(swap.benefit),
      tip: `This week, ${text} at ${meal?.name.toLowerCase() ?? "one meal"}; in the simulation it lowers that spike by about ${round(swap.benefit)} mg/dL.`,
    },
  ];
};

/** Glucose that stays above 180 for a long time after the evening meal, and whether a walk would shorten it. */
const longHighAfterDinner: Rule = (ctx) => {
  const dinner = [...ctx.meals].reverse().find((m) => m.minute >= 18 * 60);
  if (!dinner) return [];
  const end = Math.min(dinner.minute + 240, 1440);
  const above = minutesAbove180(ctx.result.series, dinner.minute, end);
  if (above < 90) return [];

  const alreadyWalks = ctx.walks.some((w) => w.minute >= dinner.minute - 15 && w.minute <= dinner.minute + 90);
  let advice = "";
  let benefit: number | undefined;
  if (!alreadyWalks) {
    const changed = rerun(ctx, withWalk(ctx.scenario.events, dinner.minute + 15));
    const saved = above - minutesAbove180(changed.series, dinner.minute, end);
    if (saved >= 10) {
      advice = ` A 15-minute walk starting 15 minutes after dinner would cut that by about ${round(saved)} minutes in the simulation.`;
      benefit = round(Math.max(peakDrop(ctx, changed, dinner.minute), 0));
    }
  }
  return [
    {
      id: "long-high-after-dinner",
      severity: "watch",
      title: `Above 180 mg/dL for about ${(above / 60).toFixed(1)} hours after dinner`,
      body: `Glucose stays high from dinner at ${clock(dinner.minute)}.${advice}`,
      relatedEventId: dinner.events[0].id,
      ...(advice
        ? {
            benefitMgDl: benefit,
            tip: "This week, try a 15-minute walk starting 15 minutes after dinner to shorten the evening high.",
          }
        : {}),
    },
  ];
};

/** A walk that clearly lowered the spike that followed it: worth saying, so it gets repeated. */
const walkHelped: Rule = (ctx) =>
  ctx.walks.flatMap((walk) => {
    const without = rerun(ctx, ctx.scenario.events.filter((e) => e.id !== walk.id));
    const drop =
      windowPeak(without.series, walk.minute, walk.minute + 180) -
      windowPeak(ctx.result.series, walk.minute, walk.minute + 180);
    if (drop < 3) return [];
    return [
      {
        id: `walk-helped-${walk.id}`,
        severity: "info" as const,
        title: `Your ${walk.durationMin}-minute walk at ${clock(walk.minute)} helps`,
        body: `In the simulation it lowers the glucose peak that follows by about ${round(drop)} mg/dL.`,
        relatedEventId: walk.id,
      },
    ];
  });

/** A breakfast made of fast-digesting foods, which pushes glucose up quickly at the start of the day. */
const highGiBreakfast: Rule = (ctx) => {
  const breakfast = ctx.meals.find((m) => m.minute >= 5 * 60 && m.minute < 10.5 * 60);
  if (!breakfast || breakfast.carbsG < 30 || breakfast.gi < 65) return [];
  const swap = bestSwap(ctx, breakfast.events);
  const base = `Breakfast at ${clock(breakfast.minute)} has about ${round(breakfast.carbsG)} g of carbs with an average glycaemic index near ${round(breakfast.gi)}, so it is absorbed quickly.`;
  const text = swap?.swap.describe(swap.event.portions);
  return [
    {
      id: "fast-breakfast",
      severity: breakfast.gi >= 70 ? "watch" : "info",
      title: "Fast-digesting breakfast",
      body: swap
        ? `${base} In the simulation, you could ${text}: about ${round(swap.benefit)} mg/dL lower peak.`
        : `${base} Adding curd or choosing besan chilla slows it down.`,
      relatedEventId: breakfast.events[0].id,
      ...(swap
        ? {
            benefitMgDl: round(swap.benefit),
            tip: `This week, ${text} at breakfast; in the simulation it lowers that spike by about ${round(swap.benefit)} mg/dL.`,
          }
        : {}),
    },
  ];
};

/** Chai with sugar and sweet lassi: liquid sugar reaches the blood quickly. */
const sugaryDrinks: Rule = (ctx) => {
  const sweet = ctx.scenario.events.filter(
    (e): e is MealEvent => e.type === "meal" && (e.foodId === "chai-sugar" || e.foodId === "sweet-lassi"),
  );
  const carbs = sweet.reduce((sum, e) => sum + e.carbsG, 0);
  if (carbs < 14) return [];

  const swapped = sweet.reduce((events, e) => applySwap(events, e, SWAPS[e.foodId]), ctx.scenario.events);
  const meanDrop = ctx.result.metrics.mean - rerun(ctx, swapped).metrics.mean;
  const names = [...new Set(sweet.map((e) => foodNameOf(e.foodId).toLowerCase()))].join(" and ");
  return [
    {
      id: "sugary-drinks",
      severity: carbs >= 28 ? "watch" : "info",
      title: "Sweet drinks add carbs quickly",
      body: `${capitalise(names)} adds about ${round(carbs)} g of carbs.${
        meanDrop >= 1 ? ` Having them without sugar, or swapping the lassi for curd, would lower your average glucose by about ${round(meanDrop)} mg/dL.` : ""
      }`,
      relatedEventId: sweet[0].id,
    },
  ];
};

/** A big meal late in the evening leaves glucose high going into the night. */
const lateHeavyDinner: Rule = (ctx) => {
  const late = [...ctx.meals].reverse().find((m) => m.minute >= 21 * 60 && m.carbsG >= 60);
  if (!late) return [];
  const ids = late.events.map((e) => e.id);
  const earlier = ctx.scenario.events.map((e) => (ids.includes(e.id) ? { ...e, minute: e.minute - 90 } : e));
  const lower = ctx.result.series[1440].glucose - rerun(ctx, earlier).series[1440].glucose;
  return [
    {
      id: "late-heavy-dinner",
      severity: "watch",
      title: "Late, heavy dinner",
      body:
        `Dinner at ${clock(late.minute)} has about ${round(late.carbsG)} g of carbs. ` +
        (lower >= 5
          ? `Eating it 90 minutes earlier would leave glucose about ${round(lower)} mg/dL lower at midnight.`
          : "Eating earlier gives your body more time to bring glucose down before sleep."),
      relatedEventId: late.events[0].id,
    },
  ];
};

/** A very large carbohydrate load in one sitting; shows what a smaller portion would do. */
const largeMeal: Rule = (ctx) => {
  const cause = spikeMeal(ctx);
  return ctx.meals
    .filter((m) => m !== cause && m.carbsG >= 80)
    .map((meal) => {
      const factor = 60 / meal.carbsG;
      const ids = meal.events.map((e) => e.id);
      const smaller = ctx.scenario.events.map((e) =>
        ids.includes(e.id) && e.type === "meal"
          ? { ...e, portions: e.portions * factor, carbsG: e.carbsG * factor }
          : e,
      );
      const benefit = peakDrop(ctx, rerun(ctx, smaller), meal.minute);
      return {
        id: `large-meal-${meal.minute}`,
        severity: "watch" as const,
        title: `${meal.name} is a large carbohydrate load`,
        body:
          `${meal.name} at ${clock(meal.minute)} has about ${round(meal.carbsG)} g of carbs.` +
          (benefit >= MIN_BENEFIT_MG_DL
            ? ` Keeping it nearer 60 g would lower the peak after it by about ${round(benefit)} mg/dL.`
            : " Smaller portions spread over the day are easier on glucose."),
        relatedEventId: meal.events[0].id,
      };
    });
};

/** No walking at all: the easiest thing to add, so show the effect of one short walk after the biggest meal. */
const noActivity: Rule = (ctx) => {
  if (ctx.walks.length > 0 || ctx.meals.length === 0) return [];
  const target = ctx.meals.reduce((a, b) => (b.carbsG > a.carbsG ? b : a));
  const benefit = peakDrop(ctx, rerun(ctx, withWalk(ctx.scenario.events, target.minute + 15)), target.minute);
  const helps = benefit >= 2;
  return [
    {
      id: "no-activity",
      severity: ctx.profile.activityLevel === "low" ? "watch" : "info",
      title: "No walking planned today",
      body: helps
        ? `Try a 15-minute walk after ${target.name.toLowerCase()}. In the simulation it lowers the peak after that meal by about ${round(benefit)} mg/dL.`
        : `Try a 15-minute walk after ${target.name.toLowerCase()}. Muscles take up glucose while you walk, and stay more sensitive to insulin afterwards.`,
      relatedEventId: target.events[0].id,
      ...(helps
        ? {
            benefitMgDl: round(benefit),
            tip: `This week, try a 15-minute walk after ${target.name.toLowerCase()}; in the simulation it lowers that spike by about ${round(benefit)} mg/dL.`,
          }
        : {}),
    },
  ];
};

/** Many hours above 180 across the day, whatever the cause. */
const sustainedHigh: Rule = (ctx) => {
  const hours = ctx.result.metrics.hoursAbove180;
  if (hours < 4) return [];
  return [
    {
      id: "sustained-high",
      severity: "watch",
      title: `Above 180 mg/dL for ${hours.toFixed(1)} hours`,
      body: "That is a large share of the day. Spreading carbohydrates across the day and walking after meals both help.",
    },
  ];
};

/** Glucose below 70 mg/dL is more urgent than high glucose, so it is worded calmly but clearly. */
const lowGlucose: Rule = (ctx) => {
  const { lowest, minutesBelow70 } = ctx.result.metrics;
  if (lowest < 70) {
    return [
      {
        id: "low-glucose",
        severity: "alert",
        title: `Glucose goes below 70 mg/dL for ${minutesBelow70} minutes`,
        body: "Low glucose matters more than high glucose. Please talk to your doctor about this pattern, especially if you take diabetes medicines. Do not change your medication on your own.",
      },
    ];
  }
  if (lowest < 80) {
    return [
      {
        id: "near-low-glucose",
        severity: "watch",
        title: `Glucose gets close to the low range (${round(lowest)} mg/dL)`,
        body: "It stays above 70 mg/dL, but with little margin. Skipped or delayed meals could push it lower.",
      },
    ];
  }
  return [];
};

/** Metformin is usually taken with or just after food, which also eases stomach upset. */
const metforminTiming: Rule = (ctx) =>
  ctx.meds.flatMap((dose) => {
    const nearMeal = ctx.meals.some((m) => m.minute >= dose.minute - 15 && m.minute <= dose.minute + 45);
    if (nearMeal) return [];
    return [
      {
        id: `metformin-timing-${dose.id}`,
        severity: "info" as const,
        title: `Metformin at ${clock(dose.minute)} is not near a meal`,
        body: "Metformin is usually taken with or just after food. Ask your doctor or pharmacist what suits you.",
        relatedEventId: dose.id,
      },
    ];
  });

/** The profile says metformin, but the day has no dose. */
const missingMetformin: Rule = (ctx) => {
  if (!ctx.profile.onMetformin || ctx.meds.length > 0) return [];
  return [
    {
      id: "missing-metformin",
      severity: "info",
      title: "No metformin dose in this day",
      body: "Your profile says you take metformin. Add your dose to see its effect on this day.",
    },
  ];
};

/** Positive reinforcement: a day that meets the common goal deserves to be said out loud. */
const goodTimeInRange: Rule = (ctx) => {
  const { timeInRangePct } = ctx.result.metrics;
  if (timeInRangePct < 70) return [];
  return [
    {
      id: "good-time-in-range",
      severity: "info",
      title: `Good day: ${round(timeInRangePct)} % of the time in range`,
      body: "That meets the common goal of more than 70 % of the day between 70 and 180 mg/dL.",
    },
  ];
};

const RULES: Rule[] = [
  biggestSpike,
  longHighAfterDinner,
  lowGlucose,
  swapElsewhere,
  highGiBreakfast,
  lateHeavyDinner,
  largeMeal,
  sugaryDrinks,
  noActivity,
  sustainedHigh,
  walkHelped,
  metforminTiming,
  missingMetformin,
  goodTimeInRange,
];

/**
 * Read the simulated day and list what is worth knowing, most important first, plus one tip
 * for the week. Every number in a suggestion comes from re-running the simulation with that
 * change applied. No AI service is involved: these are fixed rules.
 */
export function analyzeDay(
  params: TwinParams,
  scenario: Scenario,
  profile: Profile,
  result: SimResult = simulate(params, scenario),
): InsightReport {
  if (scenario.events.length === 0) {
    return {
      insights: [
        {
          id: "empty-day",
          severity: "info",
          title: "Nothing planned yet",
          body: "Add a meal, a walk or a dose, or start from a preset, and your twin will respond.",
        },
      ],
      weeklyTip: DEFAULT_TIP,
    };
  }

  const ctx = buildContext(params, scenario, profile, result);
  const insights = RULES.flatMap((rule) => rule(ctx)).sort(
    (a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity],
  );

  // The tip with the biggest simulated benefit wins.
  const best = insights
    .filter((i) => i.tip)
    .sort((a, b) => (b.benefitMgDl ?? 0) - (a.benefitMgDl ?? 0))[0];
  return { insights, weeklyTip: best?.tip ?? DEFAULT_TIP };
}
