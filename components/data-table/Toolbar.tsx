"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function DataTableToolbar({
  search,
  onSearchChange,
  placeholder = "Search…",
  children,
}: {
  search?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  children?: React.ReactNode;
}) {
  const [local, setLocal] = useState(search ?? "");
  const debounced = useDebouncedValue(local, 300);

  useEffect(() => {
    if (onSearchChange && debounced !== (search ?? "")) onSearchChange(debounced);
  }, [debounced, onSearchChange, search]);

  useEffect(() => {
    setLocal(search ?? "");
  }, [search]);

  return (
    <div className="flex items-center gap-2">
      {onSearchChange && (
        <Input
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder={placeholder}
          className="max-w-xs"
        />
      )}
      <div className="flex-1" />
      {children}
    </div>
  );
}
