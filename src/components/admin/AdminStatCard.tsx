import { cn } from "@/lib/utils";

type AdminStatCardProps = {
  label: string;
  value: number;
  hint?: string;
  accent?: string;
  active?: boolean;
  href?: string;
};

export function AdminStatCard({ label, value, hint, accent, active }: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-white p-5 transition-shadow",
        active ? "border-accent shadow-sm ring-1 ring-accent/20" : "border-gray-200",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-primary/60">{label}</p>
        {accent ? (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
        ) : null}
      </div>
      <p className="mt-1 text-3xl font-bold text-primary-dark">{value}</p>
      {hint ? <p className="mt-1 text-xs text-primary/50">{hint}</p> : null}
    </div>
  );
}
