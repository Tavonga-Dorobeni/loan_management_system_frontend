import { apiFetch, apiList } from "../api-client";

export const KYC_DOCUMENT_TYPES = [
  "payslip",
  "national_id",
  "passport_sized_photo",
  "application_form",
] as const;

export type KycDocumentType = (typeof KYC_DOCUMENT_TYPES)[number];

export type KycDocument = {
  id: string;
  borrowerId: number | string;
  documentType: KycDocumentType;
  signedUrl: string;
  createdAt: string;
  expiresAt?: string;
  documentUrl?: string;
  storageKey?: string;
  updatedAt?: string;
};

export function listKycByBorrower(borrowerId: string | number) {
  return apiList<KycDocument>(`/borrower-kyc/borrower/${borrowerId}`);
}

export function uploadKyc(form: FormData) {
  return apiFetch<KycDocument>("/borrower-kyc/upload", {
    method: "POST",
    body: form,
  });
}
