import { apiFetch } from "../api-client";
import type { Role } from "../rbac";

export type AuthUser = {
  id: number | string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  status: "active" | "disabled" | "pending";
};

export type LoginResponse = { user: AuthUser; token: string };

export function login(body: { email: string; password: string }) {
  return apiFetch<LoginResponse>("/auth/login", { method: "POST", body });
}
