"use client";

import { ResponsiveContainer } from "recharts";

export function ChartFrame({
  height = 280,
  children,
}: {
  height?: number;
  children: React.ReactElement;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export const AXIS = {
  stroke: "hsl(var(--muted-foreground))",
  fontSize: 12,
};

export const TOOLTIP_STYLE = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
    fontSize: 12,
    color: "hsl(var(--popover-foreground))",
  },
  labelStyle: { color: "hsl(var(--foreground))", fontWeight: 600 },
  cursor: { fill: "hsl(var(--muted) / 0.4)" },
};
