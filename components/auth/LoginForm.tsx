"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/toasts";
import { loginSchema, type LoginInput } from "@/schemas/auth";

const SAFE_NEXT = /^\/(?!\/)/;

function safeNext(value: string | null): string {
  if (!value) return "/dashboard";
  return SAFE_NEXT.test(value) ? value : "/dashboard";
}

type LoginResponse =
  | { success: true; data: { user: unknown } }
  | {
      success: false;
      error: string;
      statusCode: number;
      fieldErrors?: Record<string, string | string[]>;
    };

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = form;

  async function onSubmit(values: LoginInput) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const payload = (await res.json().catch(() => null)) as LoginResponse | null;

      if (res.ok && payload?.success) {
        const next = safeNext(searchParams.get("next"));
        router.replace(next);
        router.refresh();
        return;
      }

      if (payload && payload.success === false && payload.fieldErrors) {
        for (const [field, msg] of Object.entries(payload.fieldErrors)) {
          if (field === "email" || field === "password") {
            setError(field, { type: "server", message: Array.isArray(msg) ? msg[0] : msg });
          }
        }
        return;
      }

      const message =
        payload && payload.success === false ? payload.error : "Invalid credentials";
      toast.error(message);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          autoFocus
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

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          disabled={submitting}
          aria-invalid={errors.password ? true : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p role="alert" className="text-xs text-danger">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        {submitting ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
