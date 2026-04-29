import { z } from "zod";
import { KYC_DOCUMENT_TYPES } from "@/lib/api/kyc";

export const MAX_KYC_BYTES = 10 * 1024 * 1024;
export const ALLOWED_KYC_MIME = ["image/jpeg", "image/png", "application/pdf"] as const;

export const kycUploadSchema = z.object({
  borrowerId: z.union([z.number(), z.string()]),
  documentType: z.enum(KYC_DOCUMENT_TYPES),
  file: z
    .instanceof(File, { message: "File is required" })
    .refine((f) => f.size <= MAX_KYC_BYTES, "File exceeds 10 MB")
    .refine(
      (f) => (ALLOWED_KYC_MIME as readonly string[]).includes(f.type),
      "Unsupported file type",
    ),
});
export type KycUploadInput = z.infer<typeof kycUploadSchema>;
