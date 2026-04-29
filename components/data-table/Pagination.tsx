"use client";

import { Button } from "@/components/ui/button";
import type { Pagination } from "@/lib/api-client";

export function DataTablePagination({
  pagination,
  onPageChange,
  onPageSizeChange,
}: {
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}) {
  const { page, pageSize, totalItems, totalPages } = pagination;
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="text-muted-foreground">
        Page <span className="numeric">{page}</span> of <span className="numeric">{totalPages || 1}</span>{" "}
        · <span className="numeric">{totalItems}</span> total
      </div>
      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {[10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
        )}
        <Button variant="outline" size="sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= (totalPages || 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
