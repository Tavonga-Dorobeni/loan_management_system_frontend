import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/tests/msw/server";
import { KycUploadDialog } from "../KycUploadDialog";

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

function renderDialog() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <KycUploadDialog borrowerId="b-1" documentType="payslip" />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  toastSuccess.mockReset();
  toastError.mockReset();
});

describe("KycUploadDialog", () => {
  it("uploads a valid PDF and toasts success", async () => {
    const apiCalled = jest.fn();
    server.use(
      http.post(`${BASE}/borrower-kyc/upload`, () => {
        apiCalled();
        return HttpResponse.json({
          success: true,
          data: {
            id: "k-new",
            borrowerId: "b-1",
            documentType: "payslip",
            signedUrl: "https://signed.example/k-new",
            createdAt: new Date().toISOString(),
          },
        });
      }),
    );

    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole("button", { name: /^upload$/i }));

    const dialog = await screen.findByRole("dialog");
    const fileInput = within(dialog).getByLabelText(/file/i) as HTMLInputElement;
    const file = new File(["%PDF-1.4 fake"], "payslip.pdf", { type: "application/pdf" });
    await user.upload(fileInput, file);
    await user.click(within(dialog).getByRole("button", { name: /upload file/i }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Payslip uploaded"));
    expect(apiCalled).toHaveBeenCalled();
  });

  it("rejects an unsupported MIME type without calling the API", async () => {
    const apiCalled = jest.fn();
    server.use(
      http.post(`${BASE}/borrower-kyc/upload`, () => {
        apiCalled();
        return HttpResponse.json({ success: true, data: {} });
      }),
    );

    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole("button", { name: /^upload$/i }));

    const dialog = await screen.findByRole("dialog");
    const fileInput = within(dialog).getByLabelText(/file/i) as HTMLInputElement;
    const bad = new File(["bad"], "evil.exe", { type: "application/octet-stream" });
    // userEvent.upload silently rejects files that don't match the input's
    // `accept` attribute, so use fireEvent.change to bypass that filter and
    // exercise the component's own MIME check.
    fireEvent.change(fileInput, { target: { files: [bad] } });
    await user.click(within(dialog).getByRole("button", { name: /upload file/i }));

    expect(await screen.findByText(/unsupported file type/i)).toBeInTheDocument();
    expect(apiCalled).not.toHaveBeenCalled();
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("rejects oversize files without calling the API", async () => {
    const apiCalled = jest.fn();
    server.use(
      http.post(`${BASE}/borrower-kyc/upload`, () => {
        apiCalled();
        return HttpResponse.json({ success: true, data: {} });
      }),
    );

    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole("button", { name: /^upload$/i }));

    const dialog = await screen.findByRole("dialog");
    const fileInput = within(dialog).getByLabelText(/file/i) as HTMLInputElement;
    // 11 MB pdf
    const big = new File([new Uint8Array(11 * 1024 * 1024)], "huge.pdf", {
      type: "application/pdf",
    });
    await user.upload(fileInput, big);
    await user.click(within(dialog).getByRole("button", { name: /upload file/i }));

    expect(await screen.findByText(/exceeds 10 mb/i)).toBeInTheDocument();
    expect(apiCalled).not.toHaveBeenCalled();
  });

  it("surfaces a server error via toast", async () => {
    server.use(
      http.post(`${BASE}/borrower-kyc/upload`, () =>
        HttpResponse.json(
          { success: false, error: "Storage unavailable", statusCode: 500 },
          { status: 500 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderDialog();
    await user.click(screen.getByRole("button", { name: /^upload$/i }));

    const dialog = await screen.findByRole("dialog");
    const fileInput = within(dialog).getByLabelText(/file/i) as HTMLInputElement;
    const file = new File(["%PDF-1.4 fake"], "ok.pdf", { type: "application/pdf" });
    await user.upload(fileInput, file);
    await user.click(within(dialog).getByRole("button", { name: /upload file/i }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Storage unavailable"));
    expect(toastSuccess).not.toHaveBeenCalled();
  });
});
