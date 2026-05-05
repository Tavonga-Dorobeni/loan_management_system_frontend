"use client";

import { Select } from "@/components/ui/select";

type Props = {
  value: number;
  years: number[];
  onChange: (year: number) => void;
  className?: string;
};

export function YearSelector({ value, years, onChange, className }: Props) {
  const options = years.length > 0 ? years : [value];
  return (
    <Select
      aria-label="Year"
      value={String(value)}
      onChange={(e) => onChange(Number(e.target.value))}
      className={className ?? "h-9 w-28"}
    >
      {options.map((y) => (
        <option key={y} value={y}>
          {y}
        </option>
      ))}
    </Select>
  );
}
