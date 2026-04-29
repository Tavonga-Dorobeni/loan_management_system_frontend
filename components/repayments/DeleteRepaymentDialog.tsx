"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
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
import { deleteRepayment } from "@/lib/api/repayments";

export function DeleteRepaymentDialog({
  repaymentId,
  loanId,
  trigger,
}: {
  repaymentId: string | number;
  loanId: string | number;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  async function onConfirm() {
    setSubmitting(true);
    try {
      await deleteRepayment(repaymentId);
      toast.success("Repayment deleted");
      setOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["repayments"] }),
        queryClient.invalidateQueries({ queryKey: ["loan-repayments", loanId] }),
        queryClient.invalidateQueries({ queryKey: ["loan-details", loanId] }),
      ]);
    } catch (e) {
      toastApiError(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="sm" className="text-danger">
            <Trash2 className="h-4 w-4" aria-hidden /> Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete repayment?</DialogTitle>
          <DialogDescription>
            This reverses the loan balance changes from this repayment.
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
