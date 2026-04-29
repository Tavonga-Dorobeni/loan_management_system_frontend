import { z } from "zod";
import { isoDateString, nonnegativeAmount } from "./common";

const loanBaseSchema = z.object({
  borrowerId: z.union([z.number(), z.string()]),
  referenceNumber: z.string().min(1),
  type: z.string().min(1),
  status: z.string().default("PENDING"),
  startDate: isoDateString,
  endDate: isoDateString,
  disbursementDate: isoDateString.nullable().optional(),
  repaymentAmount: nonnegativeAmount,
  totalAmount: nonnegativeAmount,
  amountPaid: nonnegativeAmount.nullable().optional(),
  amountDue: nonnegativeAmount.nullable().optional(),
  message: z.string().nullable().optional(),
});

export const createLoanSchema = loanBaseSchema.refine(
  (v) => new Date(v.endDate) >= new Date(v.startDate),
  { path: ["endDate"], message: "End date must be on or after start date" },
);
export type CreateLoanInput = z.infer<typeof createLoanSchema>;

export const updateLoanSchema = loanBaseSchema.partial();
export type UpdateLoanInput = z.infer<typeof updateLoanSchema>;
