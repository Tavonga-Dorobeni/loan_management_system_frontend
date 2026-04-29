import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/msw/server";
import { LoanForm } from "../LoanForm";

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

const seedLoan = {
  id: "l-1",
  borrowerId: "b-1",
  referenceNumber: "REF-1001",
  type: "PERSONAL",
  status: "PENDING",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  disbursementDate: null,
  repaymentAmount: 250,
  totalAmount: 3000,
  amountPaid: null,
  amountDue: null,
  message: null,
};

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
});

describe("LoanForm — edit-status-only", () => {
  it("renders only status + message fields and submits a status patch", async () => {
    let captured: unknown = null;
    server.use(
      http.put(`${BASE}/loans/l-1`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({
          success: true,
          data: { ...seedLoan, status: "SUCCESS" },
        });
      }),
    );

    const user = userEvent.setup();
    render(<LoanForm mode="edit-status-only" loan={seedLoan} />);

    expect(screen.queryByLabelText(/reference number/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/start date/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/status/i), "SUCCESS");
    await user.type(screen.getByLabelText(/message/i), "Approved by analyst");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/loans/l-1"));
    expect(captured).toEqual({ status: "SUCCESS", message: "Approved by analyst" });
  });
});

describe("LoanForm — edit (full)", () => {
  it("prefills the identity fields and renders the full term controls", () => {
    render(<LoanForm mode="edit" loan={seedLoan} />);

    expect(screen.getByLabelText(/reference number/i)).toHaveValue("REF-1001");
    expect(screen.getByLabelText(/start date/i)).toHaveValue("2026-01-01");
    expect(screen.getByLabelText(/end date/i)).toHaveValue("2026-12-31");
    expect(screen.getByLabelText(/repayment amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total amount/i)).toBeInTheDocument();
    // Borrower ID is preserved in edit mode but locked.
    expect(screen.getByLabelText(/borrower id/i)).toHaveAttribute("readonly");
  });
});
