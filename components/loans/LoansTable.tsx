"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/Toolbar";
import { LoanStatusBadge } from "@/components/status-badge";
import { useAuth } from "@/hooks/useAuth";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { listLoans, type Loan } from "@/lib/api/loans";
import { formatCurrency } from "@/lib/format/currency";
import { formatDate } from "@/lib/format/date";
import { LoanFilters } from "./LoanFilters";

export function LoansTable({ borrowerId }: { borrowerId?: string | number } = {}) {
  const { can } = useAuth();
  const canCreate = can("loans.write");

  const q = usePaginatedQuery<Loan>({
    queryKey: ["loans", borrowerId ?? "all"],
    fetcher: (query) =>
      listLoans({
        ...query,
        ...(borrowerId ? { borrowerId } : {}),
      } as never),
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
      { accessorKey: "type", header: "Type" },
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
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <Link
            href={`/loans/${row.original.id}`}
            className="text-xs text-foreground hover:underline"
          >
            View
          </Link>
        ),
        meta: { className: "text-right" },
      },
    ],
    [],
  );

  return (
    <DataTable
      data={q.items}
      columns={columns}
      isLoading={q.isLoading}
      pagination={q.pagination}
      onPageChange={(page) => q.setQuery({ page })}
      onPageSizeChange={(pageSize) => q.setQuery({ pageSize, page: 1 })}
      emptyLabel="No loans match these filters."
      toolbar={
        <DataTableToolbar
          search={q.state.search}
          onSearchChange={(search) => q.setQuery({ search, page: 1 })}
          placeholder="Search by reference number…"
        >
          <LoanFilters
            status={q.state.filters.status}
            type={q.state.filters.type}
            startDate={q.state.filters.startDate}
            endDate={q.state.filters.endDate}
            onChange={(patch) => q.setQuery({ filters: patch, page: 1 })}
          />
          {canCreate && !borrowerId && (
            <Button asChild size="sm">
              <Link href="/loans/new">
                <Plus className="h-4 w-4" aria-hidden /> New loan
              </Link>
            </Button>
          )}
        </DataTableToolbar>
      }
    />
  );
}
