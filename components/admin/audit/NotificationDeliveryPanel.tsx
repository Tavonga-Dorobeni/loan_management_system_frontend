"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listNotificationDeliveries } from "@/lib/api/activity";
import { formatDateTime } from "@/lib/format/date";

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "secondary"> = {
  sent: "success",
  queued: "warning",
  failed: "danger",
  skipped: "secondary",
};

export function NotificationDeliveryPanel() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["notification-deliveries"],
    queryFn: () => listNotificationDeliveries({ pageSize: 10 }),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent notifications</CardTitle>
        <CardDescription>
          Last 10 deliveries from the Resend-backed `NotificationService`.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isError ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Couldn&apos;t load notification deliveries.
          </p>
        ) : isLoading ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : !data?.items || data.items.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
            No notifications dispatched yet.
          </p>
        ) : (
          <ul className="space-y-2">
            {data.items.map((d) => (
              <li
                key={String(d.id)}
                className="flex items-start justify-between gap-3 rounded-md border bg-card p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant={STATUS_VARIANT[d.status] ?? "secondary"}>
                      {d.status}
                    </Badge>
                    <span className="font-medium">{d.eventType}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    To {d.recipient} · {formatDateTime(d.createdAt)}
                  </div>
                  {d.errorMessage && (
                    <div className="mt-1 text-xs text-danger">{d.errorMessage}</div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
