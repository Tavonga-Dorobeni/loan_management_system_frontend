import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { BorrowersTable } from "../BorrowersTable";
import { SessionProvider } from "@/hooks/useAuth";
import type { SessionUser } from "@/lib/auth/session";

const replace = jest.fn();
const searchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: jest.fn(), push: jest.fn() }),
  usePathname: () => "/borrowers",
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

const supportSession: SessionUser = { ...adminSession, role: "customer_support" };

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

describe("BorrowersTable", () => {
  it("renders borrower rows", async () => {
    server.use(
      http.get(`${BASE}/borrowers`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [
              {
                id: "b-1",
                firstName: "Jane",
                lastName: "Doe",
                ecNumber: "EC-100",
                idNumber: "ID-500",
                phoneNumber: "+15555550100",
                email: "jane@example.com",
              },
            ],
            pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
          },
        }),
      ),
    );

    renderWith(<BorrowersTable />);
    expect(await screen.findByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("EC-100")).toBeInTheDocument();
    expect(screen.getByText("ID-500")).toBeInTheDocument();
  });

  it("hides the New borrower button for customer_support", async () => {
    server.use(
      http.get(`${BASE}/borrowers`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [],
            pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 1 },
          },
        }),
      ),
    );

    renderWith(<BorrowersTable />, supportSession);
    await screen.findByText(/no borrowers match/i);
    expect(screen.queryByRole("link", { name: /new borrower/i })).not.toBeInTheDocument();
  });

  it("shows the New borrower button for loan_officer", async () => {
    server.use(
      http.get(`${BASE}/borrowers`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [],
            pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 1 },
          },
        }),
      ),
    );

    renderWith(<BorrowersTable />, { ...adminSession, role: "loan_officer" });
    await screen.findByText(/no borrowers match/i);
    expect(screen.getByRole("link", { name: /new borrower/i })).toBeInTheDocument();
  });
});
