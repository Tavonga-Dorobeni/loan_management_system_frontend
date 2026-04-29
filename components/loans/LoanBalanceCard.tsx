"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanStatusBadge } from "@/components/status-badge";
import type { LoanDetails } from "@/lib/api/loans";
import { formatCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";

export function LoanBalanceCard({ details }: { details: LoanDetails }) {
  const { loan, balance } = details;
  const total = balance.amountPaid + balance.amountDue;
  const ratio = total > 0 ? Math.min(1, balance.amountPaid / total) : 0;
  const pct = Math.round(ratio * 100);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Balance</CardTitle>
            <p className="text-xs text-muted-foreground">
              Repayment {formatCurrency(balance.repaymentAmount)} ·{" "}
              {formatDate(loan.startDate)} → {formatDate(loan.endDate)}
            </p>
          </div>
          <LoanStatusBadge status={loan.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Stat label="Paid" value={formatCurrency(balance.amountPaid)} tone="success" />
          <Stat label="Outstanding" value={formatCurrency(balance.amountDue)} tone="danger" />
        </div>
        <div>
          <div className="mb-1 flex items-baseline justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span className="font-mono tabular-nums">{pct}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-success transition-[width]"
              style={{ width: `${pct}%` }}
              role="progressbar"
              aria-valuenow={pct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Repayment progress"
            />
          </div>
        </div>
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
  value: string;
  tone: "success" | "danger";
}) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div
        className={`numeric text-xl font-semibold ${
          tone === "success" ? "text-success" : "text-danger"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
