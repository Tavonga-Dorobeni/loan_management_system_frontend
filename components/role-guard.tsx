"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Action, Role } from "@/lib/rbac";

type Props =
  | { roles: Role[]; action?: never; children: ReactNode; fallback?: ReactNode }
  | { action: Action; roles?: never; children: ReactNode; fallback?: ReactNode };

export function RoleGuard(props: Props) {
  const { role, can } = useAuth();
  const allowed =
    "roles" in props && props.roles ? !!role && props.roles.includes(role) : can(props.action!);
  if (!allowed) return <>{props.fallback ?? null}</>;
  return <>{props.children}</>;
}
