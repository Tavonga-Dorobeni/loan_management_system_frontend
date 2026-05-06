import { http, HttpResponse } from "msw";
import { env } from "@/lib/env";

const BASE = env.NEXT_PUBLIC_API_BASE_URL;

const ok = <T>(data: T, message?: string) =>
  HttpResponse.json({ success: true, data, ...(message ? { message } : {}) });

const err = (status: number, error: string) =>
  HttpResponse.json({ success: false, error, statusCode: status }, { status });

const list = <T>(items: T[], page = 1, pageSize = 20) =>
  ok({
    items,
    pagination: {
      page,
      pageSize,
      totalItems: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
    },
  });

const seedUser = {
  id: "u-admin",
  firstName: "Ada",
  lastName: "Admin",
  email: "admin@example.com",
  role: "admin" as const,
  status: "active" as const,
};

const seedBorrower = {
  id: "b-001",
  firstName: "Jane",
  lastName: "Doe",
  ecNumber: "EC-1001",
  idNumber: "ID-500001",
  phoneNumber: "+15555550100",
  email: "jane@example.com",
};

const seedLoan = {
  id: "l-001",
  borrowerId: seedBorrower.id,
  referenceNumber: "REF-1001",
  type: "PERSONAL",
  status: "SUCCESS",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  disbursementDate: "2026-01-05",
  repaymentAmount: 250,
  totalAmount: 3000,
  amountPaid: 500,
  amountDue: 2500,
  message: null,
};

