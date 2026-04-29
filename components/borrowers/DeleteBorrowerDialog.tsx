"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
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
import { toast, toastApiError } from "@/components/toasts";
import { deleteBorrower } from "@/lib/api/borrowers";

export function DeleteBorrowerDialog({
  borrowerId,
  borrowerLabel,
}: {
  borrowerId: string | number;
  borrowerLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function onConfirm() {
    setSubmitting(true);
    try {
      await deleteBorrower(borrowerId);
      toast.success(`Deleted ${borrowerLabel}`);
      setOpen(false);
      router.push("/borrowers");
      router.refresh();
    } catch (e) {
      toastApiError(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-danger">
          <Trash2 className="h-4 w-4" aria-hidden /> Delete borrower
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {borrowerLabel}?</DialogTitle>
          <DialogDescription>
            This permanently removes the borrower record. Loans and repayments
            tied to this borrower will be orphaned and may need cleanup.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="ghost" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
