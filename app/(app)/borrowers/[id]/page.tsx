import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { BorrowerTabs } from "@/components/borrowers/BorrowerTabs";
import { DeleteBorrowerDialog } from "@/components/borrowers/DeleteBorrowerDialog";
import { ApiError } from "@/lib/api-client";
import { getBorrower } from "@/lib/api/borrowers";
import { getSessionUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";

export const metadata = {
  title: "Borrower — Loan Management",
};

export default async function BorrowerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const user = getSessionUser();
  if (!user) redirect("/login");

  let borrower;
  try {
    borrower = await getBorrower(params.id);
  } catch (e) {
    if (e instanceof ApiError && e.statusCode === 404) notFound();
    throw e;
  }

  const fullName = `${borrower.firstName} ${borrower.lastName}`;
  const canDelete = can(user.role, "borrowers.delete");

  return (
    <div className="space-y-4">
      <Link
        href="/borrowers"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden /> Back to borrowers
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{fullName}</h1>
          <p className="font-mono text-sm text-muted-foreground">
            EC {borrower.ecNumber} · ID {borrower.idNumber}
          </p>
        </div>
        {canDelete && (
          <DeleteBorrowerDialog borrowerId={borrower.id} borrowerLabel={fullName} />
        )}
      </div>

      <BorrowerTabs borrower={borrower} />
    </div>
  );
}
