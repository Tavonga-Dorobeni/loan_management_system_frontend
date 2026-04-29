"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast, toastApiError } from "@/components/toasts";
import { ApiError } from "@/lib/api-client";
import { createLoan, updateLoan, type Loan } from "@/lib/api/loans";
import { createLoanSchema, type CreateLoanInput } from "@/schemas/loan";

type Mode = "create" | "edit" | "edit-status-only";

type CreateProps = { mode: "create"; loan?: never };
type EditProps = { mode: Exclude<Mode, "create">; loan: Loan };
type Props = CreateProps | EditProps;

const STATUSES = ["PENDING", "SUCCESS", "FAILED"] as const;

// Status values the SPEC enumerates today; the column is also fed by approval
// imports which may emit other strings, so accept any non-empty string.
const statusOnlySchema = z.object({
  status: z.string().min(1),
  message: z.string().nullable().optional(),
});
type StatusOnlyInput = z.infer<typeof statusOnlySchema>;

const FULL_FIELDS = [
  "borrowerId",
  "referenceNumber",
  "type",
  "status",
  "startDate",
  "endDate",
  "disbursementDate",
  "repaymentAmount",
  "totalAmount",
  "amountPaid",
  "amountDue",
  "message",
] as const;
const STATUS_ONLY_FIELDS = ["status", "message"] as const;

function applyFieldErrors(
  fieldErrors: Record<string, string | string[]> | undefined,
  allowed: readonly string[],
  setError: (name: string, error: { type: string; message: string }) => void,
): boolean {
  if (!fieldErrors) return false;
  let any = false;
  for (const [field, msg] of Object.entries(fieldErrors)) {
    if (allowed.includes(field)) {
      setError(field, { type: "server", message: Array.isArray(msg) ? msg[0] : msg });
      any = true;
    }
  }
  return any;
}

export function LoanForm(props: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const isEdit = props.mode !== "create";
  const isStatusOnly = props.mode === "edit-status-only";

  // Backend returns startDate/endDate/disbursementDate as full ISO timestamps.
  // <input type="date"> needs YYYY-MM-DD, so clip before populating the form.
  const dateOnly = (v: string | null | undefined): string =>
    v ? v.slice(0, 10) : "";

  const fullDefaults: Partial<CreateLoanInput> = isEdit
    ? {
        borrowerId: props.loan.borrowerId,
        referenceNumber: props.loan.referenceNumber,
        type: props.loan.type,
        status: props.loan.status,
        startDate: dateOnly(props.loan.startDate),
        endDate: dateOnly(props.loan.endDate),
        disbursementDate: dateOnly(props.loan.disbursementDate) || undefined,
        repaymentAmount: props.loan.repaymentAmount,
        totalAmount: props.loan.totalAmount,
        amountPaid: props.loan.amountPaid ?? undefined,
        amountDue: props.loan.amountDue ?? undefined,
        message: props.loan.message ?? "",
      }
    : {
        referenceNumber: "",
        type: "",
        status: "PENDING",
        startDate: "",
        endDate: "",
        repaymentAmount: 0,
        totalAmount: 0,
        message: "",
      };

  const statusOnlyDefaults: Partial<StatusOnlyInput> = isEdit
    ? { status: props.loan.status, message: props.loan.message ?? "" }
    : { status: "PENDING", message: "" };

  const form = useForm<CreateLoanInput | StatusOnlyInput>({
    resolver: zodResolver(isStatusOnly ? statusOnlySchema : createLoanSchema),
    defaultValues: (isStatusOnly ? statusOnlyDefaults : fullDefaults) as never,
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;
  const errs = errors as Record<string, { message?: string } | undefined>;

  async function onSubmit(values: CreateLoanInput | StatusOnlyInput) {
    setSubmitting(true);
    try {
      const payload: Partial<Loan> = { ...(values as Partial<Loan>) };
      if (payload.message === "") payload.message = null;

      let saved: Loan;
      if (isEdit) {
        saved = await updateLoan(props.loan.id, payload);
        toast.success("Loan updated");
      } else {
        saved = await createLoan(payload);
        toast.success("Loan created");
      }
      router.push(`/loans/${saved.id}`);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        const allowed = isStatusOnly ? STATUS_ONLY_FIELDS : FULL_FIELDS;
        const mapped = applyFieldErrors(e.fieldErrors, allowed, setError as never);
        if (!mapped) toastApiError(e);
      } else {
        toastApiError(e);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const cancelHref = isEdit ? `/loans/${props.loan.id}` : "/loans";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {!isStatusOnly && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="referenceNumber">Reference number</Label>
              <Input
                id="referenceNumber"
                className="font-mono"
                disabled={submitting}
                aria-invalid={errs.referenceNumber ? true : undefined}
                {...register("referenceNumber" as never)}
              />
              {errs.referenceNumber && (
                <p role="alert" className="text-xs text-danger">
                  {errs.referenceNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="borrowerId">Borrower ID</Label>
              <Input
                id="borrowerId"
                disabled={submitting}
                readOnly={isEdit}
                aria-invalid={errs.borrowerId ? true : undefined}
                {...register("borrowerId" as never)}
              />
              {errs.borrowerId && (
                <p role="alert" className="text-xs text-danger">
                  {errs.borrowerId.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                disabled={submitting}
                aria-invalid={errs.type ? true : undefined}
                {...register("type" as never)}
              />
              {errs.type && (
                <p role="alert" className="text-xs text-danger">
                  {errs.type.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disbursementDate">Disbursement date</Label>
              <Input
                id="disbursementDate"
                type="date"
                disabled={submitting}
                {...register("disbursementDate" as never)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                disabled={submitting}
                aria-invalid={errs.startDate ? true : undefined}
                {...register("startDate" as never)}
              />
              {errs.startDate && (
                <p role="alert" className="text-xs text-danger">
                  {errs.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                disabled={submitting}
                aria-invalid={errs.endDate ? true : undefined}
                {...register("endDate" as never)}
              />
              {errs.endDate && (
                <p role="alert" className="text-xs text-danger">
                  {errs.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="repaymentAmount">Repayment amount</Label>
              <Input
                id="repaymentAmount"
                type="number"
                step="0.01"
                min="0"
                className="numeric"
                disabled={submitting}
                aria-invalid={errs.repaymentAmount ? true : undefined}
                {...register("repaymentAmount" as never, { valueAsNumber: true })}
              />
              {errs.repaymentAmount && (
                <p role="alert" className="text-xs text-danger">
                  {errs.repaymentAmount.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="totalAmount">Total amount</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                min="0"
                className="numeric"
                disabled={submitting}
                aria-invalid={errs.totalAmount ? true : undefined}
                {...register("totalAmount" as never, { valueAsNumber: true })}
              />
              {errs.totalAmount && (
                <p role="alert" className="text-xs text-danger">
                  {errs.totalAmount.message}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="status">Status</Label>
          <Select id="status" disabled={submitting} {...register("status" as never)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Input
          id="message"
          disabled={submitting}
          {...register("message" as never)}
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button asChild variant="ghost" size="sm" disabled={submitting}>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isEdit ? "Save changes" : "Create loan"}
        </Button>
      </div>
    </form>
  );
}
