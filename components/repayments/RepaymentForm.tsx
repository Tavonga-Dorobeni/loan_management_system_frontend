"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast, toastApiError } from "@/components/toasts";
import { ApiError } from "@/lib/api-client";
import {
  createRepayment,
  getLoanSchedule,
  updateRepayment,
  type LoanScheduleSlot,
  type Repayment,
} from "@/lib/api/repayments";
import {
  createRepaymentSchema,
  type CreateRepaymentInput,
} from "@/schemas/repayment";
import { formatCurrency } from "@/lib/format/currency";
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

const FIELDS = [
  "loanId",
  "amount",
  "transactionDate",
  "periodYear",
  "periodMonth",
] as const;

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

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

function slotKey(slot: { year: number; month: number }) {
  return `${slot.year}-${String(slot.month).padStart(2, "0")}`;
}

function pickDefaultSlot(slots: LoanScheduleSlot[] | undefined): LoanScheduleSlot | null {
  if (!slots || slots.length === 0) return null;
  const firstNonCovered = slots.find((s) => s.status !== "COVERED");
  return firstNonCovered ?? slots[slots.length - 1];
}

export function RepaymentForm(props: Props) {
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const isEdit = props.mode === "edit";
  const lockLoanId = props.lockLoanId ?? false;

  const initialPeriod = isEdit
    ? { periodYear: props.repayment.periodYear, periodMonth: props.repayment.periodMonth }
    : { periodYear: 0, periodMonth: 0 };

  const defaults: Partial<CreateRepaymentInput> = isEdit
    ? {
        loanId: props.repayment.loanId,
        amount: props.repayment.amount,
        transactionDate: props.repayment.transactionDate.slice(0, 10),
        periodYear: props.repayment.periodYear,
        periodMonth: props.repayment.periodMonth,
      }
    : {
        loanId: props.loanId,
        amount: 0,
        transactionDate: toIsoDate(new Date()),
        periodYear: initialPeriod.periodYear,
        periodMonth: initialPeriod.periodMonth,
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
    setValue,
    watch,
    formState: { errors },
  } = form;

  const watchedLoanId = watch("loanId");
  const watchedYear = watch("periodYear");
  const watchedMonth = watch("periodMonth");

  const scheduleQ = useQuery({
    queryKey: ["loan-schedule", String(watchedLoanId ?? "")],
    queryFn: () => getLoanSchedule(watchedLoanId as string | number),
    enabled: Boolean(watchedLoanId),
  });

  const slots = useMemo<LoanScheduleSlot[]>(
    () => scheduleQ.data ?? [],
    [scheduleQ.data],
  );

  // Auto-default the period field once the schedule loads, but only when the user
  // hasn't already chosen one (or in edit mode where we keep the persisted value).
  useEffect(() => {
    if (isEdit) return;
    if (!scheduleQ.data) return;
    if (watchedYear && watchedMonth) return;
    const def = pickDefaultSlot(scheduleQ.data);
    if (def) {
      setValue("periodYear", def.year, { shouldValidate: true });
      setValue("periodMonth", def.month, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleQ.data, isEdit]);

  const selectedSlot = useMemo(
    () =>
      slots.find(
        (s) => s.year === Number(watchedYear) && s.month === Number(watchedMonth),
      ) ?? null,
    [slots, watchedYear, watchedMonth],
  );

  function handlePeriodChange(value: string) {
    if (!value) {
      setValue("periodYear", 0);
      setValue("periodMonth", 0);
      return;
    }
    const [y, m] = value.split("-").map(Number);
    setValue("periodYear", y, { shouldValidate: true });
    setValue("periodMonth", m, { shouldValidate: true });
  }

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
        queryClient.invalidateQueries({ queryKey: ["repayment-schedule"] }),
        queryClient.invalidateQueries({ queryKey: ["loan-schedule", String(loanId)] }),
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

  const periodValue =
    watchedYear && watchedMonth
      ? slotKey({ year: Number(watchedYear), month: Number(watchedMonth) })
      : "";

  const periodError = errors.periodYear?.message || errors.periodMonth?.message;

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

      <div className="space-y-1.5">
        <Label htmlFor="period">Period</Label>
        <Select
          id="period"
          aria-label="Period"
          aria-invalid={periodError ? true : undefined}
          value={periodValue}
          onChange={(e) => handlePeriodChange(e.target.value)}
          disabled={submitting || !watchedLoanId || scheduleQ.isLoading}
        >
          <option value="" disabled>
            {scheduleQ.isLoading
              ? "Loading schedule…"
              : !watchedLoanId
              ? "Enter a loan ID first"
              : slots.length === 0
              ? "No periods available"
              : "Select a period"}
          </option>
          {slots.map((s) => (
            <option
              key={slotKey(s)}
              value={slotKey(s)}
              disabled={s.status === "COVERED"}
            >
              {SHORT_MONTHS[s.month - 1]} {s.year}
              {s.status === "COVERED" ? " — paid" : s.status === "PARTIAL" ? " — partial" : ""}
            </option>
          ))}
        </Select>
        {selectedSlot && (
          <p className="text-xs text-muted-foreground">
            Cumulative received: {formatCurrency(selectedSlot.cumulativeReceived)} of{" "}
            {formatCurrency(selectedSlot.expected)}
          </p>
        )}
        {periodError && (
          <p role="alert" className="text-xs text-danger">
            {periodError as string}
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
