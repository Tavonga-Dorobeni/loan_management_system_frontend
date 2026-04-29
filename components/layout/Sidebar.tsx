"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileSpreadsheet,
  Wallet,
  Receipt,
  BarChart3,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import type { Action } from "@/lib/rbac";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: Action;
  anyAction?: Action[];
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/borrowers", label: "Borrowers", icon: Users },
  { href: "/loans", label: "Loans", icon: Wallet },
  { href: "/repayments", label: "Repayments", icon: Receipt },
  {
    href: "/imports/intake",
    label: "Imports",
    icon: FileSpreadsheet,
    anyAction: ["imports.intake", "imports.approvals", "imports.repayments"],
  },
  { href: "/reports", label: "Reports", icon: BarChart3, action: "reports.read" },
  { href: "/admin/users", label: "Users", icon: UserCog, adminOnly: true },
  { href: "/admin/audit", label: "Activity Log", icon: ShieldAlert, adminOnly: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, can } = useAuth();

  const visible = NAV.filter((item) => {
    if (item.adminOnly) return role === "admin";
    if (item.action) return can(item.action);
    if (item.anyAction) return item.anyAction.some((a) => can(a));
    return true;
  });

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-brand text-brand-foreground lg:block">
      <div className="flex h-14 items-center border-b border-white/10 px-4 text-sm font-semibold">
        Loan Management
      </div>
      <nav className="p-2">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-white/10 text-white" : "text-white/80 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
