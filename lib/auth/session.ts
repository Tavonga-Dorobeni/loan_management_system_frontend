import { cookies } from "next/headers";
import type { Role } from "../rbac";
import { isRole } from "../rbac";
import { SESSION_COOKIE, SESSION_USER_COOKIE } from "./cookies";

export type SessionUser = {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status?: string;
};

export type SessionPayload = {
  sub: string;
  role: Role;
  email?: string;
  exp?: number;
};

function decodeJwt(token: string): SessionPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export function getSession(): SessionPayload | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;
  if (payload.exp && payload.exp * 1000 < Date.now()) return null;
  return payload;
}

export function getSessionToken(): string | null {
  return cookies().get(SESSION_COOKIE)?.value ?? null;
}

export function getSessionUser(): SessionUser | null {
  const session = getSession();
  if (!session) return null;
  const raw = cookies().get(SESSION_USER_COOKIE)?.value;
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<SessionUser>;
    if (!parsed || typeof parsed !== "object") return null;
    if (!isRole(parsed.role)) return null;
    if (!parsed.id || !parsed.email || !parsed.firstName || !parsed.lastName) return null;
    return {
      id: parsed.id,
      firstName: parsed.firstName,
      lastName: parsed.lastName,
      email: parsed.email,
      role: parsed.role,
      status: parsed.status,
    };
  } catch {
    return null;
  }
}
