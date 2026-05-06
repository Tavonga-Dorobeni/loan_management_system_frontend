# Claude Progress — Loan Management Frontend

_Scope: `frontend/` only (per `CLAUDE.md`). Codex owns `backend/` in parallel per `AGENTS.md`._
_Authoritative plan: `C:\Users\Tavonga Dorobeni\.claude\plans\brainstorm-and-plan-the-scalable-mccarthy.md`._

## 1. Accomplished

### Root-level governance
- `CLAUDE.md` — scopes Claude to `frontend/`; references `docs/AGENT.md`.
- `AGENTS.md` — scopes Codex to `backend/`; references Brownfield Backend Protocol §6.

### Planning
- Full implementation plan written covering 9 slices, backend contract punch list (P0/P1/P2), MSW-first mocking strategy, stack-drift decision (accepted: Joi/xlsx/Sequelize documented as deviation under AGENT.md §3.7).
- Punch list handed to Codex; backend implementation underway in parallel.

### Frontend foundation (Slice 0) — complete and verified

**Tooling / config**
- `package.json` (Next 14.2.15, React 18, TanStack Query v5 + Table v8, RHF + Zod, shadcn primitives, Sonner, Recharts, Jest + RTL + MSW).
- `tsconfig.json` (strict, `@/*` path alias), `next.config.mjs`, `tailwind.config.ts` (HSL tokens: brand/success/warning/danger), `postcss.config.js`, `.eslintrc.json`, `.prettierrc`.
- `jest.config.ts` using `setupFilesAfterEnv` (verified via `jest-config` defaults).
- `.env.local` + `.env.local.example` (`NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_USE_MOCKS`).

**App shell**
- `app/layout.tsx` (Inter via `next/font`, `--font-sans`), `app/globals.css` (HSL tokens + `.numeric` utility), `app/providers.tsx` (QueryClient + Sonner Toaster + Devtools).
- `app/page.tsx` → redirects to `/dashboard`. Placeholder `(auth)/login`, `(app)/layout.tsx`, `(app)/dashboard`.
- `app/api/auth/login/route.ts` — proxies backend login, writes HTTP-only `session` cookie.
- `app/api/auth/logout/route.ts` — clears cookie.
- `middleware.ts` — redirects unauth'd users to `/login?next=…`; auth'd users hitting `/login` bounce to `/dashboard`.

**Core libraries (`lib/`)**
- `api-client.ts` (envelope-aware `apiFetch` / `apiList`, `ApiError` with `statusCode` + `fieldErrors`).
- `auth/cookies.ts`, `auth/session.ts` (server-side session reader).
- `rbac.ts` (21 actions, 5 roles, matrix mirrors AGENT.md §4).
- `format/{currency,date,identifier}.ts`.
- `env.ts` (zod-validated public env).
- `api/{auth,users,borrowers,kyc,loans,repayments,imports,reports,activity}.ts` — typed clients for every endpoint in the plan (real + gap).

**Hooks**
- `useAuth` (`SessionProvider` + `useAuth()` with `can(action)` + logout).
- `usePaginatedQuery` (URL-bound state, `keepPreviousData`).
- `useDebouncedValue`.

**Schemas (`schemas/`)**
- `common.ts`, `auth.ts`, `user.ts`, `borrower.ts`, `kyc.ts`, `loan.ts` (base + refined create + partial update), `repayment.ts`, `pagination.ts`.

**Shared components**
- `ui/` primitives: `button`, `input`, `label`, `card`, `table`, `badge` (success/warning/danger variants).
- `data-table/{DataTable,Pagination,Toolbar}` (numeric column meta → `.numeric text-right`).
- `role-guard.tsx`, `status-badge.tsx` (`LoanStatusBadge`, `RepaymentStatusBadge`).
- `toasts/index.ts` (`toast`, `toastApiError`, `toastImportSummary`).
- `layout/{Sidebar,Header,GlobalSearch,Breadcrumbs}` (sidebar filtered by role + `can`; header search routes to `/borrowers?search=…` per DESIGN §2).

**MSW harness**
- `tests/setup.ts`, `tests/polyfills.ts`, `tests/style-mock.ts`.
- `tests/msw/{handlers,server,browser}.ts` — handlers for every endpoint in the plan (real + gap): auth, users, borrowers (+ composites), KYC, loans (+ composites), repayments, 3 imports, dashboard, 9 reports, activity logs, notification deliveries.

### Verification (all green)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm run build` — clean; 4 static pages, 2 route handlers, middleware bundled 26.6 kB.

### Slice 1 — Auth — complete and verified

**Components**
- `components/auth/LoginForm.tsx` — RHF + Zod (`loginSchema`); posts JSON to `/api/auth/login`; on 422 maps `fieldErrors` back to RHF inputs; on other failures shows `toast.error`; on success calls `router.replace(safeNext)` + `router.refresh()`. Hardens `?next=` against open-redirect (rejects anything not matching `/[^/]`).
- `components/layout/DeniedScreen.tsx` — reusable 403 fallback used by `(admin)` layout.

**Routes / layouts**
- `app/(auth)/login/page.tsx` — wraps `<LoginForm />` in `<Suspense>` (required because `useSearchParams()` triggers CSR bailout in the static prerender).
- `app/(app)/layout.tsx` — server-side `getSessionUser()` → redirect to `/login` if absent → wraps `Sidebar` + `Header` + `<main>` in `<SessionProvider>`.
- `app/(admin)/layout.tsx` — same shell, additionally renders `<DeniedScreen />` when `user.role !== 'admin'`. Group exists with no pages yet — pages land at Slice 2.

