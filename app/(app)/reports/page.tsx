import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { REPORT_CATALOG } from "@/components/reports/catalog";
import { REPORT_SLUGS } from "@/lib/api/reports";

export const metadata = {
  title: "Reports — Loan Management",
};

export default function ReportsIndexPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Canonical reports. Each can be viewed in-app or exported to CSV / Excel.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {REPORT_SLUGS.map((slug) => {
          const meta = REPORT_CATALOG[slug];
          return (
            <Link key={slug} href={`/reports/${slug}`} className="block">
              <Card className="h-full transition-colors hover:border-foreground/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{meta.title}</CardTitle>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
                  </div>
                  <CardDescription>{meta.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