export const handlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json().catch(() => null)) as
      | { email?: string; password?: string }
      | null;
    if (!body?.email || !body.password) return err(422, "Email and password required");
    if (body.password === "wrong") return err(401, "Invalid credentials");
    return ok({ user: seedUser, token: "mock.jwt.token" });
  }),

  http.post(`${BASE}/auth/register`, () => ok({ user: seedUser }, "User registered"), { once: false }),

  http.get(`${BASE}/users`, () => list([seedUser])),
  http.post(`${BASE}/users`, () => ok(seedUser)),
  http.get(`${BASE}/users/:id`, () => ok(seedUser)),
  http.put(`${BASE}/users/:id`, () => ok(seedUser)),
  http.delete(`${BASE}/users/:id`, () => ok({ id: "u-admin" })),
  http.post(`${BASE}/users/:id/change-password`, () => ok({ changed: true })),

  http.get(`${BASE}/borrowers`, () => list([seedBorrower])),
  http.post(`${BASE}/borrowers`, () => ok(seedBorrower)),
  http.get(`${BASE}/borrowers/:id`, () => ok(seedBorrower)),
  http.put(`${BASE}/borrowers/:id`, () => ok(seedBorrower)),
  http.delete(`${BASE}/borrowers/:id`, () => ok({ id: seedBorrower.id })),

  http.get(`${BASE}/borrowers/:id/profile`, () =>
    ok({
      borrower: seedBorrower,
      kyc: [
        { documentType: "payslip", present: true },
        { documentType: "national_id", present: true },
        { documentType: "passport_sized_photo", present: false },
        { documentType: "application_form", present: false },
      ],
      loanSummary: { count: 1, activeCount: 1, outstandingDue: 2500 },
    }),
  ),
  http.get(`${BASE}/borrowers/:id/loans`, () => list([seedLoan])),

  http.post(`${BASE}/borrower-kyc/upload`, () =>
    ok({ id: "kyc-1", storageKey: "kyc/b-001/payslip/uuid.pdf" }),
  ),
  http.get(`${BASE}/borrower-kyc/borrower/:id`, () =>
    list([
      {
        id: "kyc-1",
        borrowerId: seedBorrower.id,
        documentType: "payslip",
        storageKey: "kyc/b-001/payslip/uuid.pdf",
        signedUrl: "https://signed.example/kyc-1",
        expiresAt: new Date(Date.now() + 900_000).toISOString(),
        createdAt: new Date().toISOString(),
      },
    ]),
  ),

  http.get(`${BASE}/loans`, () => list([seedLoan])),
  http.post(`${BASE}/loans`, () => ok(seedLoan)),
  http.get(`${BASE}/loans/:id`, () => ok(seedLoan)),
  http.put(`${BASE}/loans/:id`, () => ok(seedLoan)),
  http.delete(`${BASE}/loans/:id`, () => ok({ id: seedLoan.id })),
  http.get(`${BASE}/loans/:id/details`, () =>
    ok({
      loan: seedLoan,
      borrower: seedBorrower,
      balance: { amountPaid: 500, amountDue: 2500, repaymentAmount: 250 },
    }),
  ),
  http.get(`${BASE}/loans/:id/repayments`, () => list([])),

  http.get(`${BASE}/repayments`, () => list([])),
  http.post(`${BASE}/repayments`, () =>
    ok({
      id: "r-1",
      loanId: seedLoan.id,
      amount: 250,
      transactionDate: new Date().toISOString().slice(0, 10),
      status: "CORRECT",
    }),
  ),
  http.get(`${BASE}/repayments/:id`, () =>
    ok({
      id: "r-1",
      loanId: seedLoan.id,
      amount: 250,
      transactionDate: "2026-04-01",
      status: "CORRECT",
    }),
  ),
  http.put(`${BASE}/repayments/:id`, () =>
    ok({
      id: "r-1",
      loanId: seedLoan.id,
      amount: 250,
      transactionDate: "2026-04-01",
      status: "CORRECT",
    }),
  ),
  http.delete(`${BASE}/repayments/:id`, () => ok({ id: "r-1" })),

  http.post(`${BASE}/loans/import/excel`, () =>
    ok({ totalRows: 10, successCount: 10, failureCount: 0, failedRows: [] }),
  ),
  http.post(`${BASE}/loans/import/approvals/excel`, () =>
    ok({ totalRows: 10, successCount: 9, failureCount: 1, failedRows: [{ rowNumber: 3, reference: "REF-X", error: "Not found" }] }),
  ),
  http.post(`${BASE}/loans/import/repayments/excel`, () =>
    ok({ totalRows: 10, successCount: 10, failureCount: 0, failedRows: [] }),
  ),

  http.get(`${BASE}/dashboard/portfolio-summary`, () =>
    ok({
      totalActiveLoans: 42,
      totalOutstandingAmountDue: 125_000,
      totalAmountPaidInPeriod: 75_000,
      overdueLoanCount: 5,
      repaymentCollectionRate: 0.88,
      incompleteKycCount: 3,
      recentImports: [],
      approvalTrend: [],
      repaymentTrend: [],
      monthlyCollectionsExpected: 24_500,
      averageMonthlyInstallment: 583,
      totalLoansOnBook: 60,
      newThisYear: 18,
      maturedClosedCount: 15,
      activeRate: 0.7,
      totalLoanBookSize: 360_000,
      averageLoanSize: 8_571,
      principalMaturingThisMonth: 12_000,
      principalMaturingNext3Months: 38_000,
      par30Rate: 0.12,
      par90Rate: 0.04,
      missingDataCount: 2,
      maturityByMonth: [
        { month: "2026-05", count: 4 },
        { month: "2026-06", count: 7 },
      ],
      actualCollectionsByMonth: [
        { month: "2026-03", amount: 18_000 },
        { month: "2026-04", amount: 22_000 },
      ],
      topActiveInstallments: [
        {
          loanId: "loan-1",
          referenceNumber: "REF-001",
          repaymentAmount: 1_500,
          endDate: "2027-01-15",
          borrower: { id: "b-1", ecNumber: "EC-1001", firstName: "Ada", lastName: "Lovelace" },
        },
      ],
    }),
  ),

  http.get(`${BASE}/reports/:slug`, () => ok({ rows: [] })),

  http.get(`${BASE}/activity-logs`, () => list([])),
  http.get(`${BASE}/notifications/deliveries`, () =>
    list([
      {
        id: "n-1",
        eventType: "loan.status.changed",
        recipient: "loans@example.com",
        subject: "Loan status updated: REF-1001",
        status: "sent",
        providerMessageId: "resend_msg_1",
        errorMessage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "n-2",
        eventType: "auth.login.failure.suspicious",
        recipient: "admin@example.com",
        subject: "Unusual sign-in attempt",
        status: "skipped",
        providerMessageId: null,
        errorMessage: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: "n-3",
        eventType: "user.password.changed",
        recipient: "broken@example.invalid",
        subject: "Your password was changed",
        status: "failed",
        providerMessageId: null,
        errorMessage: "Invalid recipient domain",
        createdAt: new Date().toISOString(),
      },
    ]),
  ),
];
