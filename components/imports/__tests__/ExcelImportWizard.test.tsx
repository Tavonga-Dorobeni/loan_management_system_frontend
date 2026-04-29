import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/msw/server";
import { ExcelImportWizard } from "../ExcelImportWizard";

const toastSuccess = jest.fn();
const toastWarning = jest.fn();
const toastError = jest.fn();
const toastImportSummary = jest.fn();
jest.mock("@/components/toasts", () => ({
  toast: {
    error: (...args: unknown[]) => toastError(...args),
    success: (...args: unknown[]) => toastSuccess(...args),
    warning: (...args: unknown[]) => toastWarning(...args),
  },
  toastApiError: (e: unknown) => toastError(e instanceof Error ? e.message : String(e)),
  toastImportSummary: (s: unknown) => toastImportSummary(s),
}));

const BASE = "http://localhost:3000/api/v1";

beforeEach(() => {
  toastSuccess.mockReset();
  toastWarning.mockReset();
  toastError.mockReset();
  toastImportSummary.mockReset();
});

describe("ExcelImportWizard", () => {
  it("happy path: posts the file and renders the success summary", async () => {
    const apiCalled = jest.fn();
    server.use(
      http.post(`${BASE}/loans/import/excel`, () => {
        apiCalled();
        return HttpResponse.json({
          success: true,
          data: {
            totalRows: 5,
            successCount: 5,
            failureCount: 0,
            failedRows: [],
          },
        });
      }),
    );

    const user = userEvent.setup();
    render(
      <ExcelImportWizard
        kind="intake"
        title="Loan intake"
        description="Upload an .xlsx file."
      />,
    );

    const fileInput = screen.getByLabelText(/excel file/i) as HTMLInputElement;
    const file = new File(["fake"], "intake.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await user.click(screen.getByRole("button", { name: /process file/i }));

    await waitFor(() => expect(apiCalled).toHaveBeenCalled());
    expect(await screen.findByText(/all rows processed/i)).toBeInTheDocument();
    // Total + Succeeded both render "5"; assert via the labelled stats container.
    expect(screen.getAllByText("5").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("0")).toBeInTheDocument(); // Failed
    expect(toastImportSummary).toHaveBeenCalledWith(
      expect.objectContaining({ totalRows: 5, successCount: 5, failureCount: 0 }),
    );
  });

  it("renders failed-row table when partial failures occur", async () => {
    server.use(
      http.post(`${BASE}/loans/import/repayments/excel`, () =>
        HttpResponse.json({
          success: true,
          data: {
            totalRows: 3,
            successCount: 2,
            failureCount: 1,
            failedRows: [
              { rowNumber: 7, reference: "REF-X", error: "Loan not found" },
            ],
          },
        }),
      ),
    );

    const user = userEvent.setup();
    render(
      <ExcelImportWizard
        kind="repayments"
        title="Repayments"
        description="Upload an .xlsx file."
      />,
    );

    const fileInput = screen.getByLabelText(/excel file/i) as HTMLInputElement;
    const file = new File(["fake"], "rep.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await user.click(screen.getByRole("button", { name: /process file/i }));

    expect(await screen.findByText(/some rows failed/i)).toBeInTheDocument();
    expect(screen.getByText("REF-X")).toBeInTheDocument();
    expect(screen.getByText("Loan not found")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(toastImportSummary).toHaveBeenCalledWith(
      expect.objectContaining({ failureCount: 1 }),
    );
  });

  it("rejects non-xlsx files without calling the API", async () => {
    const apiCalled = jest.fn();
    server.use(
      http.post(`${BASE}/loans/import/excel`, () => {
        apiCalled();
        return HttpResponse.json({ success: true, data: {} });
      }),
    );

    const user = userEvent.setup();
    render(
      <ExcelImportWizard
        kind="intake"
        title="Loan intake"
        description="Upload an .xlsx file."
      />,
    );

    const fileInput = screen.getByLabelText(/excel file/i) as HTMLInputElement;
    const bad = new File(["fake"], "data.csv", { type: "text/csv" });
    fireEvent.change(fileInput, { target: { files: [bad] } });
    await user.click(screen.getByRole("button", { name: /process file/i }));

    expect(await screen.findByText(/only \.xlsx files/i)).toBeInTheDocument();
    expect(apiCalled).not.toHaveBeenCalled();
  });

  it("falls back to the upload step when the API fails", async () => {
    server.use(
      http.post(`${BASE}/loans/import/excel`, () =>
        HttpResponse.json(
          { success: false, error: "Server error", statusCode: 500 },
          { status: 500 },
        ),
      ),
    );

    const user = userEvent.setup();
    render(
      <ExcelImportWizard
        kind="intake"
        title="Loan intake"
        description="Upload an .xlsx file."
      />,
    );

    const fileInput = screen.getByLabelText(/excel file/i) as HTMLInputElement;
    const file = new File(["fake"], "intake.xlsx", {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    fireEvent.change(fileInput, { target: { files: [file] } });
    await user.click(screen.getByRole("button", { name: /process file/i }));

    await waitFor(() => expect(toastError).toHaveBeenCalledWith("Server error"));
    // Wizard returned to the upload step — Process file button is back.
    expect(screen.getByRole("button", { name: /process file/i })).toBeInTheDocument();
  });
});
