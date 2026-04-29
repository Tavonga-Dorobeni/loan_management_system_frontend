"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getReport, type ReportSlug } from "@/lib/api/reports";
import { ReportFilters } from "./ReportFilters";
import { ExportButtons } from "./ExportButtons";
import { ReportTable } from "./ReportTable";

export function ReportClient({
  slug,
  title,
  description,
}: {
  slug: ReportSlug;
  title: string;
  description: string;
}) {
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const query = useMemo<Record<string, string>>(() => {
    const q: Record<string, string> = {};
    if (from) q.from = from;
    if (to) q.to = to;
    return q;
  }, [from, to]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["report", slug, query],
    queryFn: () => getReport(slug, query),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <ExportButtons slug={slug} query={query} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <ReportFilters
          from={from}
          to={to}
          onChange={(patch) => {
            if ("from" in patch) setFrom(patch.from ?? "");
            if ("to" in patch) setTo(patch.to ?? "");
          }}
        />
        {isError ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Couldn&apos;t load this report.
          </p>
        ) : (
          <ReportTable rows={data?.rows} isLoading={isLoading} />
        )}
      </CardContent>
    </Card>
  );
}
