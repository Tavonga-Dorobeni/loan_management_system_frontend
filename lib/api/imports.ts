import { apiFetch } from "../api-client";

export type ImportSummary = {
  totalRows: number;
  successCount: number;
  failureCount: number;
  failedRows: { rowNumber: number; reference?: string; error: string }[];
};

export function importIntake(form: FormData) {
  return apiFetch<ImportSummary>("/loans/import/excel", { method: "POST", body: form });
}
export function importApprovals(form: FormData) {
  return apiFetch<ImportSummary>("/loans/import/approvals/excel", { method: "POST", body: form });
}
export function importRepayments(form: FormData) {
  return apiFetch<ImportSummary>("/loans/import/repayments/excel", { method: "POST", body: form });
}
