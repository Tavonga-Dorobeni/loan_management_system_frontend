import { z } from "zod";
import { ROLES } from "@/lib/rbac";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const userSummarySchema = z.object({
  id: z.union([z.number(), z.string()]),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  role: z.enum(ROLES),
  status: z.string(),
});
