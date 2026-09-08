"use client";

import { Bar, BarChart, CartesianGrid, Cell, Tooltip, XAxis, YAxis } from "recharts";
import { compact } from "@/lib/format";
import { AXIS, ChartFrame, TOOLTIP_STYLE } from "./chart-frame";

type Row = { genre: string; total_streams: number; track_count: number };

export function GenreBar({ data }: { data: Row[] }) {
  const rows = [...data].sort((a, b) => b.total_streams - a.total_streams).slice(0, 12);
  return (
    <ChartFrame height={340}>
      <BarChart data={rows} layout="vertical" margin={{ left: 12, right: 24 }}>
        <CartesianGrid horizontal={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
        <XAxis
          type="number"
          tickFormatter={(v) => compact(v as number)}
          {...AXIS}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          type="category"
          dataKey="genre"
          width={78}
          {...AXIS}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          {...TOOLTIP_STYLE}
          formatter={(v: number, _n, p) => [
            `${compact(v)} streams · ${compact((p?.payload as Row).track_count)} tracks`,
            (p?.payload as Row).genre,
          ]}
        />
        <Bar dataKey="total_streams" radius={[0, 4, 4, 0]}>
          {rows.map((_, i) => (
            <Cell key={i} fill={`hsl(var(--chart-${(i % 5) + 1}))`} />
          ))}
        </Bar>
      </BarChart>
    </ChartFrame>
  );
}
