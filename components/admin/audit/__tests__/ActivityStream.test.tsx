import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { SessionProvider } from "@/hooks/useAuth";
import type { SessionUser } from "@/lib/auth/session";
import { ActivityStream } from "../ActivityStream";

const replace = jest.fn();
const searchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh: jest.fn(), push: jest.fn() }),
  usePathname: () => "/admin/audit",
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

function renderWith(session: SessionUser = adminSession) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <SessionProvider user={session}>
        <ActivityStream />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  replace.mockReset();
  searchParams.forEach((_, k) => searchParams.delete(k));
});

describe("ActivityStream", () => {
  it("renders human-readable summaries (DESIGN §6)", async () => {
    server.use(
      http.get(`${BASE}/activity-logs`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [
              {
                id: "a-1",
                actorUserId: "u-1",
                actorRole: "admin",
                entityType: "loan",
                entityId: "l-1",
                action: "loan.status.changed",
                summary:
                  "Ada Admin (admin) updated status of Loan #REF-102 to APPROVED",
                metadata: { before: { status: "PENDING" }, after: { status: "APPROVED" } },
                sourceType: "api",
                sourceReference: null,
                createdAt: new Date().toISOString(),
              },
              {
                id: "a-2",
                actorUserId: null,
                actorRole: null,
                entityType: "import",
                entityId: null,
                action: "loan.import.intake.completed",
                summary: "Intake import finished: 45/47",
                metadata: { totalRows: 47, successCount: 45, failureCount: 2 },
                sourceType: "import",
                sourceReference: "loans-2026-04-29.xlsx",
                createdAt: new Date().toISOString(),
              },
            ],
            pagination: { page: 1, pageSize: 20, totalItems: 2, totalPages: 1 },
          },
        }),
      ),
    );

    renderWith();

    expect(
      await screen.findByText(
        /Ada Admin \(admin\) updated status of Loan #REF-102 to APPROVED/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Intake import finished: 45\/47/)).toBeInTheDocument();
    // Source reference is surfaced as a badge for non-api entries.
    expect(screen.getByText(/loans-2026-04-29\.xlsx/)).toBeInTheDocument();
  });

  it("shows the empty-state message when no entries match", async () => {
    server.use(
      http.get(`${BASE}/activity-logs`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [],
            pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 1 },
          },
        }),
      ),
    );

    renderWith();
    expect(await screen.findByText(/no activity matches/i)).toBeInTheDocument();
  });

  it("pushes filter values to the URL", async () => {
    server.use(
      http.get(`${BASE}/activity-logs`, () =>
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
    renderWith();
    await screen.findByText(/no activity matches/i);

    await user.selectOptions(screen.getByLabelText(/entity type/i), "loan");

    await waitFor(() => expect(replace).toHaveBeenCalled());
    const target = replace.mock.calls.at(-1)?.[0] as string;
    expect(target).toContain("entityType=loan");
  });

  it("denies access for non-admin actors", () => {
    renderWith({ ...adminSession, role: "loan_officer" });
    expect(screen.getByText(/admin-only/i)).toBeInTheDocument();
  });
});
