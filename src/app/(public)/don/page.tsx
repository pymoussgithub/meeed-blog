import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { HELLOASSO_URL } from "@/lib/content/site";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Faire un don",
  description:
    "Soutenez l'association MEEED et contribuez au développement de solutions innovantes pour une agriculture plus efficiente en eau et en énergie décarbonée.",
  path: "/don",
});

export default function DonPage() {
  return (
    <div className="container-meeed py-12">
      <h1 className="text-3xl sm:text-4xl">Faire un don</h1>
      <div className="mt-4 h-1 w-24 rounded-full bg-accent" />

      <div className="prose prose-neutral mt-8 max-w-3xl text-primary/80">
        <p className="lead text-lg text-primary/70">
          MEEED est une association loi 1901 d&apos;intérêt général, portée par des bénévoles.
          Vos dons nous permettent de développer, tester et diffuser des solutions concrètes pour
          une agriculture plus économe en eau et moins dépendante des énergies fossiles.
        </p>

        <h2 className="text-xl font-semibold text-primary-dark">Comment donner ?</h2>
        <p>
          Les dons sont collectés via HelloAsso, plateforme sécurisée dédiée aux associations.
          Vous pouvez choisir librement le montant de votre contribution.
        </p>

        <div className="not-prose mt-8">
          <Button href={HELLOASSO_URL} variant="accent" external>
            Faire un don sur HelloAsso
          </Button>
        </div>

        <p className="mt-8 text-sm text-primary/60">
          Vous avez une question avant de donner ?{" "}
          <a href="/contact" className="font-medium text-accent-dark hover:underline">
            Contactez-nous
          </a>
          .
        </p>
      </div>
    </div>
  );
}
