"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Ban, Loader2 } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { toast, toastApiError } from "@/components/toasts";
import { ApiError } from "@/lib/api-client";
import { writeOffLoan } from "@/lib/api/loans";
import { cn } from "@/lib/utils";

const writeOffSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason must be 500 characters or fewer"),
});
type WriteOffValues = z.infer<typeof writeOffSchema>;

export function WriteOffLoanDialog({
  loanId,
  loanLabel,
}: {
  loanId: string | number;
  loanLabel: string;
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
  } = useForm<WriteOffValues>({
    resolver: zodResolver(writeOffSchema),
    defaultValues: { reason: "" },
  });

  async function onSubmit(values: WriteOffValues) {
    try {
      await writeOffLoan(loanId, { reason: values.reason });
      toast.success(`Wrote off ${loanLabel}`);
      await queryClient.invalidateQueries({ queryKey: ["loans"] });
      await queryClient.invalidateQueries({
        queryKey: ["loan-details", String(loanId)],
      });
      setOpen(false);
      reset();
      router.push("/loans");
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        const message =
          e.fieldErrors.reason ?? e.fieldErrors.message ?? null;
        if (message) {
          setError("reason", { message: String(message) });
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
        <Button variant="outline" size="sm" className="text-danger">
          <Ban className="h-4 w-4" aria-hidden /> Write off loan
        </Button>
      </DialogTrigger>
      <DialogContent aria-describedby={undefined}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>Write off {loanLabel}?</DialogTitle>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="write-off-reason">Reason</Label>
            <textarea
              id="write-off-reason"
              rows={4}
              {...register("reason")}
              aria-invalid={errors.reason ? true : undefined}
              className={cn(
                "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                errors.reason && "border-danger",
              )}
              placeholder="Why is this loan being written off?"
            />
            {errors.reason?.message && (
              <p className="text-sm text-danger" role="alert">
                {errors.reason.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              )}
              Write off
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
