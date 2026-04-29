import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/msw/server";
import { LoginForm } from "../LoginForm";

const replace = jest.fn();
const refresh = jest.fn();
const get = jest.fn<string | null, [string]>(() => null);

jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace, refresh, push: jest.fn() }),
  useSearchParams: () => ({ get }),
}));

const toastError = jest.fn();
jest.mock("@/components/toasts", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: jest.fn(),
    warning: jest.fn(),
  },
}));

const LOGIN_PATH = "http://localhost/api/auth/login";

beforeEach(() => {
  replace.mockReset();
  refresh.mockReset();
  get.mockReset();
  get.mockReturnValue(null);
  toastError.mockReset();
});

describe("LoginForm", () => {
  it("renders email and password fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeEnabled();
  });

  it("shows validation errors when submitting empty fields", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    const alerts = await screen.findAllByRole("alert");
    expect(alerts.length).toBeGreaterThanOrEqual(2);
    expect(replace).not.toHaveBeenCalled();
  });

  it("shows validation error for short password", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "user@example.com");
    await user.type(screen.getByLabelText(/password/i), "short");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("redirects to /dashboard on successful login", async () => {
    server.use(
      http.post(LOGIN_PATH, () =>
        HttpResponse.json({ success: true, data: { user: { id: 1, role: "admin" } } }),
      ),
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "admin@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
    expect(refresh).toHaveBeenCalled();
  });

  it("honors the ?next= query parameter on successful login", async () => {
    get.mockImplementation((key: string) => (key === "next" ? "/borrowers" : null));
    server.use(
      http.post(LOGIN_PATH, () =>
        HttpResponse.json({ success: true, data: { user: { id: 1, role: "admin" } } }),
      ),
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "admin@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/borrowers"));
  });

  it("ignores unsafe ?next= values and falls back to /dashboard", async () => {
    get.mockImplementation((key: string) =>
      key === "next" ? "https://evil.example/steal" : null,
    );
    server.use(
      http.post(LOGIN_PATH, () =>
        HttpResponse.json({ success: true, data: { user: { id: 1, role: "admin" } } }),
      ),
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "admin@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"));
  });

  it("shows an error toast when credentials are rejected", async () => {
    server.use(
      http.post(LOGIN_PATH, () =>
        HttpResponse.json(
          { success: false, error: "Invalid credentials", statusCode: 401 },
          { status: 401 },
        ),
      ),
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "admin@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrongpass1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Invalid credentials"));
    expect(replace).not.toHaveBeenCalled();
  });

  it("maps 422 fieldErrors back to the form inputs", async () => {
    server.use(
      http.post(LOGIN_PATH, () =>
        HttpResponse.json(
          {
            success: false,
            error: "Validation failed",
            statusCode: 422,
            fieldErrors: { password: "Password is too weak" },
          },
          { status: 422 },
        ),
      ),
    );

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), "admin@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/password is too weak/i)).toBeInTheDocument();
    expect(toastError).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });
});