**Session storage**
- `lib/auth/session.ts` — `SessionUser` type now lives here; `getSessionUser()` reads + validates the parallel `session_user` cookie.
- `lib/auth/cookies.ts` — added `setSessionUserCookie()`; `clearSessionCookie()` clears both cookies.
- `app/api/auth/login/route.ts` — also writes the `session_user` cookie; validates `user.role` via `isRole()`; converts upstream fetch failure into a 502 envelope.
- `hooks/useAuth.ts` — re-exports `SessionUser` from `lib/auth/session.ts` (single source of truth).

**Tests (RTL + MSW v2)**
- `components/auth/__tests__/LoginForm.test.tsx` — 8 cases: render, empty submit, short password, success → `/dashboard`, success → safe `?next=`, success → unsafe `?next=` falls back, 401 → toast, 422 → `fieldErrors`. All green.

**Test harness fixes (one-time)**
- `jest.config.js` (replaces `.ts` because Jest needs `ts-node` for `.ts` configs) — uses `next/jest` for SWC transformation; overrides `transformIgnorePatterns` so MSW + its ESM deps (`rettime`, `@bundled-es-modules`, `outvariant`, `until-async`, `strict-event-emitter`, `@open-draft/*`, `headers-polyfill`) get transformed; adds `customExportConditions: ['']` so `msw/node` resolves under jsdom.
- `tests/polyfills.ts` — defaults `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_USE_MOCKS` for Jest; polyfills `TransformStream` / `ReadableStream` / `WritableStream` / `BroadcastChannel` (required by MSW v2 in jsdom).

### Verification — Slice 1 (all green)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — 8/8 passing.
- `npm run build` — clean; `/login` renders, `(app)` + `(admin)` route groups compile.

### Slice 2 — Users — complete and verified

**Routes (mounted under `(admin)` group with admin-only `DeniedScreen` gate)**
- `app/(admin)/admin/users/page.tsx` — list page mounting `<UsersTable />`.
- `app/(admin)/admin/users/new/page.tsx` — create page; `<UserForm mode="create" />` in a `Card`, with back link.
- `app/(admin)/admin/users/[id]/page.tsx` — server-component; `getUser(id)` (404 → `notFound()`), `<UserForm mode="edit" />` + Security card with `ChangePasswordModal` (`isSelf` derived from `getSessionUser()`); Danger Zone card with `DeleteUserDialog` only when **not** editing self.
- `app/(app)/profile/page.tsx` — self-service profile + `ChangePasswordModal isSelf` for every role (mirrors AGENT.md §4 row "Users: change password (self) ✔ for all roles").

> Note: route group `(admin)` doesn't contribute `/admin` to the URL — pages live at `app/(admin)/admin/users/...` so URLs match the spec.

**Header**
- `components/layout/Header.tsx` — name/role badge is now a `Link` to `/profile`.

**Components reused (built earlier)**
- `components/admin/users/{UsersTable,UserForm,ChangePasswordModal,DeleteUserDialog}.tsx`.

**API-client refactor (build-time fix)**
- `lib/api-client.ts` — removed top-level `import { cookies } from "next/headers"` (was breaking client-bundle compilation when client components transitively imported `lib/api/users.ts`). Now exposes `setServerTokenReader(reader)` and uses the registered reader behind a `typeof window === "undefined"` guard.
- `lib/api-client.server.ts` (new) — `import "server-only"` module that registers the cookies-based reader.
- `app/layout.tsx` — imports `@/lib/api-client.server` once so the registration runs in every server render.

**Tests (RTL + MSW v2) — `components/admin/users/__tests__/`**
- `UsersTable.test.tsx` — rows render, empty state, `?role=` query string is pushed to the URL on filter change.
- `UserForm.test.tsx` — create happy path (captures POST body), 422 fieldErrors map back to inputs, edit prefills + submits PUT (captures changed fields).
- `ChangePasswordModal.test.tsx` — self-service POST captures `{ currentPassword, newPassword }`, mismatch error blocks submit, admin variant hides the current-password field.
- `DeleteUserDialog.test.tsx` — DELETE called + redirect to `/admin/users` on confirm; 409 error path surfaces toast and skips redirect.

### Verification — Slice 2 (all green)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — 19/19 passing across 5 suites.
- `npm run build` — clean; routes: `/admin/users`, `/admin/users/[id]`, `/admin/users/new`, `/profile`.

### Slice 3 — Borrowers — complete and verified

**Routes (under `(app)` shell)**
- `app/(app)/borrowers/page.tsx` — list page mounting `<BorrowersTable />` (header `<GlobalSearch />` already routes to `?search=…`).
- `app/(app)/borrowers/new/page.tsx` — server-side `borrowers.write` gate (redirects non-eligible roles to `/borrowers`); `<BorrowerForm mode="create" />` in a `Card`.
- `app/(app)/borrowers/[id]/page.tsx` — server-component; `getBorrower(id)` (404 → `notFound()`), header with monospace `EC #` / `ID #`; renders `<BorrowerTabs />`; Danger Zone `<DeleteBorrowerDialog />` only for `borrowers.delete` roles.

