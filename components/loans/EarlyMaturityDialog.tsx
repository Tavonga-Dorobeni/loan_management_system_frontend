"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { CalendarClock, Loader2 } from "lucide-react";
import { z } from "zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, toastApiError } from "@/components/toasts";
import { ApiError } from "@/lib/api-client";
import { earlyMatureLoan } from "@/lib/api/loans";
import { formatCurrency } from "@/lib/format/currency";

const earlyMaturitySchema = z.object({
  maturityDate: z
    .string()
    .min(1, "Maturity date is required")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Maturity date must be a valid date"),
});
type EarlyMaturityValues = z.infer<typeof earlyMaturitySchema>;

export function EarlyMaturityDialog({
  loanId,
  loanLabel,
  amountDue,
}: {
  loanId: string | number;
  loanLabel: string;
  amountDue: number;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<EarlyMaturityValues>({
    resolver: zodResolver(earlyMaturitySchema),
    defaultValues: { maturityDate: "" },
  });

  async function onSubmit(values: EarlyMaturityValues) {
    try {
      await earlyMatureLoan(loanId, { maturityDate: values.maturityDate });
      toast.success(`Early maturity recorded for ${loanLabel}`);
      await queryClient.invalidateQueries({ queryKey: ["loans"] });
      await queryClient.invalidateQueries({
        queryKey: ["loan-details", String(loanId)],
      });
      setOpen(false);
      reset();
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        const dateMsg =
          e.fieldErrors.maturityDate ?? e.fieldErrors.endDate ?? null;
        if (dateMsg) {
          setError("maturityDate", { message: String(dateMsg) });
        }
      }
      toastApiError(e);
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
        <Button variant="outline" size="sm">
          <CalendarClock className="h-4 w-4" aria-hidden /> Early maturity
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Early maturity for {loanLabel}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="early-maturity-amount">Expected Amount</Label>
              <Input
                id="early-maturity-amount"
                readOnly
                value={formatCurrency(amountDue)}
                className="numeric bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="early-maturity-date">Maturity Date</Label>
              <Input
                id="early-maturity-date"
                type="date"
                {...register("maturityDate")}
                aria-invalid={errors.maturityDate ? true : undefined}
              />
              {errors.maturityDate?.message && (
                <p className="text-sm text-danger" role="alert">
                  {errors.maturityDate.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              )}
              Confirm
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
