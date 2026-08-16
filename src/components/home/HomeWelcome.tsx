import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function HomeWelcome() {
  return (
    <section
      id="presentation"
      className="scroll-mt-28 border-t border-gray-100 bg-white py-12 sm:scroll-mt-32 sm:py-16"
      aria-labelledby="welcome-heading"
    >
      <div className="container-meeed">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-wider text-accent-dark">
            Message d&apos;accueil
          </p>
          <h2 id="welcome-heading" className="mt-2 text-2xl sm:text-3xl">
            Bienvenue sur MEEED
          </h2>
          <div className="mt-3 h-1 w-20 rounded-full bg-accent" />
          <p className="mt-5 text-base leading-relaxed text-primary/75 sm:text-lg">
            L&apos;association MEEED analyse, développe, teste et décrit des savoir-faire sur des
            solutions et moyens technologiques visant une réduction des consommations d&apos;eau
            et une décarbonation de l&apos;agriculture avec un focus sur le maraîchage. Nous
            diffusons ces savoir-faire en France et dans l&apos;espace francophone.
          </p>
          <p className="mt-4 text-base leading-relaxed text-primary/75">
            Notre équipe de bénévoles imagine des projets pragmatiques et réplicables pour
            apporter à l&apos;agriculture des solutions innovantes. Une fois ces projets
            travaillés, réalisés et testés, des documents descriptifs sont mis à disposition
            au sein de ce blog ou par des formations.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/a-propos" variant="accent">
            En savoir plus sur MEEED
          </Button>
          <Link
            href="/contact"
            className="text-sm font-medium text-accent-dark transition-colors hover:underline"
          >
            Nous contacter →
          </Link>
        </div>
      </div>
    </section>
  );
}
