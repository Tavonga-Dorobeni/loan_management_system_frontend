"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { GlobalSearch } from "./GlobalSearch";

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
      <GlobalSearch />
      <div className="flex-1" />
      {user && (
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/profile"
            className="text-right hover:opacity-80"
            aria-label="View profile"
          >
            <div className="font-medium leading-tight">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-xs text-muted-foreground">{user.role}</div>
          </Link>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      )}
    </header>
  );
}
