"use client";

import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import {
  KYC_DOCUMENT_TYPES,
  listKycByBorrower,
  type KycDocument,
  type KycDocumentType,
} from "@/lib/api/kyc";
import { formatDateTime } from "@/lib/format/date";
import { KycUploadDialog } from "./KycUploadDialog";
import { KycPreviewButton } from "./KycPreviewButton";

const DOC_TYPE_LABELS: Record<KycDocumentType, string> = {
  payslip: "Payslip",
  national_id: "National ID",
  passport_sized_photo: "Passport photo",
  application_form: "Application form",
};

const DOC_TYPE_DESCRIPTIONS: Record<KycDocumentType, string> = {
  payslip: "Most recent monthly payslip.",
  national_id: "National ID card or government-issued identifier.",
  passport_sized_photo: "Recent passport-style photograph.",
  application_form: "Signed loan application form.",
};

function pickLatest(items: KycDocument[], type: KycDocumentType): KycDocument | null {
  const filtered = items.filter((d) => d.documentType === type);
  if (filtered.length === 0) return null;
  return filtered.reduce((acc, cur) => {
    const a = acc.createdAt ? Date.parse(acc.createdAt) : 0;
    const b = cur.createdAt ? Date.parse(cur.createdAt) : 0;
    return b > a ? cur : acc;
  });
}

export function KycDocumentGrid({ borrowerId }: { borrowerId: string | number }) {
  const { can } = useAuth();
  const canUpload = can("kyc.upload");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["kyc", "borrower", borrowerId],
    queryFn: () => listKycByBorrower(borrowerId),
  });

  if (isError) {
    return (
      <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
        Couldn&apos;t load KYC documents.
      </p>
    );
  }

  const items = data?.items ?? [];

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {KYC_DOCUMENT_TYPES.map((type) => {
        const latest = pickLatest(items, type);
        const present = !!latest;
        return (
          <Card key={type}>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileText className="h-4 w-4 text-muted-foreground" aria-hidden />
                    {DOC_TYPE_LABELS[type]}
                  </CardTitle>
                  <CardDescription>{DOC_TYPE_DESCRIPTIONS[type]}</CardDescription>
                </div>
                {present ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" aria-hidden /> Uploaded
                  </Badge>
                ) : (
                  <Badge variant="secondary">Missing</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-muted-foreground">
                  {isLoading
                    ? "Loading…"
                    : present && latest.createdAt
                      ? `Uploaded ${formatDateTime(latest.createdAt)}`
                      : "Not yet uploaded"}
                </div>
                <div className="flex items-center gap-2">
                  {present && latest && <KycPreviewButton signedUrl={latest.signedUrl} />}
                  {canUpload && (
                    <KycUploadDialog borrowerId={borrowerId} documentType={type} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
