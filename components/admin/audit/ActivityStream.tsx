"use client";

import { DataTablePagination } from "@/components/data-table/Pagination";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { listActivityLogs, type ActivityLog } from "@/lib/api/activity";
import { formatDateTime } from "@/lib/format/date";
import { ActivityFilters } from "./ActivityFilters";
import { JsonDiffModal } from "./JsonDiffModal";

export function ActivityStream() {
  const { can } = useAuth();
  const canRead = can("activityLog.read");

  const q = usePaginatedQuery<ActivityLog>({
    queryKey: ["activity-logs", "stream"],
    fetcher: (query) => listActivityLogs(query as never),
  });

  if (!canRead) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Activity log access is admin-only.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ActivityFilters
        actorRole={q.state.filters.actorRole}
        entityType={q.state.filters.entityType}
        sourceType={q.state.filters.sourceType}
        from={q.state.filters.from}
        to={q.state.filters.to}
        onChange={(patch) => q.setQuery({ filters: patch, page: 1 })}
      />

      {q.isLoading && q.items.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      ) : q.items.length === 0 ? (
        <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No activity matches these filters.
        </p>
      ) : (
        <ol className="space-y-3 border-l pl-4">
          {q.items.map((entry) => (
            <li key={String(entry.id)} className="relative">
              <span className="absolute -left-[19px] top-1 inline-block h-2.5 w-2.5 rounded-full bg-brand" />
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-sm text-foreground">{entry.summary}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatDateTime(entry.createdAt)}</span>
                    {entry.actorRole && (
                      <Badge variant="outline" className="font-normal">
                        {entry.actorRole}
                      </Badge>
                    )}
                    <Badge variant="outline" className="font-normal">
                      {entry.entityType}
                    </Badge>
                    {entry.sourceType !== "api" && (
                      <Badge variant="secondary" className="font-normal">
                        {entry.sourceType}
                        {entry.sourceReference ? ` · ${entry.sourceReference}` : ""}
                      </Badge>
                    )}
                  </div>
                </div>
                {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                  <JsonDiffModal metadata={entry.metadata} />
                )}
              </div>
            </li>
          ))}
        </ol>
      )}

      {q.pagination && (
        <DataTablePagination
          pagination={q.pagination}
          onPageChange={(page) => q.setQuery({ page })}
          onPageSizeChange={(pageSize) => q.setQuery({ pageSize, page: 1 })}
        />
      )}
    </div>
  );
}
