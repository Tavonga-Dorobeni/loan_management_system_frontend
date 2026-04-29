"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, toastApiError } from "@/components/toasts";
import { ApiError } from "@/lib/api-client";
import {
  createBorrower,
  updateBorrower,
  type Borrower,
} from "@/lib/api/borrowers";
import {
  createBorrowerSchema,
  contactOnlyBorrowerSchema,
  type CreateBorrowerInput,
  type ContactOnlyBorrowerInput,
} from "@/schemas/borrower";

type Mode = "create" | "edit" | "edit-contact-only";

type CreateProps = { mode: "create"; borrower?: never };
type EditProps = { mode: Exclude<Mode, "create">; borrower: Borrower };
type Props = CreateProps | EditProps;

type ContactOnlyInput = ContactOnlyBorrowerInput;
type FullInput = CreateBorrowerInput;

const FULL_FIELDS = [
  "firstName",
  "lastName",
  "ecNumber",
  "idNumber",
  "phoneNumber",
  "email",
] as const;
const CONTACT_FIELDS = ["phoneNumber", "email"] as const;

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

export function BorrowerForm(props: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const isEdit = props.mode !== "create";
  const isContactOnly = props.mode === "edit-contact-only";

  const defaults: Partial<FullInput & ContactOnlyInput> = isEdit
    ? {
        firstName: props.borrower.firstName,
        lastName: props.borrower.lastName,
        ecNumber: props.borrower.ecNumber,
        idNumber: props.borrower.idNumber,
        phoneNumber: props.borrower.phoneNumber ?? "",
        email: props.borrower.email ?? "",
      }
    : { firstName: "", lastName: "", ecNumber: "", idNumber: "", phoneNumber: "", email: "" };

  const form = useForm<FullInput | ContactOnlyInput>({
    resolver: zodResolver(isContactOnly ? contactOnlyBorrowerSchema : createBorrowerSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  async function onSubmit(values: FullInput | ContactOnlyInput) {
    setSubmitting(true);
    try {
      // Normalize empty strings to null for nullable fields.
      const payload = {
        ...values,
        phoneNumber: values.phoneNumber === "" ? null : values.phoneNumber ?? null,
        email: values.email === "" ? null : values.email ?? null,
      };

      let saved: Borrower;
      if (isEdit) {
        saved = await updateBorrower(props.borrower.id, payload as Partial<Borrower>);
        toast.success("Borrower updated");
      } else {
        saved = await createBorrower(payload as Omit<Borrower, "id" | "createdAt" | "updatedAt">);
        toast.success("Borrower created");
      }
      router.push(`/borrowers/${saved.id}`);
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        const allowed = isContactOnly ? CONTACT_FIELDS : FULL_FIELDS;
        const mapped = applyFieldErrors(e.fieldErrors, allowed, setError as never);
        if (!mapped) toastApiError(e);
      } else {
        toastApiError(e);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const cancelHref = isEdit ? `/borrowers/${props.borrower.id}` : "/borrowers";
  const errs = errors as Record<string, { message?: string } | undefined>;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {!isContactOnly && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                disabled={submitting}
                aria-invalid={errs.firstName ? true : undefined}
                {...register("firstName" as never)}
              />
              {errs.firstName && (
                <p role="alert" className="text-xs text-danger">
                  {errs.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                disabled={submitting}
                aria-invalid={errs.lastName ? true : undefined}
                {...register("lastName" as never)}
              />
              {errs.lastName && (
                <p role="alert" className="text-xs text-danger">
                  {errs.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ecNumber">EC number</Label>
              <Input
                id="ecNumber"
                className="font-mono"
                disabled={submitting}
                aria-invalid={errs.ecNumber ? true : undefined}
                {...register("ecNumber" as never)}
              />
              {errs.ecNumber && (
                <p role="alert" className="text-xs text-danger">
                  {errs.ecNumber.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="idNumber">ID number</Label>
              <Input
                id="idNumber"
                className="font-mono"
                disabled={submitting}
                aria-invalid={errs.idNumber ? true : undefined}
                {...register("idNumber" as never)}
              />
              {errs.idNumber && (
                <p role="alert" className="text-xs text-danger">
                  {errs.idNumber.message}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber">Phone number</Label>
          <Input
            id="phoneNumber"
            autoComplete="tel"
            disabled={submitting}
            aria-invalid={errs.phoneNumber ? true : undefined}
            {...register("phoneNumber" as never)}
          />
          {errs.phoneNumber && (
            <p role="alert" className="text-xs text-danger">
              {errs.phoneNumber.message}
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            disabled={submitting}
            aria-invalid={errs.email ? true : undefined}
            {...register("email" as never)}
          />
          {errs.email && (
            <p role="alert" className="text-xs text-danger">
              {errs.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button asChild variant="ghost" size="sm" disabled={submitting}>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isEdit ? "Save changes" : "Create borrower"}
        </Button>
      </div>
    </form>
  );
}
