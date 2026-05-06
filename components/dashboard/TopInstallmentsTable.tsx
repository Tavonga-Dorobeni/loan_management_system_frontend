"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/DataTable";
import { formatCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { monthsBetween } from "@/lib/format/months";
import type { TopActiveInstallment } from "@/lib/api/reports";

const COLUMNS: ColumnDef<TopActiveInstallment>[] = [
  {
    id: "ecNumber",
    header: "EC Number",
    accessorFn: (row) => row.borrower.ecNumber,
    cell: ({ getValue }) => (
      <span className="font-mono text-sm">{String(getValue() ?? "")}</span>
    ),
  },
  {
    id: "name",
    header: "Name",
    accessorFn: (row) => `${row.borrower.firstName} ${row.borrower.lastName}`,
    cell: ({ row, getValue }) => (
      <Link
        href={`/borrowers/${row.original.borrower.id}`}
        className="text-foreground underline-offset-2 hover:underline"
      >
        {String(getValue() ?? "")}
      </Link>
    ),
  },
  {
    id: "reference",
    header: "Reference",
    accessorFn: (row) => row.referenceNumber,
    cell: ({ row, getValue }) => (
      <Link
        href={`/loans/${row.original.loanId}`}
        className="font-mono text-sm text-foreground underline-offset-2 hover:underline"
      >
        {String(getValue() ?? "")}
      </Link>
    ),
  },
  {
    id: "monthlyAmount",
    header: "Monthly Amount",
    accessorFn: (row) => row.repaymentAmount,
    cell: ({ getValue }) => formatCurrency(getValue() as number),
    meta: { numeric: true },
  },
  {
    id: "endDate",
    header: "End Date",
    accessorFn: (row) => row.endDate,
    cell: ({ getValue }) => formatDate(getValue() as string),
  },
  {
    id: "monthsLeft",
    header: "Months Left",
    accessorFn: (row) => monthsBetween(new Date(), row.endDate),
    cell: ({ getValue }) => String(getValue() ?? 0),
    meta: { numeric: true },
  },
];

export function TopInstallmentsTable({
  rows,
  isLoading,
}: {
  rows: TopActiveInstallment[];
  isLoading?: boolean;
}) {
  return (
    <DataTable<TopActiveInstallment>
      data={rows}
      columns={COLUMNS}
      isLoading={isLoading}
      emptyLabel="No active loans yet."
    />
  );
}
