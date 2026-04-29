"use client";

import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

const STATUSES = ["PENDING", "SUCCESS", "FAILED"] as const;

export function LoanFilters({
  status,
  type,
  startDate,
  endDate,
  onChange,
}: {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  onChange: (next: { status?: string; type?: string; startDate?: string; endDate?: string }) => void;
}) {
  return (
    <>
      <Select
        aria-label="Status filter"
        value={status ?? ""}
        onChange={(e) => onChange({ status: e.target.value })}
        className="h-9 w-auto"
      >
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Input
        aria-label="Type filter"
        placeholder="Type"
        value={type ?? ""}
        onChange={(e) => onChange({ type: e.target.value })}
        className="h-9 w-32"
      />
      <Input
        aria-label="Start date"
        type="date"
        value={startDate ?? ""}
        onChange={(e) => onChange({ startDate: e.target.value })}
        className="h-9 w-auto"
      />
      <Input
        aria-label="End date"
        type="date"
        value={endDate ?? ""}
        onChange={(e) => onChange({ endDate: e.target.value })}
        className="h-9 w-auto"
      />
    </>
  );
}
