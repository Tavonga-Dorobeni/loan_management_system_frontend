"use client";

import { useId, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast, toastApiError } from "@/components/toasts";
import { uploadKyc, type KycDocumentType } from "@/lib/api/kyc";
import { ALLOWED_KYC_MIME, MAX_KYC_BYTES } from "@/schemas/kyc";

const DOC_TYPE_LABELS: Record<KycDocumentType, string> = {
  payslip: "Payslip",
  national_id: "National ID",
  passport_sized_photo: "Passport photo",
  application_form: "Application form",
};

export function KycUploadDialog({
  borrowerId,
  documentType,
  trigger,
}: {
  borrowerId: string | number;
  documentType: KycDocumentType;
  trigger?: React.ReactNode;
}) {
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  function reset() {
    setError(null);
    setFile(null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }
    if (!(ALLOWED_KYC_MIME as readonly string[]).includes(file.type)) {
      setError("Unsupported file type. Use JPG, PNG, or PDF.");
      return;
    }
    if (file.size > MAX_KYC_BYTES) {
      setError("File exceeds 10 MB.");
      return;
    }

    const fd = new FormData();
    fd.append("borrowerId", String(borrowerId));
    fd.append("documentType", documentType);
    fd.append("file", file);

    setSubmitting(true);
    try {
      await uploadKyc(fd);
      toast.success(`${DOC_TYPE_LABELS[documentType]} uploaded`);
      reset();
      setOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["kyc", "borrower", borrowerId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["borrower-profile", borrowerId],
      });
    } catch (e) {
      toastApiError(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4" aria-hidden /> Upload
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload {DOC_TYPE_LABELS[documentType]}</DialogTitle>
          <DialogDescription>
            JPG, PNG, or PDF up to 10 MB.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor={inputId}>File</Label>
            <Input
              id={inputId}
              type="file"
              accept={ALLOWED_KYC_MIME.join(",")}
              disabled={submitting}
              aria-invalid={error ? true : undefined}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {error && (
              <p role="alert" className="text-xs text-danger">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Upload file
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
