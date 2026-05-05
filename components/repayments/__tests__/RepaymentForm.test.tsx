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

const SCHEDULE_3_SLOTS = [
  { year: 2026, month: 1, status: "COVERED", cumulativeReceived: 250, expected: 250 },
  { year: 2026, month: 2, status: "PARTIAL", cumulativeReceived: 100, expected: 250 },
  { year: 2026, month: 3, status: "UNCOVERED", cumulativeReceived: 0, expected: 250 },
];

function mockSchedule(slots: typeof SCHEDULE_3_SLOTS = SCHEDULE_3_SLOTS) {
  server.use(
    http.get(`${BASE}/loans/:id/schedule`, () =>
      HttpResponse.json({ success: true, data: slots }),
    ),
  );
}

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
  it("defaults the period to the lowest non-covered slot and submits with period fields", async () => {
    mockSchedule();
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
            periodYear: 2026,
            periodMonth: 2,
          },
        });
      }),
    );

    const user = userEvent.setup();
    const { onCompleted } = renderForm();

    // Period dropdown should resolve to Feb 2026 (the lowest non-COVERED slot).
    await waitFor(() =>
      expect((screen.getByLabelText(/period/i) as HTMLSelectElement).value).toBe(
        "2026-02",
      ),
    );

    const amount = screen.getByLabelText(/amount/i);
    await user.clear(amount);
    await user.type(amount, "250");
    await user.click(screen.getByRole("button", { name: /record repayment/i }));

    await waitFor(() =>
      expect(toastSuccess).toHaveBeenCalledWith("Repayment recorded (CORRECT)"),
    );
    expect(captured).toMatchObject({
      loanId: "l-1",
      amount: 250,
      periodYear: 2026,
      periodMonth: 2,
    });
    expect(onCompleted).toHaveBeenCalled();
  });

  it("disables already-covered slots in the Period select", async () => {
    mockSchedule();
    renderForm();

    const select = (await screen.findByLabelText(/period/i)) as HTMLSelectElement;
    // Wait for slots to populate.
    await waitFor(() =>
      expect(select.querySelector('option[value="2026-01"]')).not.toBeNull(),
    );

    const jan = select.querySelector(
      'option[value="2026-01"]',
    ) as HTMLOptionElement;
    const feb = select.querySelector(
      'option[value="2026-02"]',
    ) as HTMLOptionElement;
    const mar = select.querySelector(
      'option[value="2026-03"]',
    ) as HTMLOptionElement;

    expect(jan.disabled).toBe(true);
    expect(feb.disabled).toBe(false);
    expect(mar.disabled).toBe(false);
  });

  it("maps a 422 fieldError back to the form", async () => {
    mockSchedule();
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
    await screen.findByLabelText(/period/i);
    await waitFor(() =>
      expect((screen.getByLabelText(/period/i) as HTMLSelectElement).value).toBe(
        "2026-02",
      ),
    );

    const amount = screen.getByLabelText(/amount/i);
    await user.clear(amount);
    await user.type(amount, "100");
    await user.click(screen.getByRole("button", { name: /record repayment/i }));

    expect(await screen.findByText(/amount must be positive/i)).toBeInTheDocument();
    expect(toastError).not.toHaveBeenCalled();
  });
});
