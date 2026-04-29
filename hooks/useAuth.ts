"use client";

import { createContext, createElement, useCallback, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { Role } from "@/lib/rbac";
import { can, type Action } from "@/lib/rbac";
import type { SessionUser } from "@/lib/auth/session";

export type { SessionUser };

type AuthContextValue = {
  user: SessionUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  can: (action: Action) => boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  const router = useRouter();

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }, [router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      role: user?.role ?? null,
      isAuthenticated: !!user,
      can: (action) => can(user?.role, action),
      logout,
    }),
    [user, logout],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within <SessionProvider>");
  }
  return ctx;
}
