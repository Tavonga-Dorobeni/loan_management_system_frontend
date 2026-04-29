import { redirect } from "next/navigation";
import { ExcelImportWizard } from "@/components/imports/ExcelImportWizard";
import { ImportsSidebar } from "@/components/imports/ImportsSidebar";
import { getSessionUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";

export const metadata = {
  title: "Loan intake import — Loan Management",
};

export default function IntakeImportPage() {
  const user = getSessionUser();
  if (!user) redirect("/login");
  if (!can(user.role, "imports.intake")) {
    if (can(user.role, "imports.approvals")) redirect("/imports/approvals");
    if (can(user.role, "imports.repayments")) redirect("/imports/repayments");
    redirect("/dashboard");
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Bulk imports</h1>
        <p className="text-sm text-muted-foreground">
          Excel-driven loan operations. Headers in row 1; data starts at row 2.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[200px,1fr]">
        <ImportsSidebar role={user.role} />
        <ExcelImportWizard
          kind="intake"
          title="Loan intake"
          description="Create loans from a borrower roster. Cents from columns G and I are converted to dollars on the way in."
        />
      </div>
    </div>
  );
}
