import Image from "next/image";
import Link from "next/link";
import { HELLOASSO_URL, SITE_CONTACT } from "@/lib/content/site";

export function Footer() {
  return (
    <footer className="mt-auto bg-primary text-white">
      <div className="container-meeed py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <Image
              src="/logo-meeed.svg"
              alt="MEEED"
              width={140}
              height={56}
              className="h-12 w-auto brightness-0 invert"
            />
            <p className="mt-4 max-w-sm text-sm text-white/70">
              Association loi 1901 d&apos;intérêt général — Maraichage Efficient en Eau
              et en Energie Décarbonée.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm sm:grid-cols-3">
            <div>
              <p className="mb-3 font-semibold">Navigation</p>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link href="/actualites" className="hover:text-white">
                    Actualités
                  </Link>
                </li>
                <li>
                  <Link href="/projets" className="hover:text-white">
                    Projets
                  </Link>
                </li>
                <li>
                  <Link href="/documents" className="hover:text-white">
                    Documents
                  </Link>
                </li>
                <li>
                  <Link href="/a-propos" className="hover:text-white">
                    À propos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="mb-3 font-semibold">Contact</p>
              <ul className="space-y-2 text-white/70">
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Nous écrire
                  </Link>
                </li>
                <li>
                  <a href={`tel:${SITE_CONTACT.phone}`} className="hover:text-white">
                    {SITE_CONTACT.phoneDisplay}
                  </a>
                </li>
                <li className="text-white/60">
                  {SITE_CONTACT.addressLines.join(", ")}
                </li>
                <li>
                  <a
                    href={HELLOASSO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    Faire un don
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} MEEED — Tous droits réservés
        </div>
      </div>
    </footer>
  );
}
