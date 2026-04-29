"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { DataTable } from "@/components/data-table/DataTable";
import { DataTableToolbar } from "@/components/data-table/Toolbar";
import { usePaginatedQuery } from "@/hooks/usePaginatedQuery";
import { listUsers, type User } from "@/lib/api/users";
import { ROLES } from "@/lib/rbac";

const ROLE_LABELS: Record<(typeof ROLES)[number], string> = {
  admin: "Admin",
  loan_officer: "Loan Officer",
  credit_analyst: "Credit Analyst",
  collections_officer: "Collections Officer",
  customer_support: "Customer Support",
};

function statusVariant(status: string): "success" | "danger" | "secondary" {
  if (status === "active") return "success";
  if (status === "disabled") return "danger";
  return "secondary";
}

export function UsersTable() {
  const q = usePaginatedQuery<User>({
    queryKey: ["users"],
    fetcher: (query) => listUsers(query),
  });

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: "name",
        header: "Name",
        cell: ({ row }) => (
          <Link
            href={`/admin/users/${row.original.id}`}
            className="font-medium text-foreground hover:underline"
          >
            {row.original.firstName} {row.original.lastName}
          </Link>
        ),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => (
          <Badge variant="outline" className="font-normal">
            {ROLE_LABELS[row.original.role] ?? row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>{row.original.status}</Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end gap-3 text-xs">
            <Link
              href={`/admin/users/${row.original.id}`}
              className="text-foreground hover:underline"
            >
              View
            </Link>
            <Link
              href={`/admin/users/${row.original.id}`}
              className="text-foreground hover:underline"
            >
              Edit
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
      emptyLabel="No users match these filters."
      toolbar={
        <DataTableToolbar
          search={q.state.search}
          onSearchChange={(search) => q.setQuery({ search, page: 1 })}
          placeholder="Search by name or email…"
        >
          <Select
            aria-label="Role filter"
            value={q.state.filters.role ?? ""}
            onChange={(e) =>
              q.setQuery({ filters: { role: e.target.value }, page: 1 })
            }
            className="h-9 w-auto"
          >
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Status filter"
            value={q.state.filters.status ?? ""}
            onChange={(e) =>
              q.setQuery({ filters: { status: e.target.value }, page: 1 })
            }
            className="h-9 w-auto"
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </Select>
          <Button asChild size="sm">
            <Link href="/admin/users/new">
              <Plus className="h-4 w-4" aria-hidden /> New user
            </Link>
          </Button>
        </DataTableToolbar>
      }
    />
  );
}
