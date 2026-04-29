"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { can, type Role } from "@/lib/rbac";

const NAV: { href: string; label: string; action: "imports.intake" | "imports.approvals" | "imports.repayments" }[] = [
  { href: "/imports/intake", label: "Loan intake", action: "imports.intake" },
  { href: "/imports/approvals", label: "Loan approvals", action: "imports.approvals" },
  { href: "/imports/repayments", label: "Repayments", action: "imports.repayments" },
];

export function ImportsSidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const visible = NAV.filter((n) => can(role, n.action));

  if (visible.length === 0) return null;

  return (
    <nav className="rounded-md border bg-card p-2 text-sm">
      <ul className="space-y-1">
        {visible.map((n) => {
          const active = pathname === n.href || pathname.startsWith(n.href + "/");
          return (
            <li key={n.href}>
              <Link
                href={n.href}
                className={cn(
                  "block rounded-md px-3 py-2 transition-colors",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                {n.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
