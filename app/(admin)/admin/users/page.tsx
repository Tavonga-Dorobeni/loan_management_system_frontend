import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/admin/users/UsersTable";

export const metadata = {
  title: "Users — Loan Management",
};

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">
            Internal staff accounts. Admins can create, edit, and disable users.
          </p>
        </div>
        <Button asChild size="sm" className="lg:hidden">
          <Link href="/admin/users/new">New user</Link>
        </Button>
      </div>
      <UsersTable />
    </div>
  );
}
