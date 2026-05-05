import { render, screen } from "@testing-library/react";
import { MonthScheduleSummary } from "../MonthScheduleSummary";
import type { ScheduleMonth } from "@/lib/api/repayments";

function buildMonth(overrides: Partial<ScheduleMonth> = {}): ScheduleMonth {
  return {
    month: 5,
    label: "May",
    expected: 52000,
    received: 30000,
    outstanding: 22000,
    activeLoanCount: 13,
    repaymentCount: 6,
    status: "PARTIAL",
    ...overrides,
  };
}

describe("MonthScheduleSummary", () => {
  it("renders Expected, Received, Outstanding amounts with currency formatting", () => {
    render(<MonthScheduleSummary month={buildMonth()} year={2026} />);
    // Heading
    expect(screen.getByRole("heading", { name: /may 2026/i })).toBeInTheDocument();
    // Stats — currency formatted with $ and commas.
    expect(screen.getByText("$52,000.00")).toBeInTheDocument();
    expect(screen.getByText("$30,000.00")).toBeInTheDocument();
    expect(screen.getByText("$22,000.00")).toBeInTheDocument();
  });

  it("shows 'next pending' marker when the prop is set", () => {
    render(<MonthScheduleSummary month={buildMonth()} year={2026} isNextPending />);
    expect(screen.getByText(/next pending/i)).toBeInTheDocument();
  });

  it("renders the upload CTA when uploadHref is provided and month is active", () => {
    render(
      <MonthScheduleSummary
        month={buildMonth()}
        year={2026}
        uploadHref="/imports/repayments?year=2026&month=5"
      />,
    );
    const link = screen.getByRole("link", { name: /upload repayments/i });
    expect(link).toHaveAttribute("href", "/imports/repayments?year=2026&month=5");
  });

  it("hides the stats grid and upload CTA for INACTIVE months", () => {
    render(
      <MonthScheduleSummary
        month={buildMonth({ status: "INACTIVE", expected: 0, received: 0, outstanding: 0, activeLoanCount: 0 })}
        year={2026}
        uploadHref="/imports/repayments?year=2026&month=5"
      />,
    );
    expect(screen.getByText(/no active loans/i)).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /upload repayments/i })).not.toBeInTheDocument();
    expect(screen.queryByText("$0.00")).not.toBeInTheDocument();
  });

  it("labels overpayment as 'Overpaid' when outstanding is negative", () => {
    render(
      <MonthScheduleSummary
        month={buildMonth({ received: 60000, outstanding: -8000 })}
        year={2026}
      />,
    );
    expect(screen.getByText(/overpaid/i)).toBeInTheDocument();
    expect(screen.getByText("$8,000.00")).toBeInTheDocument();
  });
});
