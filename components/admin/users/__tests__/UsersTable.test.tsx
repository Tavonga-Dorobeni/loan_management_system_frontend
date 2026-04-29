import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { UsersTable } from "../UsersTable";

const replace = jest.fn();
const searchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: jest.fn(), push: jest.fn() }),
  usePathname: () => "/admin/users",
  useSearchParams: () => searchParams,
}));

const BASE = "http://localhost:3000/api/v1";

function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

beforeEach(() => {
  replace.mockReset();
  searchParams.forEach((_, k) => searchParams.delete(k));
});

describe("UsersTable", () => {
  it("renders user rows from the API", async () => {
    server.use(
      http.get(`${BASE}/users`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [
              {
                id: "u1",
                firstName: "Ada",
                lastName: "Admin",
                email: "ada@example.com",
                role: "admin",
                status: "active",
              },
              {
                id: "u2",
                firstName: "Lou",
                lastName: "Officer",
                email: "lou@example.com",
                role: "loan_officer",
                status: "active",
              },
            ],
            pagination: { page: 1, pageSize: 20, totalItems: 2, totalPages: 1 },
          },
        }),
      ),
    );

    renderWithClient(<UsersTable />);

    expect(await screen.findByText("Ada Admin")).toBeInTheDocument();
    expect(screen.getByText("Lou Officer")).toBeInTheDocument();
    expect(screen.getByText("ada@example.com")).toBeInTheDocument();
  });

  it("shows the empty-state label when no users match", async () => {
    server.use(
      http.get(`${BASE}/users`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [],
            pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 1 },
          },
        }),
      ),
    );

    renderWithClient(<UsersTable />);
    expect(await screen.findByText(/no users match/i)).toBeInTheDocument();
  });

  it("pushes ?role= to the URL when the role filter changes", async () => {
    server.use(
      http.get(`${BASE}/users`, () =>
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
    renderWithClient(<UsersTable />);

    await screen.findByText(/no users match/i);
    await user.selectOptions(screen.getByLabelText(/role filter/i), "loan_officer");

    await waitFor(() => expect(replace).toHaveBeenCalled());
    const target = replace.mock.calls.at(-1)?.[0] as string;
    expect(target).toContain("role=loan_officer");
  });
});
