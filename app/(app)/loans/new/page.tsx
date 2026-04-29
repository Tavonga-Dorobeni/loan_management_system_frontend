import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoanForm } from "@/components/loans/LoanForm";
import { getSessionUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";

export const metadata = {
  title: "New loan — Loan Management",
};

export default function NewLoanPage() {
  const user = getSessionUser();
  if (!user) redirect("/login");
  if (!can(user.role, "loans.write")) redirect("/loans");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/loans"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden /> Back to loans
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New loan</CardTitle>
        </CardHeader>
        <CardContent>
          <LoanForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
