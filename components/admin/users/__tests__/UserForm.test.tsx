import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/msw/server";
import { UserForm } from "../UserForm";

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

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  toastError.mockReset();
  toastSuccess.mockReset();
});

describe("UserForm — create", () => {
  it("submits a new user and redirects to the list", async () => {
    let captured: unknown = null;
    server.use(
      http.post(`${BASE}/users`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({
          success: true,
          data: {
            id: "u-new",
            firstName: "New",
            lastName: "User",
            email: "new@example.com",
            role: "loan_officer",
            status: "active",
          },
        });
      }),
    );

    const user = userEvent.setup();
    render(<UserForm mode="create" />);

    await user.type(screen.getByLabelText(/first name/i), "New");
    await user.type(screen.getByLabelText(/last name/i), "User");
    await user.type(screen.getByLabelText(/email/i), "new@example.com");
    await user.type(screen.getByLabelText(/temporary password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/users"));
    expect(toastSuccess).toHaveBeenCalledWith("User created");
    expect(captured).toMatchObject({
      firstName: "New",
      lastName: "User",
      email: "new@example.com",
      role: "loan_officer",
      password: "password123",
    });
  });

  it("maps 422 fieldErrors back to the form", async () => {
    server.use(
      http.post(`${BASE}/users`, () =>
        HttpResponse.json(
          {
            success: false,
            error: "Validation failed",
            statusCode: 422,
            fieldErrors: { email: "Email already in use" },
          },
          { status: 422 },
        ),
      ),
    );

    const user = userEvent.setup();
    render(<UserForm mode="create" />);

    await user.type(screen.getByLabelText(/first name/i), "Dup");
    await user.type(screen.getByLabelText(/last name/i), "Licate");
    await user.type(screen.getByLabelText(/email/i), "dup@example.com");
    await user.type(screen.getByLabelText(/temporary password/i), "password123");
    await user.click(screen.getByRole("button", { name: /create user/i }));

    expect(await screen.findByText(/email already in use/i)).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    expect(toastError).not.toHaveBeenCalled();
  });
});

describe("UserForm — edit", () => {
  const existing = {
    id: "u-1",
    firstName: "Lou",
    lastName: "Officer",
    email: "lou@example.com",
    role: "loan_officer" as const,
    status: "active" as const,
  };

  it("prefills inputs and submits an update", async () => {
    let captured: unknown = null;
    server.use(
      http.put(`${BASE}/users/u-1`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ success: true, data: existing });
      }),
    );

    const user = userEvent.setup();
    render(<UserForm mode="edit" user={existing} />);

    expect(screen.getByLabelText(/first name/i)).toHaveValue("Lou");
    expect(screen.getByLabelText(/email/i)).toHaveValue("lou@example.com");
    expect(screen.queryByLabelText(/temporary password/i)).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText(/first name/i));
    await user.type(screen.getByLabelText(/first name/i), "Louise");
    await user.selectOptions(screen.getByLabelText(/status/i), "disabled");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/users"));
    expect(toastSuccess).toHaveBeenCalledWith("User updated");
    expect(captured).toMatchObject({ firstName: "Louise", status: "disabled" });
  });
});
