import Link from "next/link";

export type ForumBreadcrumbItem = {
  label: string;
  href?: string;
};

type ForumBreadcrumbProps = {
  items: ForumBreadcrumbItem[];
  className?: string;
};

export function ForumBreadcrumb({ items, className }: ForumBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Fil d'Ariane"
      className={className ?? "text-xs text-primary/50"}
    >
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 ? (
                <span aria-hidden="true" className="text-primary/25">
                  ›
                </span>
              ) : null}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-accent-dark"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "font-medium text-primary/70" : undefined}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
