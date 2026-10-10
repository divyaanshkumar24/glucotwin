import type { Event } from "@/lib/engine";
import { buildDay } from "@/lib/presets";

export type ComparePreset = {
  id: string;
  label: string;
  /** Both scenarios start from the same typical day and differ in one thing. */
  build: (onMetformin: boolean) => { a: Event[]; b: Event[] };
};

type DayChange = Partial<Parameters<typeof buildDay>[0]>;

function pair(onMetformin: boolean, changeA: DayChange, changeB: DayChange) {
  const base = { metformin: onMetformin, dinnerStaple: "roti", lunchWalk: false, chai: "sweet" } as const;
  return {
    a: buildDay({ ...base, prefix: "a", ...changeA }),
    b: buildDay({ ...base, prefix: "b", ...changeB }),
  };
}

export const COMPARE_PRESETS: ComparePreset[] = [
  {
    id: "rice-roti",
    label: "Rice vs roti at dinner",
    build: (m) => pair(m, { dinnerStaple: "rice" }, { dinnerStaple: "roti" }),
  },
  {
    id: "walk",
    label: "Walk after lunch vs no walk",
    build: (m) => pair(m, { lunchWalk: true }, { lunchWalk: false }),
  },
  {
    id: "metformin",
    label: "With vs without metformin",
    build: (m) => pair(m, { metformin: true }, { metformin: false }),
  },
  {
    id: "chai",
    label: "Sweet chai vs plain chai",
    build: (m) => pair(m, { chai: "sweet" }, { chai: "plain" }),
  },
];
