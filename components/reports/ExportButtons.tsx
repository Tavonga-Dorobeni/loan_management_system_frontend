"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import type { ReportSlug } from "@/lib/api/reports";

function buildHref(slug: ReportSlug, format: "csv" | "xlsx", query: Record<string, string>) {
  const params = new URLSearchParams({ ...query, format });
  return `/api/backend/reports/${slug}?${params.toString()}`;
}

export function ExportButtons({
  slug,
  query = {},
}: {
  slug: ReportSlug;
  query?: Record<string, string>;
}) {
  const { can } = useAuth();
  if (!can("reports.export")) return null;

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <a
          href={buildHref(slug, "csv", query)}
          download
          rel="noopener noreferrer"
        >
          <Download className="h-4 w-4" aria-hidden /> CSV
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a
          href={buildHref(slug, "xlsx", query)}
          download
          rel="noopener noreferrer"
        >
          <Download className="h-4 w-4" aria-hidden /> Excel
        </a>
      </Button>
    </div>
  );
}
