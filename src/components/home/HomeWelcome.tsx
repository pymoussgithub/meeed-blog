import Link from "next/link";
import { Button } from "@/components/ui/Button";

const HIGHLIGHTS = [
  {
    title: "Eau",
    description:
      "Des solutions techniques pour réduire la consommation d'eau en maraîchage de petite et moyenne dimension.",
    accent: "bg-accent-blue/15 text-accent-blue",
  },
  {
    title: "Énergie décarbonée",
    description:
      "Des alternatives aux énergies fossiles pour l'autonomie énergétique et la décarbonation des exploitations.",
    accent: "bg-accent/15 text-accent-dark",
  },
  {
    title: "Savoir-faire",
    description:
      "Communication, formation et dossiers réplicables pour diffuser nos solutions auprès du monde agricole.",
    accent: "bg-accent-green/15 text-accent-green",
  },
] as const;

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
            L&apos;association MEEED établit, décrit et maintient un savoir-faire sur des
            solutions et moyens technologiques applicables à un maraîchage efficient en eau
            et en énergie décarbonée. Nous communiquons, informons et formons pour diffuser
            ce savoir-faire en France et dans l&apos;espace francophone.
          </p>
          <p className="mt-4 text-base leading-relaxed text-primary/75">
            Notre équipe de bénévoles imagine des projets pragmatiques et réplicables pour
            apporter à la culture maraîchère des solutions innovantes. Une fois nos projets
            testés, les documents de création sont mis à disposition.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-gray-100 bg-bg-soft/40 p-6 transition-shadow hover:shadow-md"
            >
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${item.accent}`}
              >
                {item.title}
              </span>
              <p className="mt-4 text-sm leading-relaxed text-primary/70">{item.description}</p>
            </article>
          ))}
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
