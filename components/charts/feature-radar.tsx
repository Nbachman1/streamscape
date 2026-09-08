"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
} from "recharts";
import { ChartFrame, TOOLTIP_STYLE } from "./chart-frame";

/** values expected on a 0-1 scale */
export function FeatureRadar({
  features,
}: {
  features: { label: string; value: number }[];
}) {
  return (
    <ChartFrame height={260}>
      <RadarChart data={features} outerRadius="72%">
        <PolarGrid stroke="hsl(var(--border))" />
        <PolarAngleAxis
          dataKey="label"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
        />
        <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
        <Tooltip
          {...TOOLTIP_STYLE}
          formatter={(v: number) => [(v as number).toFixed(2), "Score"]}
        />
        <Radar
          dataKey="value"
          stroke="hsl(var(--chart-1))"
          fill="hsl(var(--chart-1))"
          fillOpacity={0.35}
          strokeWidth={2}
        />
      </RadarChart>
    </ChartFrame>
  );
}
