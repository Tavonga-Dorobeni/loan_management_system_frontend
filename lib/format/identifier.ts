export function formatIdentifier(value: string | null | undefined): string {
  if (!value) return "—";
  return value;
}

export const IDENTIFIER_CLASS = "font-mono numeric";
