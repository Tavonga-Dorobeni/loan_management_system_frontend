"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/Toolbar";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { useAuth } from "@/hooks/useAuth";
import { listBorrowers, type Borrower } from "@/lib/api/borrowers";

export function BorrowersTable() {
  const { can } = useAuth();
  const canCreate = can("borrowers.write");

  const q = usePaginatedQuery<Borrower>({
    queryKey: ["borrowers"],
    fetcher: (query) => listBorrowers(query),
  });

  const columns = useMemo<ColumnDef<Borrower>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link
            href={`/borrowers/${row.original.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {row.original.firstName} {row.original.lastName}
          </Link>
        ),
      },
      {
        accessorKey: "ecNumber",
        header: "EC #",
        cell: ({ row }) => row.original.ecNumber,
        meta: { className: "font-mono numeric" },
      },
      {
        accessorKey: "idNumber",
        header: "ID #",
        cell: ({ row }) => row.original.idNumber,
        meta: { className: "font-mono numeric" },
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.phoneNumber ?? "—"}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email ?? "—"}</span>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-3 text-xs">
            <Link
              href={`/borrowers/${row.original.id}`}
              className="text-foreground hover:underline"
            >
              View
            </Link>
          </div>
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
      emptyLabel="No borrowers match these filters."
      toolbar={
        <DataTableToolbar
          search={q.state.search}
          onSearchChange={(search) => q.setQuery({ search, page: 1 })}
          placeholder="Search by name, EC #, ID #, or phone…"
        >
          {canCreate && (
            <Button asChild size="sm">
              <Link href="/borrowers/new">
                <Plus className="h-4 w-4" aria-hidden /> New borrower
              </Link>
            </Button>
          )}
        </DataTableToolbar>
      }
    />
  );
}
