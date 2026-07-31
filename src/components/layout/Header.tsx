import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { HeaderNav } from "@/components/layout/HeaderNav";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { NavDropdown } from "@/components/layout/NavDropdown";
import { getCurrentUser } from "@/lib/auth-helpers";
import { NAV_LINKS } from "@/lib/navigation";

export async function Header() {
  const user = await getCurrentUser();
  const accountHref = user ? "/admin" : "/admin/login";
  const accountLabel = user ? "Mon compte" : "Se connecter";

  const navButtonClass =
    "rounded-full border-2 border-accent px-4 py-1.5 text-sm font-medium text-accent-dark transition-colors hover:bg-accent hover:text-white";

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="container-meeed relative flex h-16 items-center justify-between gap-4 sm:h-20">
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/meeedlogoimage.png"
            alt="MEEED"
            width={140}
            height={56}
            className="h-10 w-auto sm:h-12"
            priority
          />
        </Link>

        <Suspense fallback={null}>
          <HeaderNav />
        </Suspense>

        <div className="hidden items-center gap-3 md:flex">
          <Link href={accountHref} className={navButtonClass} data-tour-id="nav.header.login">
            {accountLabel}
          </Link>
          <NavDropdown links={NAV_LINKS} />
        </div>

        <MobileMenu links={NAV_LINKS} isLoggedIn={Boolean(user)} />
      </div>
    </header>
  );
}
