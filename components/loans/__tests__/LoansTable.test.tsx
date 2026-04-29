import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { LoansTable } from "../LoansTable";
import { SessionProvider } from "@/hooks/useAuth";
import type { SessionUser } from "@/lib/auth/session";

const replace = jest.fn();
const searchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: jest.fn(), push: jest.fn() }),
  usePathname: () => "/loans",
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

const seedLoan = {
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
};

beforeEach(() => {
  replace.mockReset();
  searchParams.forEach((_, k) => searchParams.delete(k));
});

describe("LoansTable", () => {
  it("renders rows with reference + currency formatting", async () => {
    server.use(
      http.get(`${BASE}/loans`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [seedLoan],
            pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
          },
        }),
      ),
    );

    renderWith(<LoansTable />);

    expect(await screen.findByText("REF-1001")).toBeInTheDocument();
    expect(screen.getByText("$3,000.00")).toBeInTheDocument();
    expect(screen.getByText("$2,500.00")).toBeInTheDocument();
  });

  it("pushes status filter to the URL", async () => {
    server.use(
      http.get(`${BASE}/loans`, () =>
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
    renderWith(<LoansTable />);
    await screen.findByText(/no loans/i);

    await user.selectOptions(screen.getByLabelText(/status filter/i), "SUCCESS");

    await waitFor(() => expect(replace).toHaveBeenCalled());
    const target = replace.mock.calls.at(-1)?.[0] as string;
    expect(target).toContain("status=SUCCESS");
  });

  it("hides the New loan button for collections_officer", async () => {
    server.use(
      http.get(`${BASE}/loans`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [],
            pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 1 },
          },
        }),
      ),
    );

    renderWith(<LoansTable />, { ...adminSession, role: "collections_officer" });
    await screen.findByText(/no loans/i);
    expect(screen.queryByRole("link", { name: /new loan/i })).not.toBeInTheDocument();
  });
});
