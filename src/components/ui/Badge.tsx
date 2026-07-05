import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeProps = {
  children: ReactNode;
  className?: string;
  color?: string;
};

export function Badge({ children, className, color }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      style={
        color
          ? { backgroundColor: `${color}22`, color }
          : { backgroundColor: "var(--color-bg-soft)", color: "var(--color-accent-dark)" }
      }
    >
      {children}
    </span>
  );
}
