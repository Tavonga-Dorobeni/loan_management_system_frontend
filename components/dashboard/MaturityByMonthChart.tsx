"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatMonthBucket } from "@/lib/format/months";

export function MaturityByMonthChart({
  data,
  emptyLabel = "No upcoming maturities.",
}: {
  data: { month: string; count: number }[];
  emptyLabel?: string;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full min-h-[8rem] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  return (
    <div className="h-full min-h-[8rem] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="month"
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            tickFormatter={formatMonthBucket}
          />
          <YAxis
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            allowDecimals={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
            labelFormatter={(label: string) => formatMonthBucket(label)}
            formatter={(value: number) => [String(value), "Loans"]}
          />
          <Bar dataKey="count" fill="hsl(var(--brand))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
