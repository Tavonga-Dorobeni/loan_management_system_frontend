import { LoansTable } from "@/components/loans/LoansTable";

export const metadata = {
  title: "Loans — Loan Management",
};

export default function LoansPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Loans</h1>
        <p className="text-sm text-muted-foreground">
          Filter by status, type, or date range. Click a reference to open the loan.
        </p>
      </div>
      <LoansTable />
    </div>
  );
}
