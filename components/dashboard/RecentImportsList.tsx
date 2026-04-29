import { CheckCircle2, FileSpreadsheet, XCircle } from "lucide-react";
import type { DashboardSummary } from "@/lib/api/reports";
import { formatDateTime } from "@/lib/format/date";

const TYPE_LABELS: Record<string, string> = {
  intake: "Loan intake",
  approvals: "Loan approvals",
  repayments: "Repayments",
};

export function RecentImportsList({
  imports,
}: {
  imports: DashboardSummary["recentImports"];
}) {
  if (!imports || imports.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        No recent imports.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {imports.map((entry, i) => {
        const failed = entry.failure > 0;
        return (
          <li
            key={`${entry.type}-${entry.at}-${i}`}
            className="flex items-center justify-between gap-3 rounded-md border bg-card p-3"
          >
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" aria-hidden />
              <div>
                <div className="text-sm font-medium">
                  {TYPE_LABELS[entry.type] ?? entry.type}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDateTime(entry.at)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 text-success">
                <CheckCircle2 className="h-3 w-3" aria-hidden /> {entry.success}
              </span>
              <span
                className={`inline-flex items-center gap-1 ${
                  failed ? "text-danger" : "text-muted-foreground"
                }`}
              >
                <XCircle className="h-3 w-3" aria-hidden /> {entry.failure}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
