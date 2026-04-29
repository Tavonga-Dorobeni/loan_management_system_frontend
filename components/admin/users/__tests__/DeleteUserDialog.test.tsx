import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/msw/server";
import { DeleteUserDialog } from "../DeleteUserDialog";

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

beforeEach(() => {
  push.mockReset();
  refresh.mockReset();
  toastSuccess.mockReset();
  toastError.mockReset();
});

describe("DeleteUserDialog", () => {
  it("calls DELETE and redirects after confirmation", async () => {
    let called = false;
    server.use(
      http.delete(`${BASE}/users/u-9`, () => {
        called = true;
        return HttpResponse.json({ success: true, data: { id: "u-9" } });
      }),
    );

    const user = userEvent.setup();
    render(<DeleteUserDialog userId="u-9" userLabel="Lou Officer" />);

    await user.click(screen.getByRole("button", { name: /delete user/i }));
    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/admin/users"));
    expect(called).toBe(true);
    expect(toastSuccess).toHaveBeenCalledWith("Deleted Lou Officer");
  });

  it("surfaces a toast on server error and does not redirect", async () => {
    server.use(
      http.delete(`${BASE}/users/u-9`, () =>
        HttpResponse.json(
          { success: false, error: "User has open loans", statusCode: 409 },
          { status: 409 },
        ),
      ),
    );

    const user = userEvent.setup();
    render(<DeleteUserDialog userId="u-9" userLabel="Lou Officer" />);

    await user.click(screen.getByRole("button", { name: /delete user/i }));
    await user.click(screen.getByRole("button", { name: /^delete$/i }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("User has open loans"));
    expect(push).not.toHaveBeenCalled();
  });
});
