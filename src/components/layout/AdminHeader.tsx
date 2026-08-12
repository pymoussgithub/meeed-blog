import Image from "next/image";
import Link from "next/link";
import { signOutAction } from "@/actions/auth.actions";

type AdminHeaderProps = {
  userName: string;
  userRole: "ADMIN" | "CONTRIBUTEUR";
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AdminHeader({ userName, userRole }: AdminHeaderProps) {
  const isAdmin = userRole === "ADMIN";
  const roleLabel = isAdmin ? "Administrateur" : "Contributeur";
  const initials = getInitials(userName) || "U";

  return (
    <header className="sticky top-0 z-30 border-b border-primary/10 bg-white/95 backdrop-blur">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-2.5 sm:gap-4 sm:px-5">
        <div className="flex min-w-0 items-center">
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src="/meeedlogoimage.png"
              alt="MEEED"
              width={140}
              height={56}
              className="h-8 w-auto sm:h-9"
              priority
            />
          </Link>
        </div>

        <div className="flex items-center justify-center">
          <div className="flex max-w-[360px] items-center gap-2 rounded-full border border-primary/10 bg-white/90 py-1 pl-1 pr-2.5 shadow-[0_8px_24px_rgba(13,42,62,0.08)] ring-1 ring-primary/5 backdrop-blur-sm sm:gap-2.5 sm:pr-3">
            <span
              aria-hidden
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary via-accent to-accent-blue text-[11px] font-bold text-white"
            >
              {initials}
            </span>

            <span className="min-w-0 truncate text-sm font-semibold text-primary-dark">
              {userName}
            </span>

            <span className="hidden h-4 w-px shrink-0 bg-primary/10 sm:block" />

            <span
              className={
                isAdmin
                  ? "hidden items-center gap-1.5 text-[11px] font-medium text-accent-dark sm:inline-flex"
                  : "hidden items-center gap-1.5 text-[11px] font-medium text-primary/60 sm:inline-flex"
              }
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 sm:gap-3">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-primary/15 px-3 py-1.5 text-xs font-medium text-primary/75 transition-colors hover:border-accent/40 hover:bg-bg-soft hover:text-accent-dark"
          >
            <span className="sm:hidden">Site</span>
            <span className="hidden sm:inline">Voir le site</span>
          </Link>

          <form action={signOutAction}>
            <button
              type="submit"
              aria-label="Déconnexion"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary-dark sm:h-auto sm:w-auto sm:rounded-full sm:px-3 sm:py-1.5 sm:text-xs sm:font-medium"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 sm:hidden"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </form>
        </div>
      </div>

      <div
        aria-hidden
        className="h-0.5 bg-gradient-to-r from-accent via-accent-blue/70 to-accent-green/60"
      />
    </header>
  );
}
