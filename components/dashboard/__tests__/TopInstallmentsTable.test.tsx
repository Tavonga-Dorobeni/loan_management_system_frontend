import { render, screen } from "@testing-library/react";
import { TopInstallmentsTable } from "../TopInstallmentsTable";
import type { TopActiveInstallment } from "@/lib/api/reports";

const ROWS: TopActiveInstallment[] = [
  {
    loanId: "loan-7",
    referenceNumber: "REF-007",
    repaymentAmount: 2_500,
    endDate: "2027-06-30",
    borrower: { id: "b-7", ecNumber: "EC-7777", firstName: "Grace", lastName: "Hopper" },
  },
  {
    loanId: "loan-8",
    referenceNumber: "REF-008",
    repaymentAmount: 1_800,
    endDate: "2026-12-15",
    borrower: { id: "b-8", ecNumber: "EC-8888", firstName: "Linus", lastName: "Torvalds" },
  },
];

describe("TopInstallmentsTable", () => {
  it("renders rows with currency-formatted amounts and linked borrower/loan cells", () => {
    render(<TopInstallmentsTable rows={ROWS} />);

    expect(screen.getByText("EC-7777")).toBeInTheDocument();
    expect(screen.getByText("EC-8888")).toBeInTheDocument();

    const grace = screen.getByRole("link", { name: "Grace Hopper" });
    expect(grace).toHaveAttribute("href", "/borrowers/b-7");

    const ref7 = screen.getByRole("link", { name: "REF-007" });
    expect(ref7).toHaveAttribute("href", "/loans/loan-7");

    expect(screen.getByText("$2,500.00")).toBeInTheDocument();
    expect(screen.getByText("$1,800.00")).toBeInTheDocument();
  });

  it("shows the empty state when no rows are provided", () => {
    render(<TopInstallmentsTable rows={[]} />);
    expect(screen.getByText(/no active loans yet/i)).toBeInTheDocument();
  });
});
