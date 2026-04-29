"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RepaymentForm } from "./RepaymentForm";

export function RecordRepaymentDialog({
  loanId,
  trigger,
}: {
  loanId: string | number;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4" aria-hidden /> Record repayment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record repayment</DialogTitle>
          <DialogDescription>
            Status (CORRECT / OVER / UNDER) is derived from the loan&apos;s
            scheduled repayment amount.
          </DialogDescription>
        </DialogHeader>
        <RepaymentForm
          mode="create"
          loanId={loanId}
          lockLoanId
          onCompleted={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
