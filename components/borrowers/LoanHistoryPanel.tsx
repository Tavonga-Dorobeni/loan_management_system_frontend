"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { LoanStatusBadge } from "@/components/status-badge";
import { listBorrowerLoans } from "@/lib/api/borrowers";
import type { Loan } from "@/lib/api/loans";
import { formatCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";

export function LoanHistoryPanel({ borrowerId }: { borrowerId: string | number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["borrower-loans", borrowerId],
    queryFn: () => listBorrowerLoans(borrowerId),
  });

  const columns = useMemo<ColumnDef<Loan>[]>(
    () => [
      {
        accessorKey: "referenceNumber",
        header: "Reference",
        cell: ({ row }) => (
          <Link
            href={`/loans/${row.original.id}`}
            className="font-mono font-medium hover:underline"
          >
            {row.original.referenceNumber}
          </Link>
        ),
        meta: { className: "font-mono numeric" },
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <LoanStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "startDate",
        header: "Start",
        cell: ({ row }) => formatDate(row.original.startDate),
      },
      {
        accessorKey: "endDate",
        header: "End",
        cell: ({ row }) => formatDate(row.original.endDate),
      },
      {
        accessorKey: "totalAmount",
        header: "Total",
        cell: ({ row }) => formatCurrency(row.original.totalAmount),
        meta: { numeric: true },
      },
      {
        accessorKey: "amountDue",
        header: "Outstanding",
        cell: ({ row }) => formatCurrency(row.original.amountDue),
        meta: { numeric: true },
      },
    ],
    [],
  );

  return (
    <DataTable
      data={data?.items ?? []}
      columns={columns}
      isLoading={isLoading}
      pagination={data?.pagination}
      emptyLabel="No loans for this borrower yet."
    />
  );
}
