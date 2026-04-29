import { redirect } from "next/navigation";
import { ExcelImportWizard } from "@/components/imports/ExcelImportWizard";
import { ImportsSidebar } from "@/components/imports/ImportsSidebar";
import { getSessionUser } from "@/lib/auth/session";
import { can } from "@/lib/rbac";

export const metadata = {
  title: "Loan approvals import — Loan Management",
};

export default function ApprovalsImportPage() {
  const user = getSessionUser();
  if (!user) redirect("/login");
  if (!can(user.role, "imports.approvals")) redirect("/imports/intake");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Bulk imports</h1>
        <p className="text-sm text-muted-foreground">
          Apply approval outcomes to existing loans. SUCCESS rows initialize amountPaid + amountDue.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[200px,1fr]">
        <ImportsSidebar role={user.role} />
        <ExcelImportWizard
          kind="approvals"
          title="Loan approvals"
          description="Set status from column G, message from column O. SUCCESS computes amountDue from start/end dates."
        />
      </div>
    </div>
  );
}
