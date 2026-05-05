"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/DataTable";
import { RepaymentStatusBadge } from "@/components/status-badge";
import { listRepayments, type Repayment } from "@/lib/api/repayments";
import { formatCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";

type Props = {
  periodYear: number;
  periodMonth: number;
};

export function MonthRepaymentsList({ periodYear, periodMonth }: Props) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const query = useQuery({
    queryKey: ["repayments", { periodYear, periodMonth, page, pageSize }],
    queryFn: () =>
      listRepayments({ periodYear, periodMonth, page, pageSize }),
    placeholderData: keepPreviousData,
  });

  const columns = useMemo<ColumnDef<Repayment>[]>(
    () => [
      {
        accessorKey: "transactionDate",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.transactionDate),
      },
      {
        accessorKey: "loanReference",
        header: "Loan",
        cell: ({ row }) => (
          <Link
            href={`/loans/${row.original.loanId}`}
            className="font-mono hover:underline"
          >
            {row.original.loanReference ?? String(row.original.loanId)}
          </Link>
        ),
        meta: { className: "font-mono" },
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
      data={query.data?.items ?? []}
      columns={columns}
      isLoading={query.isLoading}
      pagination={query.data?.pagination}
      onPageChange={(p) => setPage(p)}
      onPageSizeChange={(s) => {
        setPageSize(s);
        setPage(1);
      }}
      emptyLabel="No repayments recorded for this month."
    />
  );
}
