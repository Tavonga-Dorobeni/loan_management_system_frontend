"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ImportSummary } from "@/lib/api/imports";

export function FailedRowsTable({
  rows,
}: {
  rows: ImportSummary["failedRows"];
}) {
  if (!rows.length) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        No row errors. Every row was processed.
      </p>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20 numeric text-right">Row #</TableHead>
            <TableHead className="w-40">Reference</TableHead>
            <TableHead>Error</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r, i) => (
            <TableRow key={`${r.rowNumber}-${i}`}>
              <TableCell className="numeric text-right font-mono">{r.rowNumber}</TableCell>
              <TableCell className="font-mono">{r.reference ?? "—"}</TableCell>
              <TableCell className="text-danger">{r.error}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
