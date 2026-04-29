import { render, screen } from "@testing-library/react";
import { LoanBalanceCard } from "../LoanBalanceCard";
import type { LoanDetails } from "@/lib/api/loans";

const details: LoanDetails = {
  loan: {
    id: "l-1",
    borrowerId: "b-1",
    referenceNumber: "REF-1001",
    type: "PERSONAL",
    status: "SUCCESS",
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    disbursementDate: "2026-01-05",
    repaymentAmount: 250,
    totalAmount: 3000,
    amountPaid: 500,
    amountDue: 2500,
    message: null,
  },
  borrower: {
    id: "b-1",
    firstName: "Jane",
    lastName: "Doe",
    ecNumber: "EC-1",
    idNumber: "ID-1",
    phoneNumber: null,
    email: null,
  },
  balance: { amountPaid: 500, amountDue: 2500, repaymentAmount: 250 },
};

describe("LoanBalanceCard", () => {
  it("renders paid + outstanding currency and progress percent", () => {
    render(<LoanBalanceCard details={details} />);
    expect(screen.getByText("$500.00")).toBeInTheDocument();
    expect(screen.getByText("$2,500.00")).toBeInTheDocument();
    expect(screen.getByText("17%")).toBeInTheDocument(); // 500 / 3000
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "17");
  });

  it("renders the loan status badge", () => {
    render(<LoanBalanceCard details={details} />);
    // The badge variant for SUCCESS uses success styling — we just assert text presence.
    expect(screen.getByText("SUCCESS")).toBeInTheDocument();
  });

  it("handles a fully unpaid loan without dividing by zero", () => {
    const zero: LoanDetails = {
      ...details,
      balance: { amountPaid: 0, amountDue: 0, repaymentAmount: 250 },
    };
    render(<LoanBalanceCard details={zero} />);
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
