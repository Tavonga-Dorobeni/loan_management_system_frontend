import { redirect } from "next/navigation";
import { ExcelImportWizard } from "@/components/imports/ExcelImportWizard";
import { ImportsSidebar } from "@/components/imports/ImportsSidebar";
import { getSessionUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";

export const metadata = {
  title: "Repayment import — Loan Management",
};

export default function RepaymentsImportPage() {
  const user = getSessionUser();
  if (!user) redirect("/login");
  if (!can(user.role, "imports.repayments")) redirect("/imports/intake");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Bulk imports</h1>
        <p className="text-sm text-muted-foreground">
          Record repayments in bulk. Status (CORRECT / OVER / UNDER) is derived per row.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[200px,1fr]">
        <ImportsSidebar role={user.role} />
        <ExcelImportWizard
          kind="repayments"
          title="Repayments"
          description="Each row creates a repayment and atomically mutates the loan balance. Pick the period the file applies to."
          requirePeriod
        />
      </div>
    </div>
  );
}
