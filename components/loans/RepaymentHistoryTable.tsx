"use client";

import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import { RepaymentStatusBadge } from "@/components/status-badge";
import { listLoanRepayments } from "@/lib/api/loans";
import type { Repayment } from "@/lib/api/repayments";
import { formatCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";

export function RepaymentHistoryTable({ loanId }: { loanId: string | number }) {
  const { data, isLoading } = useQuery({
    queryKey: ["loan-repayments", loanId],
    queryFn: () => listLoanRepayments(loanId),
  });

  const columns = useMemo<ColumnDef<Repayment>[]>(
    () => [
      {
        accessorKey: "transactionDate",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.transactionDate),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(row.original.amount),
        meta: { numeric: true },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <RepaymentStatusBadge status={row.original.status} />,
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
      emptyLabel="No repayments yet."
    />
  );
}
