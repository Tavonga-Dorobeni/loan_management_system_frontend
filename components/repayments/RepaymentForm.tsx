"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, toastApiError } from "@/components/toasts";
import { ApiError } from "@/lib/api-client";
import {
  createRepayment,
  updateRepayment,
  type Repayment,
} from "@/lib/api/repayments";
import {
  createRepaymentSchema,
  type CreateRepaymentInput,
} from "@/schemas/repayment";
import { toIsoDate } from "@/lib/format/date";

type CreateProps = {
  mode: "create";
  loanId: string | number;
  lockLoanId?: boolean;
  onCompleted?: () => void;
};
type EditProps = {
  mode: "edit";
  repayment: Repayment;
  lockLoanId?: boolean;
  onCompleted?: () => void;
};
type Props = CreateProps | EditProps;

const FIELDS = ["loanId", "amount", "transactionDate"] as const;

function applyFieldErrors(
  fieldErrors: Record<string, string | string[]> | undefined,
  setError: (name: string, error: { type: string; message: string }) => void,
): boolean {
  if (!fieldErrors) return false;
  let any = false;
  for (const [field, msg] of Object.entries(fieldErrors)) {
    if ((FIELDS as readonly string[]).includes(field)) {
      setError(field, { type: "server", message: Array.isArray(msg) ? msg[0] : msg });
      any = true;
    }
  }
  return any;
}

export function RepaymentForm(props: Props) {
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = props.mode === "edit";
  const lockLoanId = props.lockLoanId ?? false;

  const defaults: Partial<CreateRepaymentInput> = isEdit
    ? {
        loanId: props.repayment.loanId,
        amount: props.repayment.amount,
        transactionDate: props.repayment.transactionDate.slice(0, 10),
      }
    : {
        loanId: props.loanId,
        amount: 0,
        transactionDate: toIsoDate(new Date()),
      };

  const form = useForm<CreateRepaymentInput>({
    resolver: zodResolver(createRepaymentSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  async function onSubmit(values: CreateRepaymentInput) {
    setSubmitting(true);
    try {
      let saved: Repayment;
      if (isEdit) {
        saved = await updateRepayment(props.repayment.id, values);
        toast.success("Repayment updated");
      } else {
        saved = await createRepayment(values);
        toast.success(`Repayment recorded (${saved.status})`);
      }
      const loanId = isEdit ? props.repayment.loanId : props.loanId;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["repayments"] }),
        queryClient.invalidateQueries({ queryKey: ["loan-repayments", loanId] }),
        queryClient.invalidateQueries({ queryKey: ["loan-details", loanId] }),
        queryClient.invalidateQueries({ queryKey: ["borrower-profile"] }),
      ]);
      props.onCompleted?.();
    } catch (e) {
      if (e instanceof ApiError) {
        const mapped = applyFieldErrors(e.fieldErrors, setError as never);
        if (!mapped) toastApiError(e);
      } else {
        toastApiError(e);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="loanId">Loan ID</Label>
        <Input
          id="loanId"
          className="font-mono"
          disabled={submitting}
          readOnly={lockLoanId}
          aria-invalid={errors.loanId ? true : undefined}
          {...register("loanId")}
        />
        {errors.loanId && (
          <p role="alert" className="text-xs text-danger">
            {errors.loanId.message as string}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            className="numeric"
            disabled={submitting}
            aria-invalid={errors.amount ? true : undefined}
            {...register("amount", { valueAsNumber: true })}
          />
          {errors.amount && (
            <p role="alert" className="text-xs text-danger">
              {errors.amount.message as string}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="transactionDate">Transaction date</Label>
          <Input
            id="transactionDate"
            type="date"
            disabled={submitting}
            aria-invalid={errors.transactionDate ? true : undefined}
            {...register("transactionDate")}
          />
          {errors.transactionDate && (
            <p role="alert" className="text-xs text-danger">
              {errors.transactionDate.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isEdit ? "Save changes" : "Record repayment"}
        </Button>
      </div>
    </form>
  );
}
