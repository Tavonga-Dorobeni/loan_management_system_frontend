import { apiFetch, apiList } from "../api-client";
import type { Borrower } from "./borrowers";

export type LoanStatus = "PENDING" | "SUCCESS" | "FAILED" | string;

export type Loan = {
  id: number | string;
  borrowerId: number | string;
  referenceNumber: string;
  type: string;
  status: LoanStatus;
  startDate: string;
  endDate: string;
  disbursementDate: string | null;
  repaymentAmount: number;
  totalAmount: number;
  amountPaid: number | null;
  amountDue: number | null;
  message: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type LoanDetails = {
  loan: Loan;
  borrower: Borrower;
  balance: { amountPaid: number; amountDue: number; repaymentAmount: number };
};

export type LoanListQuery = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  borrowerId?: string | number;
  status?: LoanStatus;
  type?: string;
  /** UI lower bound for loan startDate; mapped to backend `startDateFrom`. */
  startDate?: string;
  /** UI upper bound for loan endDate; mapped to backend `endDateTo`. */
  endDate?: string;
};

type BackendQuery = Record<string, string | number | boolean | null | undefined>;

function toBackendLoanQuery(q: LoanListQuery | BackendQuery = {}): BackendQuery {
  const { startDate, endDate, ...rest } = q as Record<string, unknown>;
  const out: BackendQuery = {};
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined || v === null || v === "") continue;
    out[k] = v as string | number | boolean;
  }
  if (startDate) out.startDateFrom = String(startDate);
  if (endDate) out.endDateTo = String(endDate);
  return out;
}

export function listLoans(query: LoanListQuery | BackendQuery = {}) {
  return apiList<Loan>("/loans", toBackendLoanQuery(query));
}
export function getLoan(id: string | number) {
  return apiFetch<Loan>(`/loans/${id}`);
}
export function getLoanDetails(id: string | number) {
  return apiFetch<LoanDetails>(`/loans/${id}/details`);
}
export function listLoanRepayments(
  id: string | number,
  query: BackendQuery = {},
) {
  // Composite endpoint shares the repayments range convention.
  const { from, to, ...rest } = query as Record<string, unknown>;
  const mapped: BackendQuery = {};
  for (const [k, v] of Object.entries(rest)) {
    if (v === undefined || v === null || v === "") continue;
    mapped[k] = v as string | number | boolean;
  }
  if (from) mapped.transactionDateFrom = String(from);
  if (to) mapped.transactionDateTo = String(to);
  return apiList<import("./repayments").Repayment>(
    `/loans/${id}/repayments`,
    mapped,
  );
}
export function createLoan(body: Partial<Loan>) {
  return apiFetch<Loan>("/loans", { method: "POST", body });
}
export function updateLoan(id: string | number, body: Partial<Loan>) {
  return apiFetch<Loan>(`/loans/${id}`, { method: "PUT", body });
}
export function deleteLoan(id: string | number) {
  return apiFetch<void>(`/loans/${id}`, { method: "DELETE" });
}
