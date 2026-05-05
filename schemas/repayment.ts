import { z } from "zod";
import { isoDateString, nonnegativeAmount } from "./common";

export const createRepaymentSchema = z.object({
  loanId: z.union([z.number(), z.string()]),
  amount: nonnegativeAmount,
  transactionDate: isoDateString,
  periodYear: z.number().int().min(2000).max(2100),
  periodMonth: z.number().int().min(1).max(12),
});
export type CreateRepaymentInput = z.infer<typeof createRepaymentSchema>;

export const updateRepaymentSchema = createRepaymentSchema.partial();
export type UpdateRepaymentInput = z.infer<typeof updateRepaymentSchema>;
