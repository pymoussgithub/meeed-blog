import Link from "next/link";
import { signOutAction } from "@/actions/auth.actions";
import { Button } from "@/components/ui/Button";

type AdminHeaderProps = {
  userName: string;
  userRole: "ADMIN" | "CONTRIBUTEUR";
};

export function AdminHeader({ userName, userRole }: AdminHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-primary px-4 py-3 text-white">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-sm font-semibold tracking-wide">
          MEEED Admin
        </Link>
        <span className="hidden text-xs text-white/60 sm:inline">|</span>
        <span className="hidden text-xs text-white/80 sm:inline">
          {userName} · {userRole === "ADMIN" ? "Administrateur" : "Contributeur"}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/admin/profil"
          className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:inline"
        >
          Mon profil
        </Link>
        <Link
          href="/"
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          Voir le site
        </Link>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" className="!text-white hover:!bg-white/10">
            Déconnexion
          </Button>
        </form>
      </div>
    </header>
  );
}