**Components (`components/borrowers/`)**
- `BorrowersTable.tsx` — TanStack Table; columns: Name (link), EC #, ID #, Phone, Email; `font-mono numeric` on identifier columns per DESIGN §1; "New borrower" affordance gated by `can("borrowers.write")`.
- `BorrowerForm.tsx` — three modes: `create`, `edit`, `edit-contact-only`; contact-only (customer_support) hides identity fields and posts only `{phoneNumber,email}`; empty-string contact inputs normalized to `null` before PUT/POST; ApiError fieldErrors mapped per-mode.
- `DeleteBorrowerDialog.tsx` — Radix dialog; on confirm calls `deleteBorrower`, toasts, redirects to `/borrowers`.
- `BorrowerTabs.tsx` — Radix tabs shell: Profile / KYC / Loan history / Activity trail.
- `ProfilePanel.tsx` — left: form (or read-only fallback); right: Quick Stats card (loan counts, outstanding due) + KYC completeness checklist sourced from `GET /borrowers/:id/profile`.
- `LoanHistoryPanel.tsx` — TanStack table consuming `GET /borrowers/:id/loans`; Reference column links to `/loans/[id]`; numeric columns use `tabular-nums`/`font-mono`; `<LoanStatusBadge />` per DESIGN §1.
- `ActivityTrailPanel.tsx` — left-rail timeline using `summary` (DESIGN §6 mandates human-readable text); scopes to `entityType=borrower&entityId=:id`.

**Schemas**
- `schemas/borrower.ts` — added `optionalString` / `optionalEmail` zod preprocessors that coerce `""` → `undefined` so default empty inputs don't fail email validation. Exported new `contactOnlyBorrowerSchema` for the customer_support form mode.

**Primitives**
- `components/ui/tabs.tsx` (new) — Radix `@radix-ui/react-tabs` wrapper (`Tabs`/`TabsList`/`TabsTrigger`/`TabsContent`).

**KYC tab**
- Renders a placeholder reading "KYC management lands in the next slice." Wiring lives in Slice 4.

**Tests (RTL + MSW v2) — `components/borrowers/__tests__/`**
- `BorrowersTable.test.tsx` — rows render, empty state, "New borrower" hidden for `customer_support` and shown for `loan_officer`.
- `BorrowerForm.test.tsx` — create happy path (captures POST body, redirects to `/borrowers/:id`), 409 fieldError surfaces inline; contact-only mode renders only contact fields and submits a `{phoneNumber}` patch.
- `BorrowerTabs.test.tsx` — Loan history tab loads loan reference; Activity trail tab shows `summary`; KYC tab shows placeholder.

### Verification — Slice 3 (all green)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — 28/28 passing across 8 suites.
- `npm run build` — clean; routes added: `/borrowers`, `/borrowers/[id]`, `/borrowers/new`.

### Slice 4 — KYC — complete and verified

**Components (`components/borrowers/kyc/`)**
- `KycDocumentGrid.tsx` — 2-column responsive card grid; one card per `KYC_DOCUMENT_TYPES` value (payslip / national_id / passport_sized_photo / application_form). Per-card status badge: success "Uploaded" with check icon when present, secondary "Missing" otherwise. Picks the latest doc per type when the API returns multiple. Upload affordance shown only when `can("kyc.upload")`.
- `KycUploadDialog.tsx` — Radix dialog containing a controlled `<input type="file">` with `accept="image/jpeg,image/png,application/pdf"`; client-side checks for unsupported MIME and files larger than 10 MB before posting; on success builds `FormData` with `borrowerId`, `documentType`, `file` and calls `POST /borrower-kyc/upload`; toasts success + invalidates the `["kyc","borrower",id]` and `["borrower-profile",id]` query caches; submit label is "Upload file" so it doesn't collide with the trigger label.
- `KycPreviewButton.tsx` — Button-as-link; `target="_blank" rel="noopener noreferrer"` opening the signed URL.

**Borrower Tabs**
- `components/borrowers/BorrowerTabs.tsx` — KYC tab placeholder replaced with `<KycDocumentGrid borrowerId={borrower.id} />`. Profile panel's KYC checklist still consumes `GET /borrowers/:id/profile` so the right-rail completeness card stays in sync.

**Tests (RTL + MSW v2) — `components/borrowers/kyc/__tests__/`**
- `KycDocumentGrid.test.tsx` — renders all four document headings, "Uploaded" badge for the one returned doc + 3 "Missing" siblings, RBAC: hides upload buttons for `customer_support` and shows 4 for admins, Preview link opens new tab with the signed URL.
- `KycUploadDialog.test.tsx` — happy path (PDF) calls `POST /borrower-kyc/upload` and toasts success; unsupported-MIME path uses `fireEvent.change` to bypass userEvent's `accept` filter and asserts the inline error; oversize-file path asserts the 10 MB inline error; 500 server response surfaces `toastError`.
- Updated `BorrowerTabs.test.tsx` — KYC tab now asserts the four card headings instead of the old placeholder.

**Notes for future tests**
- `userEvent.upload` silently drops files whose MIME doesn't match the input's `accept` attribute. Use `fireEvent.change(input, { target: { files: [...] } })` when you need to exercise the component's own MIME validation.
- The `whatwg-fetch` polyfill in jsdom can't parse multipart `FormData` server-side, so MSW handlers should not call `await request.formData()`. Verify FormData uploads via a call counter (`apiCalled`) rather than body inspection.

### Verification — Slice 4 (all green)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — 36/36 passing across 10 suites.
- `npm run build` — clean.

### Slice 5 — Loans — complete and verified

**Routes (under `(app)` shell)**
- `app/(app)/loans/page.tsx` — list page mounting `<LoansTable />`.
- `app/(app)/loans/new/page.tsx` — server-side `loans.write` gate; `<LoanForm mode="create" />` in a `Card`.
- `app/(app)/loans/[id]/page.tsx` — server-component fetching `getLoanDetails(id)` (404 → `notFound()`); chooses `<LoanForm />` mode based on RBAC (`admin`/`loan_officer` → `edit`, `credit_analyst` → `edit-status-only`, others → read-only message); 2-column layout with details + repayment history on the left, balance + status timeline on the right; Danger Zone `<DeleteLoanDialog />` only when `loans.delete`.

