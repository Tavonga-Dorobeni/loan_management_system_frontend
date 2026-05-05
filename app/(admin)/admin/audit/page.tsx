import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityStream } from "@/components/admin/audit/ActivityStream";
import { NotificationDeliveryPanel } from "@/components/admin/audit/NotificationDeliveryPanel";

export const metadata = {
  title: "Audit log — Loan Management",
};

export default function AuditPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Audit log</h1>
        <p className="text-sm text-muted-foreground">
          Human-readable record of every action across the platform. Click Diff
          on any entry with metadata to see before / after values.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
        <Card>
          <CardHeader>
            <CardTitle>Activity stream</CardTitle>
            <CardDescription>
              Filtered by actor, entity, source, and date range.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivityStream />
          </CardContent>
        </Card>
        <NotificationDeliveryPanel />
      </div>
    </div>
  );
}
