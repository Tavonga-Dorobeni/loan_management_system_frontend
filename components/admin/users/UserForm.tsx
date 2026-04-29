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
import { Select } from "@/components/ui/select";
import { toast, toastApiError } from "@/components/toasts";
import { ApiError } from "@/lib/api-client";
import { createUser, updateUser, type User } from "@/lib/api/users";
import { createUserSchema, updateUserSchema, type CreateUserInput, type UpdateUserInput } from "@/schemas/user";
import { ROLES } from "@/lib/rbac";

type CreateProps = { mode: "create"; user?: never };
type EditProps = { mode: "edit"; user: User };
type Props = CreateProps | EditProps;

const ROLE_LABELS: Record<(typeof ROLES)[number], string> = {
  admin: "Admin",
  loan_officer: "Loan Officer",
  credit_analyst: "Credit Analyst",
  collections_officer: "Collections Officer",
  customer_support: "Customer Support",
};

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

export function UserForm(props: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const isEdit = props.mode === "edit";
  const defaults: Partial<CreateUserInput & UpdateUserInput> = isEdit
    ? {
        firstName: props.user.firstName,
        lastName: props.user.lastName,
        email: props.user.email,
        role: props.user.role,
        status: props.user.status === "disabled" ? "disabled" : "active",
      }
    : { firstName: "", lastName: "", email: "", role: "loan_officer", password: "" };

  const form = useForm<CreateUserInput | UpdateUserInput>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  async function onSubmit(values: CreateUserInput | UpdateUserInput) {
    setSubmitting(true);
    try {
      if (isEdit) {
        await updateUser(props.user.id, values as UpdateUserInput);
        toast.success("User updated");
      } else {
        await createUser(values as CreateUserInput);
        toast.success("User created");
      }
      router.push("/admin/users");
      router.refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        const allowed = isEdit
          ? ["firstName", "lastName", "email", "role", "status"]
          : ["firstName", "lastName", "email", "role", "password"];
        const mapped = applyFieldErrors(e.fieldErrors, allowed, setError as never);
        if (!mapped) toastApiError(e);
      } else {
        toastApiError(e);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const cancelHref = isEdit ? `/admin/users/${props.user.id}` : "/admin/users";

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            disabled={submitting}
            aria-invalid={errors.firstName ? true : undefined}
            {...register("firstName")}
          />
          {errors.firstName && (
            <p role="alert" className="text-xs text-danger">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            disabled={submitting}
            aria-invalid={errors.lastName ? true : undefined}
            {...register("lastName")}
          />
          {errors.lastName && (
            <p role="alert" className="text-xs text-danger">
              {errors.lastName.message}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          disabled={submitting}
          aria-invalid={errors.email ? true : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p role="alert" className="text-xs text-danger">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="role">Role</Label>
          <Select id="role" disabled={submitting} {...register("role")}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </Select>
          {errors.role && (
            <p role="alert" className="text-xs text-danger">
              {errors.role.message as string}
            </p>
          )}
        </div>

        {isEdit && (
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <Select id="status" disabled={submitting} {...register("status")}>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </Select>
          </div>
        )}
      </div>

      {!isEdit && (
        <div className="space-y-1.5">
          <Label htmlFor="password">Temporary password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            disabled={submitting}
            aria-invalid={"password" in errors && errors.password ? true : undefined}
            {...register("password" as never)}
          />
          {"password" in errors && errors.password && (
            <p role="alert" className="text-xs text-danger">
              {errors.password.message as string}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            User can change this from their profile after the first sign-in.
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button asChild variant="ghost" size="sm" disabled={submitting}>
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {isEdit ? "Save changes" : "Create user"}
        </Button>
      </div>
    </form>
  );
}
