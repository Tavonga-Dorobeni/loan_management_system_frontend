import { apiFetch } from "../api-client";

export type ImportSummary = {
  totalRows: number;
  successCount: number;
  failureCount: number;
  failedRows: { rowNumber: number; reference?: string; error: string }[];
};

type ImportQuery = Record<string, string | number | boolean | null | undefined> | undefined;

export function importIntake(form: FormData, query?: ImportQuery) {
  return apiFetch<ImportSummary>("/loans/import/excel", { method: "POST", body: form, query });
}
export function importApprovals(form: FormData, query?: ImportQuery) {
  return apiFetch<ImportSummary>("/loans/import/approvals/excel", { method: "POST", body: form, query });
}
export function importRepayments(form: FormData, query?: ImportQuery) {
  return apiFetch<ImportSummary>("/loans/import/repayments/excel", { method: "POST", body: form, query });
}
