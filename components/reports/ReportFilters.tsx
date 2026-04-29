"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ReportFilters({
  from,
  to,
  onChange,
}: {
  from?: string;
  to?: string;
  onChange: (next: { from?: string; to?: string }) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="report-from">From</Label>
        <Input
          id="report-from"
          type="date"
          value={from ?? ""}
          onChange={(e) => onChange({ from: e.target.value })}
          className="h-9 w-auto"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="report-to">To</Label>
        <Input
          id="report-to"
          type="date"
          value={to ?? ""}
          onChange={(e) => onChange({ to: e.target.value })}
          className="h-9 w-auto"
        />
      </div>
    </div>
  );
}
