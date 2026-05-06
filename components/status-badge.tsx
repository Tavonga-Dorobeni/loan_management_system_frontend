import { Badge } from "./ui/badge";

type LoanStatusBadgeProps = { status: string };

export function LoanStatusBadge({ status }: LoanStatusBadgeProps) {
  const upper = status?.toUpperCase() ?? "";
  if (upper === "SUCCESS" || upper === "ACTIVE") return <Badge variant="success">{status}</Badge>;
  if (upper === "PENDING") return <Badge variant="warning">{status}</Badge>;
  if (upper === "FAILED" || upper === "OVERDUE" || upper === "WRITE-OFF" || upper === "WRITEOFF")
    return <Badge variant="danger">{status}</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}

type RepaymentStatusBadgeProps = { status: "CORRECT" | "OVER" | "UNDER" | string };

export function RepaymentStatusBadge({ status }: RepaymentStatusBadgeProps) {
  const upper = status?.toUpperCase();
  if (upper === "CORRECT") return <Badge variant="success">{status}</Badge>;
  if (upper === "OVER") return <Badge variant="warning">{status}</Badge>;
  if (upper === "UNDER") return <Badge variant="danger">{status}</Badge>;
  return <Badge variant="secondary">{status}</Badge>;
}
