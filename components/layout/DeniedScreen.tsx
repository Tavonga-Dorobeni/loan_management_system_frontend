import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeniedScreen({
  title = "You don't have permission",
  description = "This area is restricted to administrators.",
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
}: {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full bg-danger/10 p-3 text-danger">
        <ShieldAlert className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      <Button asChild variant="outline" size="sm" className="mt-2">
        <Link href={backHref}>{backLabel}</Link>
      </Button>
    </div>
  );
}
