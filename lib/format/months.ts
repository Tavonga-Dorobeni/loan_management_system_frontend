export function monthsBetween(
  from: string | Date | null | undefined,
  to: string | Date | null | undefined,
): number {
  if (!from || !to) return 0;
  const a = typeof from === "string" ? new Date(from) : from;
  const b = typeof to === "string" ? new Date(to) : to;
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return 0;
  const diff = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  return Math.max(0, diff);
}

const MONTH_LABEL_FMT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "2-digit",
});

export function formatMonthBucket(bucket: string | null | undefined): string {
  if (!bucket) return "";
  const [yearStr, monthStr] = bucket.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return bucket;
  const d = new Date(year, month - 1, 1);
  if (Number.isNaN(d.getTime())) return bucket;
  return MONTH_LABEL_FMT.format(d);
}
