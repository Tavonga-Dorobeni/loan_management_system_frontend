"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Row = Record<string, unknown>;

function isNumeric(v: unknown): boolean {
  return typeof v === "number" && Number.isFinite(v);
}

function format(v: unknown): string {
  if (v === null || v === undefined) return "—";
  if (typeof v === "number") return Number.isInteger(v) ? String(v) : v.toFixed(2);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (typeof v === "string") return v;
  return JSON.stringify(v);
}

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}

export function ReportTable({
  rows,
  isLoading,
}: {
  rows: Row[] | undefined;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Loading…
      </p>
    );
  }
  if (!rows || rows.length === 0) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        No data for this report yet.
      </p>
    );
  }

  const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {keys.map((k) => (
              <TableHead key={k} className={isNumeric(rows[0][k]) ? "numeric text-right" : undefined}>
                {humanizeKey(k)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              {keys.map((k) => (
                <TableCell
                  key={k}
                  className={isNumeric(row[k]) ? "numeric text-right font-mono" : undefined}
                >
                  {format(row[k])}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
