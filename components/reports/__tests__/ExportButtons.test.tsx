import { render, screen } from "@testing-library/react";
import { SessionProvider } from "@/hooks/useAuth";
import type { SessionUser } from "@/lib/auth/session";
import { ExportButtons } from "../ExportButtons";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), replace: jest.fn() }),
}));

const adminSession: SessionUser = {
  id: "u-1",
  firstName: "Ada",
  lastName: "Admin",
  email: "ada@example.com",
  role: "admin",
};

const supportSession: SessionUser = { ...adminSession, role: "customer_support" };

function renderWith(session: SessionUser, query: Record<string, string> = {}) {
  return render(
    <SessionProvider user={session}>
      <ExportButtons slug="loan-portfolio" query={query} />
    </SessionProvider>,
  );
}

describe("ExportButtons", () => {
  it("renders CSV and Excel links pointing at the API with format set", () => {
    renderWith(adminSession, { from: "2026-01-01", to: "2026-01-31" });

    const csv = screen.getByRole("link", { name: /csv/i });
    const xlsx = screen.getByRole("link", { name: /excel/i });
    expect(csv).toHaveAttribute("download");
    expect(xlsx).toHaveAttribute("download");
    expect(csv.getAttribute("href")).toMatch(/\/reports\/loan-portfolio\?.*format=csv/);
    expect(csv.getAttribute("href")).toContain("from=2026-01-01");
    expect(xlsx.getAttribute("href")).toMatch(/\/reports\/loan-portfolio\?.*format=xlsx/);
  });

  it("renders nothing for customer_support (read but no export)", () => {
    const { container } = renderWith(supportSession);
    expect(container.firstChild).toBeNull();
  });
});
