import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { EarlyMaturityDialog } from "../EarlyMaturityDialog";

const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh, replace: jest.fn() }),
}));

const toastSuccess = jest.fn();
const toastError = jest.fn();
jest.mock("@/components/toasts", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
    warning: jest.fn(),
  },
  toastApiError: (e: unknown) => toastError(e instanceof Error ? e.message : String(e)),
}));

const BASE = "http://localhost:3000/api/v1";

function renderDialog(amountDue = 1500, loanId: string | number = "loan-7") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <EarlyMaturityDialog
        loanId={loanId}
        loanLabel="Loan REF-007"
        amountDue={amountDue}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  refresh.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
});

describe("EarlyMaturityDialog", () => {
  it("renders the Expected Amount as read-only formatted currency", async () => {
    const user = userEvent.setup();
    renderDialog(1500);
    await user.click(screen.getByRole("button", { name: /early maturity/i }));

    const expected = (await screen.findByLabelText("Expected Amount")) as HTMLInputElement;
    expect(expected).toHaveValue("$1,500.00");
    expect(expected.readOnly).toBe(true);
  });

  it("POSTs to /loans/:id/early-maturity with { maturityDate } on confirm", async () => {
    let captured: { maturityDate?: string } | null = null;
    let url: string | null = null;
    server.use(
      http.post(`${BASE}/loans/:id/early-maturity`, async ({ request }) => {
        url = request.url;
        captured = (await request.json()) as { maturityDate?: string };
        return HttpResponse.json({
          success: true,
          data: { id: "loan-7", referenceNumber: "REF-007" },
        });
      }),
    );

    const user = userEvent.setup();
    renderDialog(2_500);

    await user.click(screen.getByRole("button", { name: /early maturity/i }));
    const dateInput = (await screen.findByLabelText("Maturity Date")) as HTMLInputElement;
    await user.type(dateInput, "2027-03-15");

    await user.click(screen.getByRole("button", { name: /^confirm$/i }));

    await waitFor(() => expect(captured).not.toBeNull());
    expect(url).toContain("/loans/loan-7/early-maturity");
    expect(captured).toEqual({ maturityDate: "2027-03-15" });
    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith("Early maturity recorded for Loan REF-007"),
    );
    expect(refresh).toHaveBeenCalled();
  });

  it("blocks submit and shows an inline error when no maturity date is provided", async () => {
    let called = false;
    server.use(
      http.post(`${BASE}/loans/:id/early-maturity`, () => {
        called = true;
        return HttpResponse.json({ success: true, data: {} });
      }),
    );

    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /early maturity/i }));
    await user.click(screen.getByRole("button", { name: /^confirm$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/maturity date is required/i);
    expect(called).toBe(false);
  });
});
