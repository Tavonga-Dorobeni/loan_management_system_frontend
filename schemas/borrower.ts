import { z } from "zod";

const optionalString = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().optional().nullable(),
);

const optionalEmail = z.preprocess(
  (v) => (v === "" ? undefined : v),
  z.string().email().optional().nullable(),
);

export const createBorrowerSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  ecNumber: z.string().min(1),
  idNumber: z.string().min(1),
  phoneNumber: optionalString,
  email: optionalEmail,
});
export type CreateBorrowerInput = z.infer<typeof createBorrowerSchema>;

export const updateBorrowerSchema = createBorrowerSchema.partial();
export type UpdateBorrowerInput = z.infer<typeof updateBorrowerSchema>;

export const contactOnlyBorrowerSchema = z.object({
  phoneNumber: optionalString,
  email: optionalEmail,
});
export type ContactOnlyBorrowerInput = z.infer<typeof contactOnlyBorrowerSchema>;
