import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
  title: "À propos",
  description:
    "Communiquer, informer et former sur ces solutions afin de diffuser ce savoir-faire auprès du monde agricole, en France et dans l'espace francophone.",
  path: "/a-propos",
});

const flyers = [
  {
    title: "Flyer agriculteurs",
    description:
      "Présentation de MEEED et de ses solutions destinée aux maraîchers et agriculteurs.",
    href: "/MEEED_Flyer-Agricult_V01.pdf",
  },
  {
    title: "Flyer institutions",
    description:
      "Présentation de MEEED destinée aux collectivités, partenaires et institutions.",
    href: "/MEEED_Flyer-Instit_V01.pdf",
  },
] as const;

export default function AboutPage() {
  return (
    <div className="container-meeed py-12">
      <h1 className="text-3xl sm:text-4xl">À propos de MEEED</h1>
      <div className="mt-4 h-1 w-24 rounded-full bg-accent" />

      <div className="prose prose-neutral mt-8 max-w-3xl text-primary/80">
        <p className="lead text-lg text-primary/70">
          Association loi 1901 d&apos;intérêt général — Maraichage Efficient en Eau et en
          Energie Décarbonée.
        </p>

        <h2 className="text-xl font-semibold text-primary-dark">Notre objet</h2>
        <p>L&apos;association MEEED a pour objet :</p>
        <ul className="list-disc space-y-3 pl-5">
          <li>
            L&apos;association MEEED développe, test et décrit des savoir-faire sur des
            solutions et moyens technologiques visant une réduction des consommations
            d&apos;eau et une décarbonation de l&apos;agriculture avec un focus sur le
            maraichage. Nous diffusons ces savoir-faire en France et dans l&apos;espace
            francophone.
          </li>
          <li>
            Communiquer, informer et former sur ces solutions afin de diffuser ce
            savoir-faire auprès du monde agricole, en France et dans l&apos;espace
            francophone.
          </li>
          <li>
            Développer et faire évoluer des solutions capable d&apos;améliorer les
            consommations d&apos;eau et les bilans carbone, par des alternatives innovantes et
            performantes — et, quand nécessaire et possible, concevoir des prototypes
            démonstratifs
          </li>
          <li>
            Agir de façon générale sur toutes les activités liées aux énergies renouvelables,
            à l&apos;autonomie énergétique, à la décarbonation et à l&apos;optimisation des
            usages de l&apos;eau et de l&apos;énergie dans l&apos;agriculture
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-primary-dark">Notre approche</h2>
        <p>
          MEEED est une équipe de bénévoles qui imagine des projets pragmatiques et
          réplicables pour apporter à l&apos;agriculture des solutions innovantes sur
          l&apos;eau et l&apos;énergie.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Des idées techniques</strong> pour réduire la consommation d&apos;eau et
            la dépendance aux énergies fossiles des exploitation agricoles de petites et
            moyennes dimensions
          </li>
          <li>
            <strong>Des dossiers réplicables</strong> : une fois nos domaines testés, les
            documents de création sont mis à disposition.
          </li>
          <li>
            <strong>Des formations</strong> sur les sujets techniques et les réalisations de
            nos domaines.
          </li>
        </ul>

        <h2 className="mt-10 text-xl font-semibold text-primary-dark">Nos flyers</h2>
        <p>
          Deux flyers présentent l&apos;association selon le public : agriculteurs et
          institutions. Consultez-les en ligne ou téléchargez-les pour les partager.
        </p>
      </div>

      <ul className="mt-6 max-w-3xl space-y-4">
        {flyers.map((flyer) => (
          <li
            key={flyer.href}
            className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-bg-soft/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-primary-dark">{flyer.title}</p>
              <p className="mt-1 text-sm text-primary/70">{flyer.description}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button href={flyer.href} external variant="outline">
                Consulter
              </Button>
              <Button href={flyer.href} download variant="accent">
                Télécharger
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <p className="prose prose-neutral mt-8 max-w-3xl text-primary/80">
        Nous pouvons vous accompagner pour répliquer l&apos;un de nos domaines ou travailler
        sur le vôtre avec nos compétences.{" "}
        <a href="/contact" className="font-medium text-accent-dark hover:underline">
          Contactez-nous
        </a>
        .
      </p>
    </div>
  );
}
