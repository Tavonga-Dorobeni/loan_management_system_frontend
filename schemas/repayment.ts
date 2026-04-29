import { z } from "zod";
import { isoDateString, nonnegativeAmount } from "./common";

export const createRepaymentSchema = z.object({
  loanId: z.union([z.number(), z.string()]),
  amount: nonnegativeAmount,
  transactionDate: isoDateString,
});
export type CreateRepaymentInput = z.infer<typeof createRepaymentSchema>;

export const updateRepaymentSchema = createRepaymentSchema.partial();
export type UpdateRepaymentInput = z.infer<typeof updateRepaymentSchema>;
