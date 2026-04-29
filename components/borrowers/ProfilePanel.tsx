"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BorrowerForm } from "./BorrowerForm";
import { useAuth } from "@/hooks/useAuth";
import { getBorrowerProfile, type Borrower } from "@/lib/api/borrowers";
import { formatCurrency } from "@/lib/format/currency";

const DOC_TYPE_LABELS: Record<string, string> = {
  payslip: "Payslip",
  national_id: "National ID",
  passport_sized_photo: "Passport photo",
  application_form: "Application form",
};

export function ProfilePanel({ borrower }: { borrower: Borrower }) {
  const { can, role } = useAuth();
  const { data } = useQuery({
    queryKey: ["borrower-profile", borrower.id],
    queryFn: () => getBorrowerProfile(borrower.id),
  });

  const canEdit = can("borrowers.write");
  const canEditContact = role === "customer_support";
  const formMode = canEdit ? "edit" : canEditContact ? "edit-contact-only" : null;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            {formMode === "edit-contact-only"
              ? "You can update phone and email only."
              : formMode
                ? "Edit borrower details."
                : "Read-only profile."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {formMode ? (
            <BorrowerForm mode={formMode} borrower={borrower} />
          ) : (
            <ReadOnlyProfile borrower={borrower} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Stat label="Total loans" value={String(data?.loanSummary.count ?? 0)} />
          <Stat label="Active loans" value={String(data?.loanSummary.activeCount ?? 0)} />
          <Stat
            label="Outstanding due"
            value={formatCurrency(data?.loanSummary.outstandingDue ?? 0)}
          />
          <div className="pt-2">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              KYC completeness
            </h4>
            <ul className="mt-2 space-y-1">
              {(data?.kyc ?? []).map((d) => (
                <li
                  key={d.documentType}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{DOC_TYPE_LABELS[d.documentType] ?? d.documentType}</span>
                  <span className={d.present ? "text-success" : "text-muted-foreground"}>
                    {d.present ? "Provided" : "Missing"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-semibold tabular-nums">{value}</span>
    </div>
  );
}

function ReadOnlyProfile({ borrower }: { borrower: Borrower }) {
  return (
    <dl className="grid gap-3 text-sm sm:grid-cols-2">
      <Field label="First name" value={borrower.firstName} />
      <Field label="Last name" value={borrower.lastName} />
      <Field label="EC number" value={borrower.ecNumber} mono />
      <Field label="ID number" value={borrower.idNumber} mono />
      <Field label="Phone" value={borrower.phoneNumber ?? "—"} />
      <Field label="Email" value={borrower.email ?? "—"} />
    </dl>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={mono ? "font-mono" : undefined}>{value}</dd>
    </div>
  );
}
