import { cn } from "@/lib/utils";

type SectionLabelProps = {
  id?: string;
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLHeadingElement>;

export function SectionLabel({ id, children, className, ...rest }: SectionLabelProps) {
  return (
    <h2
      id={id}
      className={cn(
        "mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
        className,
      )}
      {...rest}
    >
      {children}
    </h2>
  );
}
