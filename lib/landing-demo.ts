import { createTwin, simulate, type Metrics } from "@/lib/engine";
import { presetMeal, presetWalk } from "@/lib/presets";
import { SAMPLE_PATIENT } from "@/lib/profile-form";

const DINNER = 20 * 60;

export type DemoPoint = { minute: number; rice: number; roti: number };

export type LandingDemo = {
  data: DemoPoint[];
  rice: Metrics;
  roti: Metrics;
  riceCarbsG: number;
  rotiCarbsG: number;
};

/**
 * The curve shown on the landing page: the sample patient's dinner of rice and dal, against
 * roti and dal followed by a 15-minute walk. It is the real engine run, not a drawing.
 */
export function buildLandingDemo(): LandingDemo {
  const twin = createTwin(SAMPLE_PATIENT.profile);
  const dal = presetMeal("demo", DINNER, "dal", 1);
  const rice = presetMeal("demo-a", DINNER, "white-rice", 1);
  const roti = presetMeal("demo-b", DINNER, "roti", 2);

  const riceDay = simulate(twin, { events: [rice, dal] });
  const rotiDay = simulate(twin, { events: [roti, dal, presetWalk("demo-b", DINNER + 30, 15)] });

  // Only the evening matters here, and every 5th minute is plenty for a small chart.
  const data = riceDay.series
    .filter((p) => p.minute >= 18 * 60 && p.minute % 5 === 0)
    .map((p) => ({ minute: p.minute, rice: p.glucose, roti: rotiDay.series[p.minute].glucose }));

  return {
    data,
    rice: riceDay.metrics,
    roti: rotiDay.metrics,
    riceCarbsG: rice.carbsG + dal.carbsG,
    rotiCarbsG: roti.carbsG + dal.carbsG,
  };
}
