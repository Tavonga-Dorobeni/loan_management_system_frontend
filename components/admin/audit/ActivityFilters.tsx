"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ROLES } from "@/lib/rbac";

const ENTITY_TYPES = [
  "user",
  "borrower",
  "borrower_kyc",
  "loan",
  "repayment",
  "import",
] as const;

const SOURCE_TYPES = ["api", "import", "system"] as const;

export function ActivityFilters({
  actorRole,
  entityType,
  sourceType,
  from,
  to,
  onChange,
}: {
  actorRole?: string;
  entityType?: string;
  sourceType?: string;
  from?: string;
  to?: string;
  onChange: (next: {
    actorRole?: string;
    entityType?: string;
    sourceType?: string;
    from?: string;
    to?: string;
  }) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        aria-label="Actor role"
        value={actorRole ?? ""}
        onChange={(e) => onChange({ actorRole: e.target.value })}
        className="h-9 w-auto"
      >
        <option value="">All roles</option>
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Entity type"
        value={entityType ?? ""}
        onChange={(e) => onChange({ entityType: e.target.value })}
        className="h-9 w-auto"
      >
        <option value="">All entities</option>
        {ENTITY_TYPES.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Source"
        value={sourceType ?? ""}
        onChange={(e) => onChange({ sourceType: e.target.value })}
        className="h-9 w-auto"
      >
        <option value="">Any source</option>
        {SOURCE_TYPES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </Select>
      <Input
        aria-label="From date"
        type="date"
        value={from ?? ""}
        onChange={(e) => onChange({ from: e.target.value })}
        className="h-9 w-auto"
      />
      <Input
        aria-label="To date"
        type="date"
        value={to ?? ""}
        onChange={(e) => onChange({ to: e.target.value })}
        className="h-9 w-auto"
      />
    </div>
  );
}
