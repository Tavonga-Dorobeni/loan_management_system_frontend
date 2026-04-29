import { BorrowersTable } from "@/components/borrowers/BorrowersTable";

export const metadata = {
  title: "Borrowers — Loan Management",
};

export default function BorrowersPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Borrowers</h1>
        <p className="text-sm text-muted-foreground">
          Search by name, EC number, ID number, or phone.
        </p>
      </div>
      <BorrowersTable />
    </div>
  );
}
