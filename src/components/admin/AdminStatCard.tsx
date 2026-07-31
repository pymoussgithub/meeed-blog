import Link from "next/link";
import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: number;
  hint?: string;
  accent?: string;
  active?: boolean;
  href?: string;
  "data-tour-id"?: string;
};

export function AdminStatCard({
  label,
  value,
  hint,
  accent,
  active,
  href,
  "data-tour-id": dataTourId,
}: AdminStatCardProps) {
  const className = cn(
    "rounded-xl border bg-white p-5 transition-shadow",
    active ? "border-accent shadow-sm ring-1 ring-accent/20" : "border-gray-200",
    href && "hover:border-accent/40 hover:shadow-sm",
  );

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-primary/60">{label}</p>
        {accent ? (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
        ) : null}
      </div>
      <p className="mt-1 text-3xl font-bold text-primary-dark">{value}</p>
      {hint ? <p className="mt-1 text-xs text-primary/50">{hint}</p> : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn(className, "block")} data-tour-id={dataTourId}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className} data-tour-id={dataTourId}>
      {content}
    </div>
  );
}
