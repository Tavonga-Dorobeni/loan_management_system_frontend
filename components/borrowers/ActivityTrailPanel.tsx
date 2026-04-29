"use client";

import { useQuery } from "@tanstack/react-query";
import { listActivityLogs, type ActivityLog } from "@/lib/api/activity";
import { formatDateTime } from "@/lib/format/date";

export function ActivityTrailPanel({
  borrowerId,
  fallbackMessage = "No activity yet.",
}: {
  borrowerId: string | number;
  fallbackMessage?: string;
}) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["activity-logs", "borrower", borrowerId],
    queryFn: () =>
      listActivityLogs({ entityType: "borrower", entityId: String(borrowerId) }),
  });

  if (isError) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Activity trail isn&apos;t available right now.
      </p>
    );
  }

  if (isLoading) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Loading…
      </p>
    );
  }

  const items = data?.items ?? [];
  if (items.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        {fallbackMessage}
      </p>
    );
  }

  return (
    <ol className="space-y-3 border-l pl-4">
      {items.map((entry: ActivityLog) => (
        <li key={String(entry.id)} className="relative">
          <span className="absolute -left-[19px] top-1 inline-block h-2.5 w-2.5 rounded-full bg-brand" />
          <div className="text-sm text-foreground">{entry.summary}</div>
          <div className="text-xs text-muted-foreground">
            {formatDateTime(entry.createdAt)}
            {entry.actorRole ? ` · ${entry.actorRole}` : ""}
            {entry.sourceType !== "api" ? ` · ${entry.sourceType}` : ""}
          </div>
        </li>
      ))}
    </ol>
  );
}