**Components (`components/loans/`)**
- `LoansTable.tsx` — TanStack table; columns: Reference (mono link to `/loans/[id]`), Type, Status (`<LoanStatusBadge />`), Start, End, Total, Outstanding (numeric/`tabular-nums` per DESIGN §1); accepts an optional `borrowerId` prop for embedded use; URL-bound state via `usePaginatedQuery`; "New loan" affordance gated on `loans.write` and hidden when scoped to a borrower.
- `LoanFilters.tsx` — status select (PENDING/SUCCESS/FAILED), free-text type, start/end date range; emits patches into the URL.
- `LoanForm.tsx` — three modes: `create`, `edit`, `edit-status-only`. Uses `createLoanSchema` for full mode and a relaxed status-only schema (status accepts any non-empty string since approval imports may emit other status values per SPEC §9.2). `borrowerId` is `readOnly` (not `disabled`) in edit mode so RHF still includes it on submit. ApiError fieldErrors mapped per-mode.
- `DeleteLoanDialog.tsx` — admin-only confirm dialog → `DELETE /loans/:id` → toast + redirect to `/loans`.
- `LoanBalanceCard.tsx` — Paid (success-tone) / Outstanding (danger-tone) currency, repayment amount + date range subtitle, `LoanStatusBadge`, ARIA progress bar (`role="progressbar"`, `aria-valuenow=…`).
- `RepaymentHistoryTable.tsx` — TanStack table consuming `GET /loans/:id/repayments`; columns: Date, Amount (numeric), Status (`<RepaymentStatusBadge />`).
- `LoanStatusTimeline.tsx` — left-rail timeline reading scoped activity log entries (`entityType=loan&entityId=:id`); shows human-readable `summary` per DESIGN §6.

**Tests (RTL + MSW v2) — `components/loans/__tests__/`**
- `LoansTable.test.tsx` — rows render with currency formatting; `?status=SUCCESS` pushed to URL on filter change; "New loan" hidden for `collections_officer`.
- `LoanForm.test.tsx` — `edit-status-only` renders only status + message and submits a `{status,message}` patch; `edit` mode prefills identity fields with `borrowerId` locked via `readOnly`.
- `LoanBalanceCard.test.tsx` — paid/outstanding currency rendered, progress percent computed (500/3000 → 17%), `LoanStatusBadge` text shown, divide-by-zero handled when `amountPaid + amountDue === 0`.

### Verification — Slice 5 (all green)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — 44/44 passing across 13 suites.
- `npm run build` — clean; routes added: `/loans`, `/loans/[id]`, `/loans/new`.

### Slice 6 — Repayments — complete and verified

**Routes**
- `app/(app)/repayments/page.tsx` — chronological repayment ledger mounting `<RepaymentsTable />`.
- `app/(app)/loans/[id]/page.tsx` — Repayment History card now exposes a `<RecordRepaymentDialog />` trigger gated on `repayments.write`.

