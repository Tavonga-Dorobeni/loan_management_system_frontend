import { toast } from "sonner";

export { toast };

export function toastApiError(err: unknown, fallback = "Something went wrong") {
  const message = err instanceof Error ? err.message : fallback;
  toast.error(message);
}

export function toastImportSummary(args: { successCount: number; failureCount: number; totalRows: number }) {
  const { successCount, failureCount, totalRows } = args;
  if (failureCount === 0) {
    toast.success(`Import complete: ${successCount}/${totalRows}`);
  } else {
    toast.warning(`Import finished with errors: ${successCount}/${totalRows} (${failureCount} failed)`);
  }
}
