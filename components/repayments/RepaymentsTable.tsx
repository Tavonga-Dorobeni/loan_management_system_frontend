"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/Toolbar";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { RepaymentStatusBadge } from "@/components/status-badge";
import { useAuth } from "@/hooks/useAuth";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { listRepayments, type Repayment } from "@/lib/api/repayments";
import { formatCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { DeleteRepaymentDialog } from "./DeleteRepaymentDialog";

const STATUSES = ["CORRECT", "OVER", "UNDER"] as const;

export function RepaymentsTable() {
  const { can } = useAuth();
  const canDelete = can("repayments.write");

  const q = usePaginatedQuery<Repayment>({
    queryKey: ["repayments"],
    fetcher: (query) => listRepayments(query as never),
  });

  const columns = useMemo<ColumnDef<Repayment>[]>(
    () => [
      {
        accessorKey: "transactionDate",
        header: "Date",
        cell: ({ row }) => formatDate(row.original.transactionDate),
      },
      {
        accessorKey: "loanId",
        header: "Loan",
        cell: ({ row }) => (
          <Link
            href={`/loans/${row.original.loanId}`}
            className="font-mono hover:underline"
          >
            {String(row.original.loanId)}
          </Link>
        ),
        meta: { className: "font-mono numeric" },
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
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          canDelete ? (
            <div className="flex justify-end">
              <DeleteRepaymentDialog
                repaymentId={row.original.id}
                loanId={row.original.loanId}
              />
            </div>
          ) : null,
        meta: { className: "text-right" },
      },
    ],
    [canDelete],
  );

  return (
    <DataTable
      data={q.items}
      columns={columns}
      isLoading={q.isLoading}
      pagination={q.pagination}
      onPageChange={(page) => q.setQuery({ page })}
      onPageSizeChange={(pageSize) => q.setQuery({ pageSize, page: 1 })}
      emptyLabel="No repayments match these filters."
      toolbar={
        <DataTableToolbar
          search={q.state.search}
          onSearchChange={(search) => q.setQuery({ search, page: 1 })}
          placeholder="Search by reference…"
        >
          <Select
            aria-label="Status filter"
            value={q.state.filters.status ?? ""}
            onChange={(e) => q.setQuery({ filters: { status: e.target.value }, page: 1 })}
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
            aria-label="Loan ID filter"
            placeholder="Loan ID"
            value={q.state.filters.loanId ?? ""}
            onChange={(e) => q.setQuery({ filters: { loanId: e.target.value }, page: 1 })}
            className="h-9 w-32"
          />
          <Input
            aria-label="From date"
            type="date"
            value={q.state.filters.from ?? ""}
            onChange={(e) => q.setQuery({ filters: { from: e.target.value }, page: 1 })}
            className="h-9 w-auto"
          />
          <Input
            aria-label="To date"
            type="date"
            value={q.state.filters.to ?? ""}
            onChange={(e) => q.setQuery({ filters: { to: e.target.value }, page: 1 })}
            className="h-9 w-auto"
          />
        </DataTableToolbar>
      }
    />
  );
}
