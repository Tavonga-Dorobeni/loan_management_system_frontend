"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./MetricCard";
import { SectionLabel } from "./SectionLabel";
import { MaturityByMonthChart } from "./MaturityByMonthChart";
import { MonthlyCollectionsChart } from "./MonthlyCollectionsChart";
import { TopInstallmentsTable } from "./TopInstallmentsTable";
import { getDashboardSummary } from "@/lib/api/reports";
import { formatCurrency } from "@/lib/format/currency";
import { formatPercent } from "@/lib/format/percent";

const PLACEHOLDER = "—";

function num(value: number | null | undefined, isLoading: boolean): string {
  if (isLoading) return PLACEHOLDER;
  if (value === null || value === undefined) return PLACEHOLDER;
  return new Intl.NumberFormat("en-US").format(value);
}

function money(value: number | null | undefined, isLoading: boolean): string {
  if (isLoading) return PLACEHOLDER;
  return formatCurrency(value);
}

function pct(value: number | null | undefined, isLoading: boolean): string {
  if (isLoading) return PLACEHOLDER;
  return formatPercent(value);
}

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

  const currentYear = new Date().getFullYear();

  // KPI block (8 cards)
  const kpiCards = [
    { label: "Active Loans", value: num(data?.totalActiveLoans, isLoading), tone: "success" as const, sublabel: "Status: ACTIVE" },
    { label: "Monthly Collections", value: money(data?.monthlyCollectionsExpected, isLoading), tone: "muted" as const, sublabel: "Expected this month" },
    { label: "Future Collections", value: money(data?.totalOutstandingAmountDue, isLoading), tone: "warning" as const, sublabel: "Remaining across active loans" },
    { label: "Avg Monthly Installment", value: money(data?.averageMonthlyInstallment, isLoading), tone: "muted" as const },
    { label: "Total Loans on Book", value: num(data?.totalLoansOnBook, isLoading), tone: "muted" as const },
    { label: `New in ${currentYear}`, value: num(data?.newThisYear, isLoading), tone: "success" as const },
    { label: "Matured / Closed", value: num(data?.maturedClosedCount, isLoading), tone: "muted" as const, sublabel: "Status: MATURED" },
    { label: "Active Rate", value: pct(data?.activeRate, isLoading), tone: "success" as const },
  ];

  // Loan Book Size block (4 cards)
  const loanBookCards = [
    { label: "Total Loan Book Size", value: money(data?.totalLoanBookSize, isLoading), tone: "muted" as const, sublabel: "Principal across active loans" },
    { label: "Avg Loan Size", value: money(data?.averageLoanSize, isLoading), tone: "muted" as const, sublabel: "Average principal" },
    { label: "Maturing This Month", value: money(data?.principalMaturingThisMonth, isLoading), tone: "warning" as const, sublabel: "Principal" },
    { label: "Maturing Next 3 Months", value: money(data?.principalMaturingNext3Months, isLoading), tone: "warning" as const, sublabel: "Principal" },
  ];

  // Portfolio Quality block (4 cards)
  const qualityCards = [
    { label: "PAR 30", value: pct(data?.par30Rate, isLoading), tone: "warning" as const, sublabel: "Active loans 30–89 days late" },
    { label: "PAR 90", value: pct(data?.par90Rate, isLoading), tone: "danger" as const, sublabel: "Active loans 90+ days late" },
    { label: "Collection Rate", value: pct(data?.repaymentCollectionRate, isLoading), tone: "success" as const, sublabel: "Collected vs expected" },
    { label: "Missing Data", value: num(data?.missingDataCount, isLoading), tone: "danger" as const, sublabel: "Active loans missing installment" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Section A — KPIs / Loan Book Size / Portfolio Quality */}
        <section className="space-y-6 lg:col-span-7">
          <section aria-labelledby="kpi-label">
            <SectionLabel id="kpi-label">Key Performance Indicators</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {kpiCards.map((c) => (
                <MetricCard key={c.label} {...c} />
              ))}
            </div>
          </section>

          <section aria-labelledby="loan-book-label">
            <SectionLabel id="loan-book-label">Loan Book Size</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {loanBookCards.map((c) => (
                <MetricCard key={c.label} {...c} />
              ))}
            </div>
          </section>

          <section aria-labelledby="quality-label">
            <SectionLabel id="quality-label">Portfolio Quality</SectionLabel>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {qualityCards.map((c) => (
                <MetricCard key={c.label} {...c} />
              ))}
            </div>
          </section>
        </section>

        {/* Section B — two stacked charts.
            At lg+ Section A and B share a grid row, so CSS stretches both to
            equal height. Inside Section B we use flex-col with gap-4 between
            cards. Chart 1 gets `lg:mt-6` (= 1.5rem = the height of Section A's
            KPI section label + its mb-2) so the top of chart 1 lines up with
            the top of the KPI cards. With `lg:flex-1` on both cards they split
            the remaining height equally and chart 2's bottom lines up with the
            bottom of the Portfolio Quality cards. At <lg the mt and flex-1
            drop off so the charts stack naturally below Section A. */}
        <section className="flex flex-col gap-4 lg:col-span-5">
          <Card className="flex flex-col lg:mt-6 lg:flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Loans maturing per month
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 pb-4">
              <MaturityByMonthChart data={data?.maturityByMonth ?? []} />
            </CardContent>
          </Card>
          <Card className="flex flex-col lg:flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Monthly collections
              </CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 pb-4">
              <MonthlyCollectionsChart data={data?.actualCollectionsByMonth ?? []} />
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Section C — Top 10 largest active monthly installments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Top 10 largest active monthly installments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TopInstallmentsTable
            rows={data?.topActiveInstallments ?? []}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
