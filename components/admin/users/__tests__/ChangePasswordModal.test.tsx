import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/msw/server";
import { ChangePasswordModal } from "../ChangePasswordModal";

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
  toastSuccess.mockReset();
  toastError.mockReset();
});

describe("ChangePasswordModal", () => {
  it("submits self-service change with current + new password", async () => {
    let captured: unknown = null;
    server.use(
      http.post(`${BASE}/users/u-1/change-password`, async ({ request }) => {
        captured = await request.json();
        return HttpResponse.json({ success: true, data: { changed: true } });
      }),
    );

    const user = userEvent.setup();
    render(<ChangePasswordModal userId="u-1" isSelf />);

    await user.click(screen.getByRole("button", { name: /change password/i }));

    await user.type(screen.getByLabelText(/current password/i), "oldpassword");
    await user.type(screen.getByLabelText(/^new password$/i), "newpassword1");
    await user.type(screen.getByLabelText(/confirm new password/i), "newpassword1");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Password updated"));
    expect(captured).toEqual({
      currentPassword: "oldpassword",
      newPassword: "newpassword1",
    });
  });

  it("blocks submission when new and confirm passwords do not match", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordModal userId="u-1" isSelf />);

    await user.click(screen.getByRole("button", { name: /change password/i }));
    await user.type(screen.getByLabelText(/current password/i), "oldpassword");
    await user.type(screen.getByLabelText(/^new password$/i), "newpassword1");
    await user.type(screen.getByLabelText(/confirm new password/i), "different1");
    await user.click(screen.getByRole("button", { name: /update password/i }));

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("hides the current-password field when admin changes another user's password", async () => {
    const user = userEvent.setup();
    render(<ChangePasswordModal userId="u-2" isSelf={false} />);

    await user.click(screen.getByRole("button", { name: /change password/i }));
    expect(screen.queryByLabelText(/current password/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
  });
});
