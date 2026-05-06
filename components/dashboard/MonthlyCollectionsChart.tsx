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
import { formatCurrency } from "@/lib/format/currency";
import { formatMonthBucket } from "@/lib/format/months";

const compactCurrency = new Intl.NumberFormat("en-US", {
  notation: "compact",
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 1,
});

export function MonthlyCollectionsChart({
  data,
  emptyLabel = "No collections yet.",
}: {
  data: { month: string; amount: number }[];
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
            tickFormatter={(value: number) => compactCurrency.format(value)}
            width={48}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.5rem",
              fontSize: "0.75rem",
            }}
            labelFormatter={(label: string) => formatMonthBucket(label)}
            formatter={(value: number) => [formatCurrency(value), "Collected"]}
          />
          <Bar dataKey="amount" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
