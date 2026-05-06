import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { WriteOffLoanDialog } from "../WriteOffLoanDialog";

const push = jest.fn();
const refresh = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh, replace: jest.fn() }),
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

function renderDialog(loanId: string | number = "loan-42") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <WriteOffLoanDialog loanId={loanId} loanLabel="Loan REF-042" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
});

describe("WriteOffLoanDialog", () => {
  it("posts status WRITE-OFF and the reason as message on submit", async () => {
    let captured: { status?: string; message?: string } | null = null;
    server.use(
      http.put(`${BASE}/loans/:id`, async ({ request }) => {
        captured = (await request.json()) as { status?: string; message?: string };
        return HttpResponse.json({
          success: true,
          data: {
            id: "loan-42",
            referenceNumber: "REF-042",
            status: "WRITE-OFF",
            message: captured.message,
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /write off loan/i }));
    const textarea = await screen.findByLabelText("Reason");
    await user.type(textarea, "Borrower deceased; estate has no assets to recover.");

    await user.click(screen.getByRole("button", { name: /^write off$/i }));

    await waitFor(() => expect(captured).not.toBeNull());
    expect(captured).toEqual({
      status: "WRITE-OFF",
      message: "Borrower deceased; estate has no assets to recover.",
    });
    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Wrote off Loan REF-042"));
    expect(push).toHaveBeenCalledWith("/loans");
  });

  it("blocks submission when reason is too short and shows an inline error", async () => {
    let called = false;
    server.use(
      http.put(`${BASE}/loans/:id`, () => {
        called = true;
        return HttpResponse.json({ success: true, data: {} });
      }),
    );

    const user = userEvent.setup();
    renderDialog();

    await user.click(screen.getByRole("button", { name: /write off loan/i }));
    await user.type(await screen.findByLabelText("Reason"), "too short");
    await user.click(screen.getByRole("button", { name: /^write off$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 10 characters/i);
    expect(called).toBe(false);
    expect(push).not.toHaveBeenCalled();
  });
});
