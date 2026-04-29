import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { RepaymentForm } from "../RepaymentForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn(), replace: jest.fn() }),
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

function renderForm(loanId: string | number = "l-1", lockLoanId = true, onCompleted = jest.fn()) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    onCompleted,
    ...render(
      <QueryClientProvider client={client}>
        <RepaymentForm
          mode="create"
          loanId={loanId}
          lockLoanId={lockLoanId}
          onCompleted={onCompleted}
        />
      </QueryClientProvider>,
    ),
  };
}

beforeEach(() => {
  toastSuccess.mockReset();
  toastError.mockReset();
});

describe("RepaymentForm — create", () => {
  it("submits a repayment and toasts the derived status", async () => {
    let captured: unknown = null;
    server.use(
      http.post(`${BASE}/repayments`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({
          success: true,
          data: {
            id: "r-1",
            loanId: "l-1",
            amount: 250,
            transactionDate: "2026-04-29",
            status: "CORRECT",
          },
        });
      }),
    );

    const user = userEvent.setup();
    const { onCompleted } = renderForm();

    expect(screen.getByLabelText(/loan id/i)).toHaveAttribute("readonly");
    const amount = screen.getByLabelText(/amount/i);
    await user.clear(amount);
    await user.type(amount, "250");
    await user.click(screen.getByRole("button", { name: /record repayment/i }));

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith("Repayment recorded (CORRECT)"),
    );
    expect(captured).toMatchObject({ loanId: "l-1", amount: 250 });
    expect(onCompleted).toHaveBeenCalled();
  });

  it("maps a 422 fieldError back to the form", async () => {
    server.use(
      http.post(`${BASE}/repayments`, () =>
        HttpResponse.json(
          {
            success: false,
            error: "Validation failed",
            statusCode: 422,
            fieldErrors: { amount: "Amount must be positive" },
          },
          { status: 422 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderForm();
    const amount = screen.getByLabelText(/amount/i);
    await user.clear(amount);
    await user.type(amount, "100");
    await user.click(screen.getByRole("button", { name: /record repayment/i }));

    expect(await screen.findByText(/amount must be positive/i)).toBeInTheDocument();
    expect(toastError).not.toHaveBeenCalled();
  });
});
