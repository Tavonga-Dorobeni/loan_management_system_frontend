export type UserRole =
  | 'admin'
  | 'loan_officer'
  | 'credit_analyst'
  | 'collections_officer'
  | 'customer_support';

export interface AppUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  onboardingComplete: boolean;
}

export interface ProfilePayload {
  firstName: string;
  lastName: string;
  role: UserRole;
}
