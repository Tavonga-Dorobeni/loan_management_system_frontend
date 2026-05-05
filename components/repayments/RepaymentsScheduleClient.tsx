"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { MonthRepaymentsList } from "@/components/repayments/MonthRepaymentsList";
import { MonthScheduleSummary } from "@/components/repayments/MonthScheduleSummary";
import { RepaymentScheduleTabs } from "@/components/repayments/RepaymentScheduleTabs";
import { YearSelector } from "@/components/repayments/YearSelector";
import { getRepaymentSchedule } from "@/lib/api/repayments";

const NOW = new Date();

function clampMonth(value: unknown): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1 || n > 12) return NOW.getMonth() + 1;
  return n;
}

function clampYear(value: unknown): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 2000 || n > 2100) return NOW.getFullYear();
  return n;
}

export function RepaymentsScheduleClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const yearParam = searchParams.get("year");
  const monthParam = searchParams.get("month");

  const year = clampYear(yearParam ?? NOW.getFullYear());
  const [activeMonth, setActiveMonth] = useState<number>(
    clampMonth(monthParam ?? NOW.getMonth() + 1),
  );

  const scheduleQ = useQuery({
    queryKey: ["repayment-schedule", year],
    queryFn: () => getRepaymentSchedule(year),
  });

  useEffect(() => {
    if (monthParam) return;
    const nextPending = scheduleQ.data?.nextPendingMonth;
    if (nextPending && nextPending !== activeMonth) {
      setActiveMonth(nextPending);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleQ.data, monthParam]);

  function updateUrl(nextYear: number, nextMonth: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(nextYear));
    params.set("month", String(nextMonth));
    router.replace(`/repayments?${params.toString()}`, { scroll: false });
  }

  function handleYearChange(nextYear: number) {
    updateUrl(nextYear, activeMonth);
  }

  function handleMonthChange(nextMonth: number) {
    setActiveMonth(nextMonth);
    updateUrl(year, nextMonth);
  }

  const months = scheduleQ.data?.months ?? [];
  const availableYears = useMemo(() => {
    const fromApi = scheduleQ.data?.availableYears ?? [];
    return fromApi.length ? fromApi : [year];
  }, [scheduleQ.data, year]);

  const nextPendingMonth = scheduleQ.data?.nextPendingMonth ?? null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Repayments</h1>
        <p className="text-sm text-muted-foreground">
          Monthly schedule. Each tab shows the portfolio total expected, what was received, and what is still due.
        </p>
      </div>

      {scheduleQ.isError ? (
        <p className="rounded-md border border-danger/30 bg-danger/5 p-4 text-sm text-danger">
          Could not load the schedule. Please refresh.
        </p>
      ) : (
        <RepaymentScheduleTabs
          months={months}
          activeMonth={activeMonth}
          onActiveChange={handleMonthChange}
          toolbar={
            <YearSelector
              value={year}
              years={availableYears}
              onChange={handleYearChange}
            />
          }
          renderContent={(m) => (
            <div className="space-y-4">
              <MonthScheduleSummary
                month={m}
                year={year}
                isNextPending={m.month === nextPendingMonth}
                uploadHref={`/imports/repayments?year=${year}&month=${m.month}`}
              />
              {m.status !== "INACTIVE" && (
                <MonthRepaymentsList periodYear={year} periodMonth={m.month} />
              )}
            </div>
          )}
        />
      )}
    </div>
  );
}
