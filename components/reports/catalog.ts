import type { ReportSlug } from "@/lib/api/reports";

export const REPORT_CATALOG: Record<
  ReportSlug,
  { title: string; description: string }
> = {
  "loan-portfolio": {
    title: "Loan portfolio",
    description: "All loans with status, balances, and term metadata.",
  },
  "borrower-register": {
    title: "Borrower register",
    description: "Every borrower with identity numbers and contact info.",
  },
  "kyc-completeness": {
    title: "KYC completeness",
    description: "Per-borrower KYC document checklist.",
  },
  disbursement: {
    title: "Disbursement",
    description: "Loans disbursed within the selected period.",
  },
  "approval-outcome": {
    title: "Approval outcome",
    description: "Approval decisions over time, grouped by status.",
  },
  repayment: {
    title: "Repayment",
    description: "Repayment events with derived status (CORRECT / OVER / UNDER).",
  },
  arrears: {
    title: "Arrears",
    description: "Loans currently in arrears with outstanding amounts.",
  },
  "collections-performance": {
    title: "Collections performance",
    description: "Collections officer activity and recovery rates.",
  },
  "import-exceptions": {
    title: "Import exceptions",
    description: "Row-level failures from recent bulk-import runs.",
  },
};
