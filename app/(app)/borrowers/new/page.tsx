import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BorrowerForm } from "@/components/borrowers/BorrowerForm";
import { getSessionUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";

export const metadata = {
  title: "New borrower — Loan Management",
};

export default function NewBorrowerPage() {
  const user = getSessionUser();
  if (!user) redirect("/login");
  if (!can(user.role, "borrowers.write")) redirect("/borrowers");

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link
        href="/borrowers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden /> Back to borrowers
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>New borrower</CardTitle>
        </CardHeader>
        <CardContent>
          <BorrowerForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
