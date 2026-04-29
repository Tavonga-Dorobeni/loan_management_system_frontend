"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { TrendChart } from "./TrendChart";
import { RecentImportsList } from "./RecentImportsList";
import { getDashboardSummary } from "@/lib/api/reports";
import { formatCurrency } from "@/lib/format/currency";
import { formatPercent } from "@/lib/format/percent";

export function DashboardClient() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => getDashboardSummary(),
  });

  if (isError) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Couldn&apos;t load dashboard metrics.
      </p>
    );
  }

  const placeholder = "—";
  const totalActive = isLoading ? placeholder : String(data?.totalActiveLoans ?? 0);
  const outstanding = isLoading ? placeholder : formatCurrency(data?.totalOutstandingAmountDue);
  const paid = isLoading ? placeholder : formatCurrency(data?.totalAmountPaidInPeriod);
  const overdue = isLoading ? placeholder : String(data?.overdueLoanCount ?? 0);
  const collectionRate = isLoading
    ? placeholder
    : formatPercent(data?.repaymentCollectionRate ?? 0);
  const incompleteKyc = isLoading ? placeholder : String(data?.incompleteKycCount ?? 0);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard label="Active loans" value={totalActive} tone="success" />
        <MetricCard label="Outstanding due" value={outstanding} tone="danger" />
        <MetricCard label="Paid in period" value={paid} tone="success" />
        <MetricCard label="Overdue loans" value={overdue} tone="danger" />
        <MetricCard
          label="Collection rate"
          value={collectionRate}
          tone="warning"
          sublabel="Repayments collected vs. due"
        />
        <MetricCard
          label="Incomplete KYC"
          value={incompleteKyc}
          tone="warning"
          sublabel="Borrowers missing one or more KYC docs"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Approvals trend</CardTitle>
            <CardDescription>Approval throughput over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={data?.approvalTrend ?? []}
              color="hsl(var(--brand))"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Repayments trend</CardTitle>
            <CardDescription>Repayments recorded over time.</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={data?.repaymentTrend ?? []}
              color="hsl(var(--success))"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent imports</CardTitle>
          <CardDescription>The last few bulk-import runs and their failures.</CardDescription>
        </CardHeader>
        <CardContent>
          <RecentImportsList imports={data?.recentImports ?? []} />
        </CardContent>
      </Card>
    </div>
  );
}
