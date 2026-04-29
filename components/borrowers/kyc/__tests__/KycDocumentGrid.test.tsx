import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { SessionProvider } from "@/hooks/useAuth";
import type { SessionUser } from "@/lib/auth/session";
import { KycDocumentGrid } from "../KycDocumentGrid";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), replace: jest.fn() }),
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

function renderGrid(borrowerId = "b-1", session: SessionUser = adminSession) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <SessionProvider user={session}>
        <KycDocumentGrid borrowerId={borrowerId} />
      </SessionProvider>
    </QueryClientProvider>,
  );
}

describe("KycDocumentGrid", () => {
  it("renders all four document types with statuses", async () => {
    server.use(
      http.get(`${BASE}/borrower-kyc/borrower/b-1`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [
              {
                id: "k-1",
                borrowerId: "b-1",
                documentType: "payslip",
                signedUrl: "https://signed.example/k-1",
                createdAt: "2026-04-01T10:00:00Z",
              },
            ],
          },
        }),
      ),
    );

    renderGrid();

    expect(await screen.findByRole("heading", { name: "Payslip" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "National ID" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Passport photo" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Application form" })).toBeInTheDocument();

    // Wait for the React Query response to settle — Uploaded badge shows for the one returned doc.
    await screen.findByText(/^Uploaded$/);
    expect(screen.getAllByText(/^Missing$/).length).toBe(3);
  });

  it("hides upload affordances for read-only roles", async () => {
    server.use(
      http.get(`${BASE}/borrower-kyc/borrower/b-1`, () =>
        HttpResponse.json({ success: true, data: { items: [] } }),
      ),
    );

    renderGrid("b-1", supportSession);
    await screen.findByRole("heading", { name: "Payslip" });
    expect(screen.queryByRole("button", { name: /^upload$/i })).not.toBeInTheDocument();
  });

  it("shows an Upload button per document type for admins", async () => {
    server.use(
      http.get(`${BASE}/borrower-kyc/borrower/b-1`, () =>
        HttpResponse.json({ success: true, data: { items: [] } }),
      ),
    );

    renderGrid();
    await screen.findByRole("heading", { name: "Payslip" });
    const uploads = screen.getAllByRole("button", { name: /^upload$/i });
    expect(uploads.length).toBe(4);
  });

  it("renders a Preview link with target=_blank for an uploaded doc", async () => {
    server.use(
      http.get(`${BASE}/borrower-kyc/borrower/b-1`, () =>
        HttpResponse.json({
          success: true,
          data: {
            items: [
              {
                id: "k-1",
                borrowerId: "b-1",
                documentType: "national_id",
                signedUrl: "https://signed.example/k-1",
                createdAt: "2026-04-01T10:00:00Z",
              },
            ],
          },
        }),
      ),
    );

    renderGrid();
    const link = await screen.findByRole("link", { name: /preview/i });
    expect(link).toHaveAttribute("href", "https://signed.example/k-1");
    expect(link).toHaveAttribute("target", "_blank");
  });
});
