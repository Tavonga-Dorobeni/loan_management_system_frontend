"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast, toastApiError } from "@/components/toasts";
import { ApiError } from "@/lib/api-client";
import { changePassword } from "@/lib/api/users";
import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/user";

export function ChangePasswordModal({
  userId,
  isSelf,
  trigger,
}: {
  userId: string | number;
  isSelf: boolean;
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = form;

  async function onSubmit(values: ChangePasswordInput) {
    setSubmitting(true);
    try {
      await changePassword(userId, {
        currentPassword: isSelf ? values.currentPassword : undefined,
        newPassword: values.newPassword,
      });
      toast.success("Password updated");
      reset();
      setOpen(false);
    } catch (e) {
      if (e instanceof ApiError && e.fieldErrors) {
        for (const [field, msg] of Object.entries(e.fieldErrors)) {
          if (field === "currentPassword" || field === "newPassword") {
            setError(field, {
              type: "server",
              message: Array.isArray(msg) ? msg[0] : msg,
            });
          }
        }
        return;
      }
      toastApiError(e);
    } finally {
      setSubmitting(false);
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
        {trigger ?? (
          <Button variant="outline" size="sm">
            Change password
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            {isSelf
              ? "Enter your current password and choose a new one."
              : "Set a new password for this user."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {isSelf && (
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                disabled={submitting}
                aria-invalid={errors.currentPassword ? true : undefined}
                {...register("currentPassword")}
              />
              {errors.currentPassword && (
                <p role="alert" className="text-xs text-danger">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              disabled={submitting}
              aria-invalid={errors.newPassword ? true : undefined}
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p role="alert" className="text-xs text-danger">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              disabled={submitting}
              aria-invalid={errors.confirmPassword ? true : undefined}
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p role="alert" className="text-xs text-danger">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
              Update password
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
