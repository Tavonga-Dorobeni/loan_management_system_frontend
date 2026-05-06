export const ROLES = [
  "admin",
  "loan_officer",
  "credit_analyst",
  "collections_officer",
  "customer_support",
] as const;

export type Role = (typeof ROLES)[number];

export type Action =
  | "users.read"
  | "users.write"
  | "users.changePassword.self"
  | "borrowers.read"
  | "borrowers.write"
  | "borrowers.writeContactOnly"
  | "borrowers.delete"
  | "kyc.upload"
  | "kyc.read"
  | "loans.read"
  | "loans.write"
  | "loans.writeStatusOnly"
  | "loans.writeOff"
  | "loans.earlyMaturity"
  | "loans.delete"
  | "repayments.read"
  | "repayments.write"
  | "imports.intake"
  | "imports.approvals"
  | "imports.repayments"
  | "reports.read"
  | "reports.export"
  | "activityLog.read";

const MATRIX: Record<Action, Role[]> = {
  "users.read": ["admin"],
  "users.write": ["admin"],
  "users.changePassword.self": [...ROLES],
  "borrowers.read": [...ROLES],
  "borrowers.write": ["admin", "loan_officer"],
  "borrowers.writeContactOnly": ["customer_support"],
  "borrowers.delete": ["admin", "loan_officer"],
  "kyc.upload": ["admin", "loan_officer"],
  "kyc.read": [...ROLES],
  "loans.read": [...ROLES],
  "loans.write": ["admin", "loan_officer"],
  "loans.writeStatusOnly": ["credit_analyst"],
  "loans.writeOff": ["admin"],
  "loans.earlyMaturity": ["admin", "loan_officer"],
  "loans.delete": ["admin"],
  "repayments.read": [...ROLES],
  "repayments.write": ["admin", "collections_officer"],
  "imports.intake": ["admin", "loan_officer"],
  "imports.approvals": ["admin", "credit_analyst"],
  "imports.repayments": ["admin", "collections_officer"],
  "reports.read": [...ROLES],
  "reports.export": ["admin", "loan_officer", "credit_analyst", "collections_officer"],
  "activityLog.read": ["admin"],
};

export function can(role: Role | undefined | null, action: Action): boolean {
  if (!role) return false;
  return MATRIX[action]?.includes(role) ?? false;
}

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}
