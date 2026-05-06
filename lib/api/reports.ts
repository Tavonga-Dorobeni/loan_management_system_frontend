import { apiFetch } from "../api-client";

export type TopActiveInstallment = {
  loanId: number | string;
  referenceNumber: string;
  repaymentAmount: number;
  endDate: string;
  borrower: {
    id: number | string;
    ecNumber: string;
    firstName: string;
    lastName: string;
  };
};

export type DashboardSummary = {
  totalActiveLoans: number;
  totalOutstandingAmountDue: number;
  totalAmountPaidInPeriod: number;
  overdueLoanCount: number;
  repaymentCollectionRate: number;
  incompleteKycCount: number;
  recentImports: { type: string; at: string; success: number; failure: number }[];
  approvalTrend: { date: string; count: number }[];
  repaymentTrend: { date: string; count: number }[];

  // Extended dashboard fields (optional until backend ships them)
  monthlyCollectionsExpected?: number;
  averageMonthlyInstallment?: number;
  totalLoansOnBook?: number;
  newThisYear?: number;
  maturedClosedCount?: number;
  activeRate?: number;

  totalLoanBookSize?: number;
  averageLoanSize?: number;
  principalMaturingThisMonth?: number;
  principalMaturingNext3Months?: number;

  par30Rate?: number;
  par90Rate?: number;
  missingDataCount?: number;

  maturityByMonth?: { month: string; count: number }[];
  actualCollectionsByMonth?: { month: string; amount: number }[];

  topActiveInstallments?: TopActiveInstallment[];
};

export const REPORT_SLUGS = [
  "loan-portfolio",
  "borrower-register",
  "kyc-completeness",
  "disbursement",
  "approval-outcome",
  "repayment",
  "arrears",
  "collections-performance",
  "import-exceptions",
] as const;

export type ReportSlug = (typeof REPORT_SLUGS)[number];

export type ReportRow = Record<string, unknown>;
export type ReportEnvelope = { rows: ReportRow[] };

export function getDashboardSummary(query: { from?: string; to?: string } = {}) {
  return apiFetch<DashboardSummary>("/dashboard/portfolio-summary", { query });
}

export function getReport(slug: ReportSlug, query: Record<string, string> = {}) {
  return apiFetch<ReportEnvelope>(`/reports/${slug}`, { query });
}

export function reportExportUrl(
  slug: ReportSlug,
  format: "csv" | "xlsx",
  query: Record<string, string> = {},
) {
  const params = new URLSearchParams({ ...query, format });
  return `/reports/${slug}?${params.toString()}`;
}
