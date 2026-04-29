import { render, screen } from "@testing-library/react";
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
    Line: Pass,
    XAxis: Pass,
    YAxis: Pass,
    CartesianGrid: Pass,
    Tooltip: Pass,
  };
});

const BASE = "http://localhost:3000/api/v1";

function renderClient() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <DashboardClient />
    </QueryClientProvider>,
  );
}

describe("DashboardClient", () => {
  it("renders the SPEC §13 metrics", async () => {
    server.use(
      http.get(`${BASE}/dashboard/portfolio-summary`, () =>
        HttpResponse.json({
          success: true,
          data: {
            totalActiveLoans: 42,
            totalOutstandingAmountDue: 125_000,
            totalAmountPaidInPeriod: 75_000,
            overdueLoanCount: 5,
            repaymentCollectionRate: 0.88,
            incompleteKycCount: 3,
            recentImports: [],
            approvalTrend: [],
            repaymentTrend: [],
          },
        }),
      ),
    );

    renderClient();

    expect(await screen.findByText("42")).toBeInTheDocument(); // active loans
    expect(screen.getByText("5")).toBeInTheDocument(); // overdue
    expect(screen.getByText("3")).toBeInTheDocument(); // incomplete kyc
    expect(screen.getByText(/125,000/)).toBeInTheDocument();
    expect(screen.getByText(/75,000/)).toBeInTheDocument();
    expect(screen.getByText(/88%/)).toBeInTheDocument();
  });

  it("renders the recent-imports placeholder when none have run", async () => {
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
    expect(await screen.findByText(/no recent imports/i)).toBeInTheDocument();
  });
});
