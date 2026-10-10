import { ReferenceArea, ReferenceLine } from "recharts";
import { AXIS_TICK, TARGET_HIGH, TARGET_LOW } from "./chart-theme";

const labelStyle = { ...AXIS_TICK, fontSize: 10 };

/** The 70-180 mg/dL band with quiet dashed lines at both edges. Used inside a chart. */
export function TargetBand() {
  return (
    <>
      <ReferenceArea y1={TARGET_LOW} y2={TARGET_HIGH} fill="var(--target-band)" fillOpacity={1} ifOverflow="hidden" />
      <ReferenceLine
        y={TARGET_HIGH}
        stroke="var(--muted)"
        strokeOpacity={0.5}
        strokeDasharray="3 3"
        label={{ value: "180 mg/dL", position: "insideTopLeft", ...labelStyle }}
      />
      <ReferenceLine
        y={TARGET_LOW}
        stroke="var(--muted)"
        strokeOpacity={0.5}
        strokeDasharray="3 3"
        label={{ value: "70 mg/dL", position: "insideBottomLeft", ...labelStyle }}
      />
    </>
  );
}