**Components (`components/repayments/`)**
- `RepaymentForm.tsx` — RHF + Zod (`createRepaymentSchema`); `loanId` is `readOnly` when `lockLoanId` is set (so admins/collections officers don't accidentally retarget); on success toasts the **derived** status (`Repayment recorded (CORRECT)` etc.), invalidates `["repayments"]`, `["loan-repayments", loanId]`, `["loan-details", loanId]`, and `["borrower-profile"]` query caches; ApiError fieldErrors mapped back to the form.
- `RecordRepaymentDialog.tsx` — Radix dialog wrapping `RepaymentForm` with `mode="create"` + `lockLoanId`; closes itself via `onCompleted`.
- `DeleteRepaymentDialog.tsx` — Radix confirm dialog → `DELETE /repayments/:id`; invalidates the same caches; admin/collections-officer only.
- `RepaymentsTable.tsx` — TanStack table with status / loanId / from / to filters URL-bound via `usePaginatedQuery`; columns: Date, Loan (link), Amount (numeric), Status (`<RepaymentStatusBadge />`); inline `DeleteRepaymentDialog` per row when `repayments.write`.

**Tests (RTL + MSW v2) — `components/repayments/__tests__/`**
- `RepaymentForm.test.tsx` — happy path: locked loanId, POST captures `{loanId, amount}`, success toast includes the derived status, `onCompleted` fires; 422 fieldError for `amount` surfaces inline.
- `RepaymentsTable.test.tsx` — rows render with status badges + currency (waits for `getAllByRole('row').length === 3` since the status filter options leak the same text); `?status=UNDER` pushed to URL on filter change; delete affordance hidden for read-only roles (`loan_officer`).

**Notes for future tests**
- When a filter `<select>` shares text with cell content, prefer waiting on `getAllByRole("row")` count rather than `findByText`. The select options resolve before the data does.

### Verification — Slice 6 (all green)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — 49/49 passing across 15 suites.
- `npm run build` — clean; route added: `/repayments`.

### Slice 7 — Imports — complete and verified

**Routes (under `(app)` shell)**
- `app/(app)/imports/intake/page.tsx`, `imports/approvals/page.tsx`, `imports/repayments/page.tsx` — server components with per-route RBAC gates (`imports.intake` / `imports.approvals` / `imports.repayments`). The intake page redirects role-aware: a `credit_analyst` who lands on `/imports/intake` is bounced to `/imports/approvals`; a `collections_officer` to `/imports/repayments`; anyone else to `/dashboard`.
- Each page renders `<ImportsSidebar />` (only shows kinds the role can run) + `<ExcelImportWizard kind="…" />`.

**Components (`components/imports/`)**
- `ExcelImportWizard.tsx` — 3-step Stepper (Upload → Processing → Results); `.xlsx`-only file input with name + MIME check + 25 MB ceiling; "Processing file… do not refresh" panel during the await (per DESIGN §3.C); on completion the `Results` block shows three stat cards (Total / Succeeded / Failed) with success/danger tones plus a `<FailedRowsTable />`. Internally maps `kind ∈ "intake"|"approvals"|"repayments"` to the right importer because functions can't be passed from server pages to client components.
- `FailedRowsTable.tsx` — Row # | Reference | Error table per SPEC §9 envelope; row counts are mono/numeric/right-aligned; error column gets `text-danger`.
- `ImportsSidebar.tsx` — left rail listing only the import kinds the role can run, with active-route highlight.

**Cross-cutting**
- `components/toasts/index.ts` — `toastImportSummary` is wired so completion toasts surface success or partial-failure variants regardless of the active page (DESIGN §5).
- `components/layout/Sidebar.tsx` — top-level "Imports" entry now uses a new `anyAction: ["imports.intake","imports.approvals","imports.repayments"]` predicate so customer_support (no import permissions) doesn't see the entry at all.

**Tests (RTL + MSW v2) — `components/imports/__tests__/`**
- `ExcelImportWizard.test.tsx` (4 cases): happy path (POST captured + "All rows processed" + `toastImportSummary` called); partial-failure renders FailedRowsTable rows + warning toast; non-`.xlsx` rejected client-side (no API call); 500 server error toasts and falls back to the upload step.

**Notes for future tests**
- Stat cards repeat scalars (Total = Succeeded when nothing fails). Use `getAllByText(...)` length assertions or look for a uniquely valued stat (Failed = 0) instead of the bare number.

### Verification — Slice 7 (all green)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — 53/53 passing across 16 suites.
- `npm run build` — clean; routes added: `/imports/intake`, `/imports/approvals`, `/imports/repayments`.

### Slice 8 — Reports & Dashboard — complete and verified

**Routes (under `(app)` shell)**
- `app/(app)/dashboard/page.tsx` — replaced the Slice 0 placeholder with `<DashboardClient />`.
- `app/(app)/reports/page.tsx` — index of all 9 reports as a card grid linking to `/reports/[slug]`.
- `app/(app)/reports/[slug]/page.tsx` — server component validating the slug against `REPORT_SLUGS` (404 if unknown); `generateStaticParams` so each slug is statically known.

**Components (`components/dashboard/` + `components/reports/`)**
- `DashboardClient.tsx` — TanStack Query against `GET /dashboard/portfolio-summary`; 6 metric cards (Active loans / Outstanding due / Paid in period / Overdue loans / Collection rate / Incomplete KYC) with signal-color tones per DESIGN §1; Approvals + Repayments trend charts; Recent imports list.
- `MetricCard.tsx` — label + value + tone (success/warning/danger/muted) + optional sublabel; numeric font for the value per DESIGN §1.
- `TrendChart.tsx` — Recharts `LineChart` wrapped in `ResponsiveContainer`; HSL CSS variables for axis/grid/tooltip; empty-state message when no data.
- `RecentImportsList.tsx` — chronological list of recent import runs with success/failure counts (red when failures > 0).
- `ReportClient.tsx` — TanStack Query against `GET /reports/:slug`; date-range filter state held locally and threaded into both the query and the export URL; `<ExportButtons />` placed next to the title.
- `ReportFilters.tsx` — From / To date inputs.
- `ExportButtons.tsx` — `<a href download>` links pointing at `${NEXT_PUBLIC_API_BASE_URL}/reports/{slug}?...&format=csv|xlsx` (`reports.export` gate; hidden for `customer_support`).
- `ReportTable.tsx` — generic table that infers columns from row keys, humanizes them (`amountDue` → "Amount due"), right-aligns numerics with mono/`tabular-nums`.
- `catalog.ts` — `REPORT_CATALOG` mapping each `ReportSlug` to title + description; consumed by both the index and slug pages.

**Format helpers**
- `lib/format/percent.ts` — `formatPercent` using `Intl.NumberFormat`.

**MSW handler fix**
- `tests/msw/handlers.ts` — dashboard mock now uses `totalAmountPaidInPeriod` to match the `DashboardSummary` type.

**Tests (RTL + MSW v2)**
- `components/dashboard/__tests__/DashboardClient.test.tsx` — Recharts is mocked to plain stubs (its SVG layout doesn't render in jsdom); renders 6 SPEC §13 metrics with formatted currency + percent; recent-imports placeholder when none.
- `components/reports/__tests__/ExportButtons.test.tsx` — admin sees CSV + Excel links with `download` attribute and correct `format=` query string + threaded date filters; customer_support sees nothing.

### Verification — Slice 8 (all green)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — 57/57 passing across 18 suites.
- `npm run build` — clean; routes added: `/dashboard` (real), `/reports`, `/reports/[slug]` (SSG fanout: 9 slugs).

### Slice 9 — Activity Log & Notifications — complete and verified

**Routes**
- `app/(admin)/admin/audit/page.tsx` — admin-gated by the existing `(admin)` layout; renders the activity stream alongside a recent-notifications side panel.

**Components (`components/admin/audit/`)**
- `ActivityStream.tsx` — `usePaginatedQuery` against `GET /activity-logs`; URL-bound filters; renders entries as a left-rail timeline showing the human-readable `summary` (DESIGN §6 — never raw "Update Loan ID 45"), with role / entity / source badges and a Diff trigger when `metadata` is non-empty. Has a built-in client-side `activityLog.read` guard rendering a "Activity log access is admin-only." fallback (the server page is also gated, so this is double-belt-and-suspenders for any embedded usage).
- `ActivityFilters.tsx` — selects for actor role / entity type / source plus from/to date inputs.
- `JsonDiffModal.tsx` — Radix dialog. When metadata has `before`/`after` (or `old`/`new`, or `previous`/`current`) it renders side-by-side panes (red-tinted "Before", green-tinted "After"); otherwise falls back to a single "Metadata" pane.
- `NotificationDeliveryPanel.tsx` — TanStack Query against `GET /notifications/deliveries?pageSize=10`; status pill (sent/queued/failed) + recipient + error message when failed.

**Tests (RTL + MSW v2) — `components/admin/audit/__tests__/`**
- `ActivityStream.test.tsx` — renders human-readable `summary` for both API entries and import entries; surfaces `sourceReference` on imports; empty state; entity-type filter pushes `?entityType=loan` to the URL; renders the admin-only fallback for `loan_officer`.
- `JsonDiffModal.test.tsx` — opens the dialog and renders Before/After panes for `{before, after}` metadata; falls back to a single Metadata pane when neither key is present.

### Verification — Slice 9 (all green)
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — 63/63 passing across 20 suites.
- `npm run build` — clean; route added: `/admin/audit`.

## 2. Current state

- All 9 slices shipped. Frontend feature-complete against MSW; every route in the spec exists, every Activity Log event has a place to be read from, every Notification delivery has a place to surface failures.
- API client cleanly splits universal/browser code from server-only cookie reading via `setServerTokenReader` + `lib/api-client.server.ts`.
- Codex is implementing the backend punch list in parallel. Until P0/P1 items land, slices continue to develop against MSW with `NEXT_PUBLIC_USE_MOCKS=1`.
- Pending live backend smoke for system DoD: P0#1 `requireRole`, P0#2 verified login envelope, P1#3 pagination, P1#4 composites, P1#5 dashboard + reports with CSV/XLSX, P1#6 activity-log read, P1#7 notification deliveries; KYC upload + signed-URL retrieval against the live S3 bucket; transactional repayment + loan balance mutation against the live DB; cents → dollars conversion on intake import; `amountDue` formula on approval import.

### Same-origin proxy + canonical adapters

**Proxy (browser → backend)**
- `app/api/backend/[...path]/route.ts` — forwards method/query/body (streamed via `duplex: "half"`) to `NEXT_PUBLIC_API_BASE_URL`. Reads the HTTP-only `session` cookie server-side and injects `Authorization: Bearer <token>`. Strips hop-by-hop and inbound `cookie` headers; passes upstream `Content-Disposition` through (preserves CSV/XLSX downloads). 502 envelope on backend unreachable. `dynamic="force-dynamic"`, `runtime="nodejs"`.
- `lib/api-client.ts` — `resolveBaseUrl()` returns `/api/backend` for browser when mocks off, absolute `NEXT_PUBLIC_API_BASE_URL` for SSR or browser-with-mocks. Server token reader path (`lib/api-client.server.ts`) unchanged.
- `components/reports/ExportButtons.tsx` — CSV/XLSX `<a>` hrefs now point at `/api/backend/reports/{slug}?…` so downloads stay authenticated without exposing the JWT to client JS.
- `tests/polyfills.ts` — defaults `NEXT_PUBLIC_USE_MOCKS=1` so jsdom tests stay on the absolute MSW-intercepted URL (the relative proxy path doesn't exist outside Next runtime).
- `middleware.ts` — added `/api/backend` to `PUBLIC_PREFIXES`; the proxy itself decides auth, so an expired session yields a JSON 401 envelope from the backend instead of an HTML redirect to `/login`.

**Adapter ↔ contract translation**
- `lib/api/loans.ts` — `listLoans` (and the loan-repayments composite) translates UI `startDate`/`endDate` → backend `startDateFrom`/`endDateTo`; loan-repayments composite also translates `from`/`to` → `transactionDateFrom`/`transactionDateTo`.
- `lib/api/repayments.ts` — `listRepayments` translates UI `from`/`to` → backend `transactionDateFrom`/`transactionDateTo`.
- `lib/api/reports.ts` — pinned `ReportEnvelope = { rows: ReportRow[] }`; `getReport(slug, query): Promise<ReportEnvelope>` (no more loose generic). `ReportClient.tsx` consumes it directly.
- `lib/api/kyc.ts` — `listKycByBorrower` now uses `apiList<KycDocument>` returning the canonical paginated list envelope `{ items, pagination }`. `KycDocument` field is `createdAt` (matches the live backend; `documentUrl`, `updatedAt` accepted as optional).
- `lib/api/activity.ts` — `NotificationDelivery['status']` adds `"skipped"`; `NotificationDeliveryPanel.tsx` maps it to the `secondary` badge tone.

### Live-backend smoke pass (2026-04-29)

Walked AGENT.md Appendix E against the running Codex backend (`http://localhost:3000`) and the frontend dev server (`http://localhost:3001`).

**Confirmed working**
- `POST /auth/login` returns the canonical `{user:{id,firstName,lastName,email,role,status}, token}` envelope (token signed HS256, exp ≥ 1h).
- All seven list endpoints (`/users`, `/borrowers`, `/loans`, `/repayments`, `/dashboard/portfolio-summary`, `/activity-logs`, `/notifications/deliveries`) return SPEC §7 `{items, pagination}` shape with the field names the frontend types declare.
- All four composite endpoints (`/borrowers/:id`, `/borrowers/:id/profile`, `/borrowers/:id/loans`, `/loans/:id/details`, `/loans/:id/repayments`) match the frontend `BorrowerProfile` / `LoanDetails` types.
- All 9 report endpoints (`/reports/:slug`) return `{rows: [...]}`. CSV/XLSX exports return correct MIME + `Content-Disposition: attachment; filename="…"`; proxy passes the binary stream through unchanged.
- Canonical filter parameter names — `startDateFrom`/`endDateTo` on loans, `transactionDateFrom`/`transactionDateTo` on repayments — are honored end-to-end.
- Dashboard returns every SPEC §13 metric: `totalActiveLoans`, `totalOutstandingAmountDue`, `totalAmountPaidInPeriod`, `overdueLoanCount`, `repaymentCollectionRate`, `incompleteKycCount`, `recentImports[]`, `approvalTrend[]`, `repaymentTrend[]`.
- End-to-end write through proxy: create borrower (201) → create loan (201, PENDING) → approve via PUT (200, SUCCESS, `amountDue=900`) → record repayment (201, status auto-derived `CORRECT`).
- Activity Log persisted `auth.login.success`, `borrower.created`, `loan.created`, `loan.updated`/`loan.status.changed`, `repayment.created` — each with `actorUserId`, `actorRole`, human-readable `summary`, and rich `metadata`.
- Notification deliveries persisted (e.g. `auth.login.failure.suspicious` → Resend `providerMessageId`).
- 409 unique-constraint envelope on duplicate borrower create.
- Same-origin proxy injects bearer from HTTP-only `session` cookie; without cookies the backend returns the canonical 401 envelope (no JWT ever leaves the server side to the browser).

**Drift caught and fixed on the frontend**
- `KycDocument.uploadedAt` → reverted to `createdAt`. Backend returns `createdAt`/`updatedAt`; the upload tab was rendering "Not yet uploaded" for real data. Updated type, `KycDocumentGrid.pickLatest`, the "Uploaded …" label, MSW handler, and the test fixture.
- `LoanForm` date inputs were receiving full ISO timestamps (`2026-01-01T00:00:00.000Z`) which `<input type="date">` rejects silently. Added a small `dateOnly()` helper that clips to `YYYY-MM-DD` for `startDate` / `endDate` / `disbursementDate` defaults. (`RepaymentForm` already did this.)

**Verification post-drift fixes** — `npm run typecheck`, `npm run lint`, `npm test` (63/63), `npm run build` all clean.

**Smoke pass items not exercised from the command line**
- KYC document upload (`POST /borrower-kyc/upload`, multipart). Backend's smoke script does cover this against S3.
- The 3 Excel imports (intake / approvals / repayments) — multipart `.xlsx` body. Backend smoke script covers these.
- Both should be re-verified in the browser as part of a manual UI walk.

### Dashboard redesign (2026-05-06) — frontend complete, backend pending

Replaced the SPEC §13 placeholder dashboard with a 12-column control panel per the user's spec. Plan: `~/.claude/plans/this-is-what-i-foamy-panda.md`.

**Layout**
- `lg+`: Section A (`col-span-8`) + Section B (`col-span-4`) share one grid row so CSS auto-stretches them to equal height — no manual height arithmetic. Section C (`col-span-12`) sits below.
- Cards inside each labeled group: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4`. Bumped to `xl:` (not `lg:`) because at 1024px Section A is only ≈683px wide and four cards with `text-2xl` currency clip at that width.

**Components added (`components/dashboard/`)**
- `SectionLabel.tsx` — small-caps muted-foreground heading wired to `aria-labelledby`.
- `MaturityByMonthChart.tsx` — Recharts `BarChart`, brand-tone bars, X axis formatted via `formatMonthBucket("2026-05") → "May 26"`.
- `MonthlyCollectionsChart.tsx` — Recharts `BarChart`, success-tone bars, Y axis uses compact currency (`$12k`), tooltip uses full `formatCurrency`.
- `TopInstallmentsTable.tsx` — drives `DataTable` with EC Number / Name / Reference / Monthly Amount / End Date / Months Left columns. Name and Reference cells link to `/borrowers/[id]` and `/loans/[id]`. Numeric columns use `meta.numeric` so the table wrapper applies `.numeric text-right`.

**Components edited**
- `DashboardClient.tsx` — full rewrite. Single `useQuery(["dashboard-summary"])` drives all 16 cards, both charts, and the top-10 table. Currency / percent / integer formatting helpers are local to the file.
- `MetricCard.tsx` — value typography tightened from `text-3xl` to `text-2xl`, added `truncate` + `title={value}` so wide currency strings don't overflow at 4-up.

**Lib**
- `lib/format/months.ts` (new) — `monthsBetween(from, to)` and `formatMonthBucket("YYYY-MM")` using `Intl.DateTimeFormat`. Avoided `date-fns` for these — std lib is enough.
- `lib/api/reports.ts` — extended `DashboardSummary` with all new optional fields plus `TopActiveInstallment` type.

**Tests / mocks**
- `tests/msw/handlers.ts` — `/dashboard/portfolio-summary` mock now seeds every new field (one realistic row in `topActiveInstallments`).
- `components/dashboard/__tests__/DashboardClient.test.tsx` — rewritten for the new structure: asserts the three section labels, all 16 card labels, currency/percent formatting (70% active rate, 12% PAR 30, $360,000 book size), top-10 link `href`s, and graceful placeholder fallback when extended fields are missing. Recharts mock now also stubs `BarChart` + `Bar`.
- `components/dashboard/__tests__/TopInstallmentsTable.test.tsx` (new) — happy path and empty state.

**Backend dependencies (Codex hand-off — NOT yet implemented)**

`GET /api/v1/dashboard/portfolio-summary` needs to be extended with these fields. Until they ship, the FE renders `—` placeholders and an empty top-10 table — no crashes:

- KPIs: `monthlyCollectionsExpected`, `averageMonthlyInstallment`, `totalLoansOnBook`, `newThisYear`, `maturedClosedCount`, `activeRate` (0..1)
- Loan Book Size: `totalLoanBookSize`, `averageLoanSize`, `principalMaturingThisMonth`, `principalMaturingNext3Months`
- Portfolio Quality: `par30Rate` (0..1), `par90Rate` (0..1), `missingDataCount`
- Charts: `maturityByMonth: [{month: "YYYY-MM", count}]` (forward 12), `actualCollectionsByMonth: [{month: "YYYY-MM", amount}]` (last 12, sum of repayments grouped by transactionDate month)
- Table: `topActiveInstallments: [{loanId, referenceNumber, repaymentAmount, endDate, borrower: {id, ecNumber, firstName, lastName}}]` ordered by `repaymentAmount` desc, limit 10, where `amountDue > 0`

Definitions (post-correction 2026-05-06):
- **Active** = `loans.status = 'ACTIVE'` (NOT `amountDue > 0` — this is a backwards-incompatible change to the backend's existing `totalActiveLoans` definition; flag with the user before shipping).
- **Matured / Closed** = `loans.status = 'MATURED'`. Past-term-but-still-owing loans remain Active/PAR until a lifecycle job promotes them.
- **Monthly Collections KPI** is single-month (current month default; optional `?month=YYYY-MM` param), sum of `repaymentAmount` for ACTIVE loans active that month.
- **Monthly Collections chart** is historical actuals (last 12 months) — actuals don't filter on status.
- **PAR 30 / PAR 90** = % of ACTIVE loans (decimal 0..1).

Codex action item: confirm `loans.status` lifecycle rules (PENDING → ACTIVE on disbursement; ACTIVE → MATURED via what trigger?) before re-pointing dashboard formulas at the status column.

Recommendation to Codex: keep all of this in the existing `/dashboard/portfolio-summary` envelope rather than fanning out — single fetch / single loading state / single cache key. SPEC §13 deviation; record in the brownfield gap log.

**Verification — Dashboard redesign (all green)**
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — 78/78 across 23 suites.
- `npm run build` — clean; `/dashboard` route now 103 kB First Load (BarChart added alongside the existing LineChart).

### Loan write-off (2026-05-06) — frontend complete, backend status enum dependency

Replaced the **Delete Loan** affordance on `/loans/[id]` with **Write off loan**. Per product owner, terminal-state loans in this system are written-off, not deleted; the loan record stays for audit, status flips to `WRITE-OFF`, and the reason lands in `loan.message`.

**Components**
- `components/loans/WriteOffLoanDialog.tsx` (new) — Radix Dialog + RHF + Zod (`reason: trim().min(10).max(500)`). On submit calls `updateLoan(id, { status: "WRITE-OFF", message: reason })`, toasts, invalidates `["loans"]` and `["loan-details", id]` caches, redirects to `/loans`. Maps `ApiError.fieldErrors.reason | .message` back to the inline reason field.
- `components/loans/DeleteLoanDialog.tsx` — **deleted**. The only consumer was the Loan view page; no other code referenced it.
- `components/status-badge.tsx` — `LoanStatusBadge` adds `WRITE-OFF` (and `WRITEOFF` as a tolerance) to the danger-tone branch.

**Routes / RBAC**
- `app/(app)/loans/[id]/page.tsx` — swapped `<DeleteLoanDialog>` → `<WriteOffLoanDialog>` and renamed `canDelete` → `canWriteOff`.
- `lib/rbac.ts` — added new `loans.writeOff` action. Mapped to `["admin"]` only (matching the gravity of the prior delete affordance). The legacy `loans.delete` action is left in the matrix because the underlying `DELETE /loans/:id` API still exists, but no FE surface currently calls it.

**Tests (RTL + MSW v2)** — `components/loans/__tests__/WriteOffLoanDialog.test.tsx`
- Happy path: opens dialog, types a reason ≥ 10 chars, submits → captures the PUT body and asserts `{ status: "WRITE-OFF", message: <reason> }`, success toast, redirect to `/loans`.
- Validation: typing "too short" surfaces an inline `role="alert"` message and never calls the API.

**Backend dependencies (Codex hand-off)**
- `loans.status` is a free-form string column, but `PUT /api/v1/loans/:id` likely has Joi validation that constrains the status enum. Codex needs to add `WRITE-OFF` to the allowlist (or remove the constraint) so the FE's payload doesn't 422.
- The existing `loan.status.changed` Activity Log event covers WRITE-OFF automatically — `from` will be `ACTIVE`/`PENDING`/whatever the prior status was, `to` will be `WRITE-OFF`. No new event key needed.
- AGENT.md §4 RBAC matrix row `Loans: delete` still reflects the old language. The product owner may want to rename it to "Loans: write-off" before final sign-off, but that's a docs-only edit.

**Verification — Write-off (all green)**
- `npm run typecheck` — clean.
- `npm run lint` — clean.
- `npm test` — 80/80 across 24 suites.
- `npm run build` — clean.

## 3. Next steps

1. **Manual UI walk** — log in as `smoke-admin-…@example.com` / `SmokePass123!` (or the canonical `admin@lms.co.zw` once its password is known) and click through:
   - `/dashboard` — confirm SPEC §13 metric numbers match the JSON contract.
   - `/borrowers` and `/borrowers/[id]` — KYC tab now reads `createdAt`; verify "Uploaded {date}" lines render.
   - `/loans/[id]` edit form — confirm date inputs prefill from clipped ISO.
   - `/imports/intake|approvals|repayments` — drive at least one round of each with a real `.xlsx`.
   - `/admin/audit` — confirm `summary`, source badges, and `JsonDiffModal` render against live activity rows.
2. **RBAC walk** — log in as each non-admin role and confirm visibility / write-gating matches the AGENT.md §4 matrix.
3. **DESIGN walk** — tabular numerics, status-badge colors, and human-readable activity summaries per DESIGN §1 / §5 / §6 in a real browser.
4. **Per-slice DoD master sweep** — Appendix E checklist against the live system.
