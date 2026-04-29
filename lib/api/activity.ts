import { apiList } from "../api-client";
import type { Role } from "../rbac";

export type ActivityLog = {
  id: number | string;
  actorUserId: number | string | null;
  actorRole: Role | null;
  entityType: string;
  entityId: number | string | null;
  action: string;
  summary: string;
  metadata: Record<string, unknown> | null;
  sourceType: "api" | "import" | "system";
  sourceReference: string | null;
  createdAt: string;
};

export type NotificationDelivery = {
  id: number | string;
  eventType: string;
  recipient: string;
  subject: string;
  status: "sent" | "queued" | "failed" | "skipped";
  providerMessageId: string | null;
  errorMessage: string | null;
  createdAt: string;
};

export function listActivityLogs(query: Record<string, string | number | undefined> = {}) {
  return apiList<ActivityLog>("/activity-logs", query);
}
export function listNotificationDeliveries(query: Record<string, string | number | undefined> = {}) {
  return apiList<NotificationDelivery>("/notifications/deliveries", query);
}
