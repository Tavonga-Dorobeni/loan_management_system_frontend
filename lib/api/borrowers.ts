import { apiFetch, apiList } from "../api-client";

export type Borrower = {
  id: number | string;
  firstName: string;
  lastName: string;
  ecNumber: string;
  idNumber: string;
  phoneNumber: string | null;
  email: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type BorrowerProfile = {
  borrower: Borrower;
  kyc: { documentType: string; present: boolean }[];
  loanSummary: { count: number; activeCount: number; outstandingDue: number };
};

export type BorrowerListQuery = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
};

export function listBorrowers(query: BorrowerListQuery = {}) {
  return apiList<Borrower>("/borrowers", query);
}
export function getBorrower(id: string | number) {
  return apiFetch<Borrower>(`/borrowers/${id}`);
}
export function getBorrowerProfile(id: string | number) {
  return apiFetch<BorrowerProfile>(`/borrowers/${id}/profile`);
}
export function listBorrowerLoans(id: string | number, query: Record<string, unknown> = {}) {
  return apiList<import("./loans").Loan>(`/borrowers/${id}/loans`, query as never);
}
export function createBorrower(body: Omit<Borrower, "id" | "createdAt" | "updatedAt">) {
  return apiFetch<Borrower>("/borrowers", { method: "POST", body });
}
export function updateBorrower(id: string | number, body: Partial<Borrower>) {
  return apiFetch<Borrower>(`/borrowers/${id}`, { method: "PUT", body });
}
export function deleteBorrower(id: string | number) {
  return apiFetch<void>(`/borrowers/${id}`, { method: "DELETE" });
}
