import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanForm } from "@/components/loans/LoanForm";
import { LoanBalanceCard } from "@/components/loans/LoanBalanceCard";
import { RepaymentHistoryTable } from "@/components/loans/RepaymentHistoryTable";
import { LoanStatusTimeline } from "@/components/loans/LoanStatusTimeline";
import { WriteOffLoanDialog } from "@/components/loans/WriteOffLoanDialog";
import { RecordRepaymentDialog } from "@/components/repayments/RecordRepaymentDialog";
import { ApiError } from "@/lib/api-client";
import { getLoanDetails } from "@/lib/api/loans";
import { getSessionUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";

export const metadata = {
  title: "Loan — Loan Management",
};

export default async function LoanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = getSessionUser();
  if (!user) redirect("/login");

  let details;
  try {
    details = await getLoanDetails(params.id);
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) notFound();
    throw e;
  }

  const { loan, borrower } = details;
  const canWrite = can(user.role, "loans.write");
  const canStatusOnly = can(user.role, "loans.writeStatusOnly");
  const canWriteOff = can(user.role, "loans.writeOff");
  const canRecordRepayment = can(user.role, "repayments.write");
  const formMode = canWrite ? "edit" : canStatusOnly ? "edit-status-only" : null;

  return (
    <div className="space-y-4">
      <Link
        href="/loans"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden /> Back to loans
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-semibold">{loan.referenceNumber}</h1>
          <p className="text-sm text-muted-foreground">
            <Link
              href={`/borrowers/${borrower.id}`}
              className="hover:underline"
            >
              {borrower.firstName} {borrower.lastName}
            </Link>{" "}
            · {loan.type}
          </p>
        </div>
        {canWriteOff && (
          <WriteOffLoanDialog
            loanId={loan.id}
            loanLabel={`Loan ${loan.referenceNumber}`}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
              <CardDescription>
                {formMode === "edit-status-only"
                  ? "You can update status and message only."
                  : formMode
                    ? "Edit loan terms and status."
                    : "Read-only loan record."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formMode ? (
                <LoanForm mode={formMode} loan={loan} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  You don&apos;t have permission to edit this loan.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>Repayment history</CardTitle>
                {canRecordRepayment && <RecordRepaymentDialog loanId={loan.id} />}
              </div>
            </CardHeader>
            <CardContent>
              <RepaymentHistoryTable loanId={loan.id} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <LoanBalanceCard details={details} />
          <Card>
            <CardHeader>
              <CardTitle>Status timeline</CardTitle>
              <CardDescription>Status changes from the audit log.</CardDescription>
            </CardHeader>
            <CardContent>
              <LoanStatusTimeline loanId={loan.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
