import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { SessionProvider } from "@/hooks/useAuth";
import type { SessionUser } from "@/lib/auth/session";
import { RepaymentsTable } from "../RepaymentsTable";

const replace = jest.fn();
const searchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: jest.fn(), push: jest.fn() }),
  usePathname: () => "/repayments",
  useSearchParams: () => searchParams,
}));

const BASE = "http://localhost:3000/api/v1";

const adminSession: SessionUser = {
  id: "u-1",
  firstName: "Ada",
  lastName: "Admin",
  email: "ada@example.com",
  role: "admin",
};

function renderWith(ui: React.ReactElement, session: SessionUser = adminSession) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <SessionProvider user={session}>{ui}</SessionProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  replace.mockReset();
  searchParams.forEach((_, k) => searchParams.delete(k));
});

describe("RepaymentsTable", () => {
  it("renders rows with status badges", async () => {
    server.use(
      http.get(`${BASE}/repayments`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [
              {
                id: "r-1",
                loanId: "l-1",
                amount: 250,
                transactionDate: "2026-04-01",
                status: "CORRECT",
              },
              {
                id: "r-2",
                loanId: "l-1",
                amount: 100,
                transactionDate: "2026-04-15",
                status: "UNDER",
              },
            ],
            pagination: { page: 1, pageSize: 20, totalItems: 2, totalPages: 1 },
          },
        }),
      ),
    );

    renderWith(<RepaymentsTable />);

    // Wait for the data rows to appear (header + 2 data rows == 3 total).
    await waitFor(() => expect(screen.getAllByRole("row").length).toBe(3));
    expect(screen.getByText(/250\.00/)).toBeInTheDocument();
    expect(screen.getByText(/100\.00/)).toBeInTheDocument();
  });

  it("pushes status filter to the URL", async () => {
    server.use(
      http.get(`${BASE}/repayments`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [],
            pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 1 },
          },
        }),
      ),
    );

    const user = userEvent.setup();
    renderWith(<RepaymentsTable />);
    await screen.findByText(/no repayments/i);

    await user.selectOptions(screen.getByLabelText(/status filter/i), "UNDER");

    await waitFor(() => expect(replace).toHaveBeenCalled());
    const target = replace.mock.calls.at(-1)?.[0] as string;
    expect(target).toContain("status=UNDER");
  });

  it("hides delete affordance for read-only roles", async () => {
    server.use(
      http.get(`${BASE}/repayments`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [
              {
                id: "r-1",
                loanId: "l-1",
                amount: 250,
                transactionDate: "2026-04-01",
                status: "CORRECT",
              },
            ],
            pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
          },
        }),
      ),
    );

    renderWith(<RepaymentsTable />, { ...adminSession, role: "loan_officer" });
    await screen.findByText("CORRECT");
    expect(screen.queryByRole("button", { name: /^delete$/i })).not.toBeInTheDocument();
  });
});
