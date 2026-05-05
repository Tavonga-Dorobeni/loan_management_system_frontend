"use client";

import { ReactNode } from "react";
import { Check, AlertCircle, Circle, Minus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ScheduleMonth, ScheduleMonthStatus } from "@/lib/api/repayments";

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

type Props = {
  months: ScheduleMonth[];
  activeMonth: number; // 1..12
  onActiveChange: (month: number) => void;
  renderContent: (month: ScheduleMonth) => ReactNode;
  toolbar?: ReactNode;
};

export function RepaymentScheduleTabs({
  months,
  activeMonth,
  onActiveChange,
  renderContent,
  toolbar,
}: Props) {
  const byMonth = new Map(months.map((m) => [m.month, m]));
  const slots = Array.from({ length: 12 }, (_, i) => {
    const m = i + 1;
    return (
      byMonth.get(m) ?? {
        month: m,
        label: SHORT_MONTHS[i],
        expected: 0,
        received: 0,
        outstanding: 0,
        activeLoanCount: 0,
        repaymentCount: 0,
        status: "INACTIVE" as ScheduleMonthStatus,
      }
    );
  });

  return (
    <Tabs
      value={String(activeMonth)}
      onValueChange={(v) => onActiveChange(Number(v))}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList className="h-auto flex-wrap gap-1">
          {slots.map((m) => (
            <TabsTrigger
              key={m.month}
              value={String(m.month)}
              disabled={m.status === "INACTIVE"}
              className={cn(
                "gap-1.5",
                m.status === "INACTIVE" && "opacity-40",
              )}
            >
              <StatusGlyph status={m.status} />
              <span>{SHORT_MONTHS[m.month - 1]}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {toolbar && <div className="ml-auto">{toolbar}</div>}
      </div>

      {slots.map((m) => (
        <TabsContent key={m.month} value={String(m.month)}>
          {renderContent(m)}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function StatusGlyph({ status }: { status: ScheduleMonthStatus }) {
  switch (status) {
    case "FULL":
      return <Check className="h-3.5 w-3.5 text-success" aria-label="Fully paid" />;
    case "PARTIAL":
      return <AlertCircle className="h-3.5 w-3.5 text-warning" aria-label="Partially paid" />;
    case "UNPAID":
    case "UPCOMING":
      return <Circle className="h-3.5 w-3.5 text-muted-foreground" aria-label="Unpaid" />;
    case "INACTIVE":
      return <Minus className="h-3.5 w-3.5" aria-label="Inactive" />;
    default:
      return null;
  }
}
