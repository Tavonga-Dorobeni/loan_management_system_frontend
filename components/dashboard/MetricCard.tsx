import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type MetricTone = "success" | "warning" | "danger" | "muted";

const TONE_CLASS: Record<MetricTone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  muted: "text-foreground",
};

export function MetricCard({
  label,
  value,
  tone = "muted",
  sublabel,
}: {
  label: string;
  value: string;
  tone?: MetricTone;
  sublabel?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "numeric truncate text-2xl font-semibold leading-tight",
            TONE_CLASS[tone],
          )}
          title={value}
        >
          {value}
        </div>
        {sublabel && (
          <div className="mt-1 text-xs text-muted-foreground">{sublabel}</div>
        )}
      </CardContent>
    </Card>
  );
}
