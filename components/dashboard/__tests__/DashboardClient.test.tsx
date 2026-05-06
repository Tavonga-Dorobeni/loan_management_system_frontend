import { render, screen, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { DashboardClient } from "../DashboardClient";

jest.mock("recharts", () => {
  const Stub = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  const Pass = () => null;
  return {
    ResponsiveContainer: Stub,
    LineChart: Stub,
    BarChart: Stub,
    Line: Pass,
    Bar: Pass,
    XAxis: Pass,
    YAxis: Pass,
    CartesianGrid: Pass,
    Tooltip: Pass,
  };
});

const BASE = "http://localhost:3000/api/v1";

function fullSummary(overrides: Record<string, unknown> = {}) {
  return {
    totalActiveLoans: 42,
    totalOutstandingAmountDue: 125_000,
    totalAmountPaidInPeriod: 75_000,
    overdueLoanCount: 5,
    repaymentCollectionRate: 0.88,
    incompleteKycCount: 3,
    recentImports: [],
    approvalTrend: [],
    repaymentTrend: [],
    monthlyCollectionsExpected: 24_500,
    averageMonthlyInstallment: 583,
    totalLoansOnBook: 60,
    newThisYear: 18,
    maturedClosedCount: 15,
    activeRate: 0.7,
    totalLoanBookSize: 360_000,
    averageLoanSize: 8_571,
    principalMaturingThisMonth: 12_000,
    principalMaturingNext3Months: 38_000,
    par30Rate: 0.12,
    par90Rate: 0.04,
    missingDataCount: 2,
    maturityByMonth: [{ month: "2026-05", count: 4 }],
    actualCollectionsByMonth: [{ month: "2026-04", amount: 22_000 }],
    topActiveInstallments: [
      {
        loanId: "loan-1",
        referenceNumber: "REF-001",
        repaymentAmount: 1_500,
        endDate: "2027-01-15",
        borrower: { id: "b-1", ecNumber: "EC-1001", firstName: "Ada", lastName: "Lovelace" },
      },
    ],
    ...overrides,
  };
}

function renderClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <DashboardClient />
    </QueryClientProvider>,
  );
}

describe("DashboardClient", () => {
  it("renders all three labeled sections", async () => {
    server.use(
      http.get(`${BASE}/dashboard/portfolio-summary`, () =>
        HttpResponse.json({ success: true, data: fullSummary() }),
      ),
    );

    renderClient();

    expect(await screen.findByText("Key Performance Indicators")).toBeInTheDocument();
    expect(screen.getByText("Loan Book Size")).toBeInTheDocument();
    expect(screen.getByText("Portfolio Quality")).toBeInTheDocument();
  });

  it("renders the eight KPI cards plus the Loan Book Size and Portfolio Quality cards", async () => {
    server.use(
      http.get(`${BASE}/dashboard/portfolio-summary`, () =>
        HttpResponse.json({ success: true, data: fullSummary() }),
      ),
    );

    renderClient();

    // KPI labels
    expect(await screen.findByText("Active Loans")).toBeInTheDocument();
    expect(screen.getByText("Monthly Collections")).toBeInTheDocument();
    expect(screen.getByText("Future Collections")).toBeInTheDocument();
    expect(screen.getByText("Avg Monthly Installment")).toBeInTheDocument();
    expect(screen.getByText("Total Loans on Book")).toBeInTheDocument();
    expect(screen.getByText(/^New in /)).toBeInTheDocument();
    expect(screen.getByText("Matured / Closed")).toBeInTheDocument();
    expect(screen.getByText("Active Rate")).toBeInTheDocument();

    // Loan Book Size labels
    expect(screen.getByText("Total Loan Book Size")).toBeInTheDocument();
    expect(screen.getByText("Avg Loan Size")).toBeInTheDocument();
    expect(screen.getByText("Maturing This Month")).toBeInTheDocument();
    expect(screen.getByText("Maturing Next 3 Months")).toBeInTheDocument();

    // Portfolio Quality labels
    expect(screen.getByText("PAR 30")).toBeInTheDocument();
    expect(screen.getByText("PAR 90")).toBeInTheDocument();
    expect(screen.getByText("Collection Rate")).toBeInTheDocument();
    expect(screen.getByText("Missing Data")).toBeInTheDocument();
  });

  it("formats currency, percent, and integer values correctly", async () => {
    server.use(
      http.get(`${BASE}/dashboard/portfolio-summary`, () =>
        HttpResponse.json({ success: true, data: fullSummary() }),
      ),
    );

    renderClient();

    expect(await screen.findByText("42")).toBeInTheDocument(); // active loans
    expect(screen.getByText(/125,000/)).toBeInTheDocument(); // future collections
    expect(screen.getByText(/360,000/)).toBeInTheDocument(); // total loan book size
    expect(screen.getByText(/^70%$/)).toBeInTheDocument(); // active rate
    expect(screen.getByText(/^88%$/)).toBeInTheDocument(); // collection rate
    expect(screen.getByText(/^12%$/)).toBeInTheDocument(); // PAR 30
  });

  it("renders the top-installments section with the seeded row", async () => {
    server.use(
      http.get(`${BASE}/dashboard/portfolio-summary`, () =>
        HttpResponse.json({ success: true, data: fullSummary() }),
      ),
    );

    renderClient();

    expect(
      await screen.findByText(/Top 10 largest active monthly installments/i),
    ).toBeInTheDocument();
    const adaLink = await screen.findByRole("link", { name: "Ada Lovelace" });
    expect(adaLink).toHaveAttribute("href", "/borrowers/b-1");
    const refLink = screen.getByRole("link", { name: "REF-001" });
    expect(refLink).toHaveAttribute("href", "/loans/loan-1");
  });

  it("falls back to placeholders when extended fields are absent", async () => {
    server.use(
      http.get(`${BASE}/dashboard/portfolio-summary`, () =>
        HttpResponse.json({
          success: true,
          data: {
            totalActiveLoans: 0,
            totalOutstandingAmountDue: 0,
            totalAmountPaidInPeriod: 0,
            overdueLoanCount: 0,
            repaymentCollectionRate: 0,
            incompleteKycCount: 0,
            recentImports: [],
            approvalTrend: [],
            repaymentTrend: [],
          },
        }),
      ),
    );

    renderClient();

    // Empty Top 10 table
    expect(await screen.findByText(/no active loans yet/i)).toBeInTheDocument();
    // Cards still render their labels even when values are missing
    expect(screen.getByText("PAR 30")).toBeInTheDocument();

    // The Avg Loan Size card has no data — its value should fall back to "—"
    const avgLoan = screen.getByText("Avg Loan Size").closest("div[class*='rounded-lg']");
    expect(avgLoan).not.toBeNull();
    if (avgLoan) {
      expect(within(avgLoan as HTMLElement).getAllByText("—").length).toBeGreaterThan(0);
    }
  });
});
