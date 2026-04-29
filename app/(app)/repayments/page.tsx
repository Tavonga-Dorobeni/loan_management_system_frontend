import { RepaymentsTable } from "@/components/repayments/RepaymentsTable";

export const metadata = {
  title: "Repayments — Loan Management",
};

export default function RepaymentsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Repayments</h1>
        <p className="text-sm text-muted-foreground">
          Chronological repayment ledger. Filter by status, loan, or date range.
        </p>
      </div>
      <RepaymentsTable />
    </div>
  );
}
