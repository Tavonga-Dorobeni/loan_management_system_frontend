import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/msw/server";
import { BorrowerForm } from "../BorrowerForm";

const push = jest.fn();
const refresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh, replace: jest.fn() }),
}));

const toastError = jest.fn();
const toastSuccess = jest.fn();
jest.mock("@/components/toasts", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
    warning: jest.fn(),
  },
  toastApiError: (e: unknown) => toastError(e instanceof Error ? e.message : String(e)),
}));

const BASE = "http://localhost:3000/api/v1";

const seedBorrower = {
  id: "b-1",
  firstName: "Jane",
  lastName: "Doe",
  ecNumber: "EC-100",
  idNumber: "ID-500",
  phoneNumber: "+15555550100",
  email: "jane@example.com",
};

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  toastError.mockReset();
  toastSuccess.mockReset();
});

describe("BorrowerForm — create", () => {
  it("submits a new borrower and redirects to the detail page", async () => {
    let captured: unknown = null;
    server.use(
      http.post(`${BASE}/borrowers`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ success: true, data: { ...seedBorrower, id: "b-new" } });
      }),
    );

    const user = userEvent.setup();
    render(<BorrowerForm mode="create" />);

    await user.type(screen.getByLabelText(/first name/i), "Jane");
    await user.type(screen.getByLabelText(/last name/i), "Doe");
    await user.type(screen.getByLabelText(/ec number/i), "EC-100");
    await user.type(screen.getByLabelText(/id number/i), "ID-500");
    await user.click(screen.getByRole("button", { name: /create borrower/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/borrowers/b-new"));
    expect(toastSuccess).toHaveBeenCalledWith("Borrower created");
    expect(captured).toMatchObject({
      firstName: "Jane",
      lastName: "Doe",
      ecNumber: "EC-100",
      idNumber: "ID-500",
      phoneNumber: null,
      email: null,
    });
  });

  it("maps a 409 conflict to a fieldError", async () => {
    server.use(
      http.post(`${BASE}/borrowers`, () =>
        HttpResponse.json(
          {
            success: false,
            error: "EC number already exists",
            statusCode: 409,
            fieldErrors: { ecNumber: "EC number already exists" },
          },
          { status: 409 },
        ),
      ),
    );

    const user = userEvent.setup();
    render(<BorrowerForm mode="create" />);

    await user.type(screen.getByLabelText(/first name/i), "Dup");
    await user.type(screen.getByLabelText(/last name/i), "Licate");
    await user.type(screen.getByLabelText(/ec number/i), "EC-100");
    await user.type(screen.getByLabelText(/id number/i), "ID-500");
    await user.click(screen.getByRole("button", { name: /create borrower/i }));

    expect(await screen.findByText(/ec number already exists/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });
});

describe("BorrowerForm — edit-contact-only (customer_support)", () => {
  it("renders only contact fields and submits a contact update", async () => {
    let captured: unknown = null;
    server.use(
      http.put(`${BASE}/borrowers/b-1`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ success: true, data: seedBorrower });
      }),
    );

    const user = userEvent.setup();
    render(<BorrowerForm mode="edit-contact-only" borrower={seedBorrower} />);

    expect(screen.queryByLabelText(/first name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/ec number/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

    const phone = screen.getByLabelText(/phone number/i);
    await user.clear(phone);
    await user.type(phone, "+15555550199");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/borrowers/b-1"));
    expect(captured).toMatchObject({ phoneNumber: "+15555550199" });
    expect(captured).not.toHaveProperty("firstName");
  });
});
