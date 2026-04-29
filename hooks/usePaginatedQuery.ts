"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { ListEnvelope } from "@/lib/api-client";

export type PaginatedQueryState = {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
  filters: Record<string, string>;
};

const DEFAULT_PAGE_SIZE = 20;

function readState(params: URLSearchParams): PaginatedQueryState {
  const filters: Record<string, string> = {};
  for (const [k, v] of params.entries()) {
    if (["page", "pageSize", "sortBy", "sortOrder", "search"].includes(k)) continue;
    filters[k] = v;
  }
  return {
    page: Number(params.get("page") ?? 1) || 1,
    pageSize: Number(params.get("pageSize") ?? DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE,
    sortBy: params.get("sortBy") ?? undefined,
    sortOrder: (params.get("sortOrder") as "asc" | "desc" | null) ?? undefined,
    search: params.get("search") ?? undefined,
    filters,
  };
}

function toQuery(state: PaginatedQueryState): Record<string, string | number> {
  const q: Record<string, string | number> = { page: state.page, pageSize: state.pageSize };
  if (state.sortBy) q.sortBy = state.sortBy;
  if (state.sortOrder) q.sortOrder = state.sortOrder;
  if (state.search) q.search = state.search;
  for (const [k, v] of Object.entries(state.filters)) {
    if (v) q[k] = v;
  }
  return q;
}

export function usePaginatedQuery<T>(opts: {
  queryKey: readonly unknown[];
  fetcher: (query: Record<string, string | number>) => Promise<ListEnvelope<T>>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo(() => readState(new URLSearchParams(searchParams.toString())), [searchParams]);
  const query = useMemo(() => toQuery(state), [state]);

  const setQuery = useCallback(
    (updater: Partial<PaginatedQueryState> | ((prev: PaginatedQueryState) => Partial<PaginatedQueryState>)) => {
      const patch = typeof updater === "function" ? updater(state) : updater;
      const next: PaginatedQueryState = {
        ...state,
        ...patch,
        filters: patch.filters ? { ...state.filters, ...patch.filters } : state.filters,
      };
      const params = new URLSearchParams();
      if (next.page !== 1) params.set("page", String(next.page));
      if (next.pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(next.pageSize));
      if (next.sortBy) params.set("sortBy", next.sortBy);
      if (next.sortOrder) params.set("sortOrder", next.sortOrder);
      if (next.search) params.set("search", next.search);
      for (const [k, v] of Object.entries(next.filters)) {
        if (v) params.set(k, v);
      }
      router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
    },
    [pathname, router, state],
  );

  const result = useQuery({
    queryKey: [...opts.queryKey, query] as const,
    queryFn: () => opts.fetcher(query),
    placeholderData: keepPreviousData,
  });

  return {
    ...result,
    items: result.data?.items ?? [],
    pagination: result.data?.pagination,
    state,
    setQuery,
  };
}
