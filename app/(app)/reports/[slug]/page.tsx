import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { ReportClient } from "@/components/reports/ReportClient";
import { REPORT_CATALOG } from "@/components/reports/catalog";
import { REPORT_SLUGS, type ReportSlug } from "@/lib/api/reports";

export function generateStaticParams() {
  return REPORT_SLUGS.map((slug) => ({ slug }));
}

export default function ReportDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = params.slug as ReportSlug;
  if (!(REPORT_SLUGS as readonly string[]).includes(slug)) notFound();
  const meta = REPORT_CATALOG[slug];

  return (
    <div className="space-y-4">
      <Link
        href="/reports"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden /> Back to reports
      </Link>

      <ReportClient slug={slug} title={meta.title} description={meta.description} />
    </div>
  );
}
