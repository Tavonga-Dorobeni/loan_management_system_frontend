import { z } from "zod";

export const paginationSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalItems: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});

export function listEnvelope<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    items: z.array(item),
    pagination: paginationSchema,
  });
}

export const isoDateString = z.string().refine(
  (v) => !Number.isNaN(new Date(v).getTime()),
  { message: "Invalid date" },
);

export const optionalEmail = z.string().email().nullable().optional();
export const nonnegativeAmount = z.number().nonnegative();
