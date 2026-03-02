import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';

export const userRoles = [
  'admin',
  'loan_officer',
  'credit_analyst',
  'collections_officer',
  'customer_support'
] as const;

export const loginSchema = toTypedSchema(
  z.object({
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
);

export const registrationSchema = toTypedSchema(
  z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters')
  })
);

export const onboardingProfileSchema = toTypedSchema(
  z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    role: z.enum(userRoles)
  })
);
