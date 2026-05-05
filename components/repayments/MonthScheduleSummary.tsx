"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/format/currency";
import type { ScheduleMonth } from "@/lib/api/repayments";

type Props = {
  month: ScheduleMonth;
  year: number;
  isNextPending?: boolean;
  uploadHref?: string;
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function MonthScheduleSummary({ month, year, isNextPending, uploadHref }: Props) {
  const monthName = month.label || MONTH_NAMES[month.month - 1] || `Month ${month.month}`;
  const isInactive = month.status === "INACTIVE";

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <div>
            <h2 className="text-lg font-semibold">
              {monthName} {year}
              {isNextPending && (
                <span className="ml-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  next pending
                </span>
              )}
            </h2>
            {isInactive ? (
              <p className="text-sm text-muted-foreground">
                No active loans in this month.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {month.activeLoanCount} active loan{month.activeLoanCount === 1 ? "" : "s"}
                {" · "}
                {month.repaymentCount} repayment{month.repaymentCount === 1 ? "" : "s"} recorded
              </p>
            )}
          </div>
          {uploadHref && !isInactive && (
            <Button asChild size="sm">
              <Link href={uploadHref}>Upload repayments</Link>
            </Button>
          )}
        </div>

        {!isInactive && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Expected" value={month.expected} tone="default" />
            <Stat label="Received" value={month.received} tone="default" />
            <Stat
              label={month.outstanding > 0 ? "Outstanding" : month.outstanding < 0 ? "Overpaid" : "Outstanding"}
              value={Math.abs(month.outstanding)}
              tone={month.outstanding > 0 ? "danger" : month.outstanding < 0 ? "warning" : "success"}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "default" | "danger" | "warning" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "text-danger"
      : tone === "warning"
      ? "text-warning"
      : tone === "success"
      ? "text-success"
      : "text-foreground";
  return (
    <div className="rounded-md border bg-muted/30 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${toneClass}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
