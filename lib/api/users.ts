import { apiFetch, apiList } from "../api-client";
import type { AuthUser } from "./auth";
import type { Role } from "../rbac";

export type User = AuthUser;

export type UserListQuery = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  role?: Role;
  status?: string;
};

export function listUsers(query: UserListQuery = {}) {
  return apiList<User>("/users", query);
}
export function getUser(id: string | number) {
  return apiFetch<User>(`/users/${id}`);
}
export function createUser(body: Partial<User> & { password: string }) {
  return apiFetch<User>("/users", { method: "POST", body });
}
export function updateUser(id: string | number, body: Partial<User>) {
  return apiFetch<User>(`/users/${id}`, { method: "PUT", body });
}
export function deleteUser(id: string | number) {
  return apiFetch<void>(`/users/${id}`, { method: "DELETE" });
}
export function changePassword(
  id: string | number,
  body: { currentPassword?: string; newPassword: string },
) {
  return apiFetch<void>(`/users/${id}/change-password`, { method: "POST", body });
}
