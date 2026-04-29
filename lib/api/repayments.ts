import { apiFetch, apiList } from "../api-client";

export type RepaymentStatus = "CORRECT" | "OVER" | "UNDER";

export type Repayment = {
  id: number | string;
  loanId: number | string;
  amount: number;
  transactionDate: string;
  status: RepaymentStatus;
  createdAt?: string;
};

export type RepaymentListQuery = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  loanId?: string | number;
  status?: RepaymentStatus;
  /** UI lower bound for transactionDate; mapped to backend `transactionDateFrom`. */
  from?: string;
  /** UI upper bound for transactionDate; mapped to backend `transactionDateTo`. */
  to?: string;
};

type BackendQuery = Record<string, string | number | boolean | null | undefined>;

function toBackendRepaymentQuery(
  q: RepaymentListQuery | BackendQuery = {},
): BackendQuery {
  const { from, to, ...rest } = q as Record<string, unknown>;
  const out: BackendQuery = {};
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v as string | number | boolean;
  }
  if (from) out.transactionDateFrom = String(from);
  if (to) out.transactionDateTo = String(to);
  return out;
}

export function listRepayments(query: RepaymentListQuery | BackendQuery = {}) {
  return apiList<Repayment>("/repayments", toBackendRepaymentQuery(query));
}
export function getRepayment(id: string | number) {
  return apiFetch<Repayment>(`/repayments/${id}`);
}
export function createRepayment(body: Partial<Repayment>) {
  return apiFetch<Repayment>("/repayments", { method: "POST", body });
}
export function updateRepayment(id: string | number, body: Partial<Repayment>) {
  return apiFetch<Repayment>(`/repayments/${id}`, { method: "PUT", body });
}
export function deleteRepayment(id: string | number) {
  return apiFetch<void>(`/repayments/${id}`, { method: "DELETE" });
}
