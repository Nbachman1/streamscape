"use client";

import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { compact } from "@/lib/format";
import { AXIS, ChartFrame, TOOLTIP_STYLE } from "./chart-frame";

type Row = { release_year: number; total_streams: number; track_count: number };

export function YearArea({ data }: { data: Row[] }) {
  const rows = [...data].sort((a, b) => a.release_year - b.release_year);
  return (
    <ChartFrame height={280}>
      <AreaChart data={rows} margin={{ left: 4, right: 12, top: 8 }}>
        <defs>
          <linearGradient id="streamFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.5} />
            <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
        <XAxis dataKey="release_year" {...AXIS} tickLine={false} axisLine={false} />
        <YAxis
          tickFormatter={(v) => compact(v as number)}
          {...AXIS}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Tooltip
          {...TOOLTIP_STYLE}
          formatter={(v: number, _n, p) => [
            `${compact(v)} streams · ${compact((p?.payload as Row).track_count)} tracks`,
            "Released in",
          ]}
        />
        <Area
          type="monotone"
          dataKey="total_streams"
          stroke="hsl(var(--chart-1))"
          strokeWidth={2}
          fill="url(#streamFill)"
        />
      </AreaChart>
    </ChartFrame>
  );
}
