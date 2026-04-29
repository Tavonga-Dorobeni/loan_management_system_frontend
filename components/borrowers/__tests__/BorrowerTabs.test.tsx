import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { BorrowerTabs } from "../BorrowerTabs";
import { SessionProvider } from "@/hooks/useAuth";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), replace: jest.fn() }),
}));

const BASE = "http://localhost:3000/api/v1";

const borrower = {
  id: "b-1",
  firstName: "Jane",
  lastName: "Doe",
  ecNumber: "EC-100",
  idNumber: "ID-500",
  phoneNumber: "+15555550100",
  email: "jane@example.com",
};

const adminSession = {
  id: "u-1",
  firstName: "Ada",
  lastName: "Admin",
  email: "ada@example.com",
  role: "admin" as const,
};

function renderTabs() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <SessionProvider user={adminSession}>
        <BorrowerTabs borrower={borrower} />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  server.use(
    http.get(`${BASE}/borrowers/b-1/profile`, () =>
      HttpResponse.json({
        success: true,
        data: {
          borrower,
          kyc: [
            { documentType: "payslip", present: true },
            { documentType: "national_id", present: false },
          ],
          loanSummary: { count: 2, activeCount: 1, outstandingDue: 2500 },
        },
      }),
    ),
    http.get(`${BASE}/borrowers/b-1/loans`, () =>
      HttpResponse.json({
        success: true,
        data: {
          items: [
            {
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
          ],
          pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
        },
      }),
    ),
    http.get(`${BASE}/activity-logs`, () =>
      HttpResponse.json({
        success: true,
        data: {
          items: [
            {
              id: "a-1",
              actorUserId: "u-1",
              actorRole: "admin",
              entityType: "borrower",
              entityId: "b-1",
              action: "borrower.updated",
              summary: "Ada Admin (admin) updated borrower Jane Doe",
              metadata: null,
              sourceType: "api",
              sourceReference: null,
              createdAt: new Date().toISOString(),
            },
          ],
          pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
        },
      }),
    ),
  );
});

describe("BorrowerTabs", () => {
  it("opens the Loan history tab and renders the loan reference", async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole("tab", { name: /loan history/i }));
    expect(await screen.findByText("REF-1001")).toBeInTheDocument();
  });

  it("opens the Activity trail tab and renders a summary", async () => {
    const user = userEvent.setup();
    renderTabs();

    await user.click(screen.getByRole("tab", { name: /activity trail/i }));
    expect(
      await screen.findByText(/updated borrower Jane Doe/i),
    ).toBeInTheDocument();
  });

  it("KYC tab renders the four document cards", async () => {
    server.use(
      http.get(`${BASE}/borrower-kyc/borrower/b-1`, () =>
        HttpResponse.json({
          success: true,
          data: { items: [] },
        }),
      ),
    );
    const user = userEvent.setup();
    renderTabs();
    await user.click(screen.getByRole("tab", { name: /kyc/i }));
    expect(await screen.findByRole("heading", { name: "Payslip" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "National ID" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Passport photo" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Application form" })).toBeInTheDocument();
  });
});
