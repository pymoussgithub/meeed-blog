import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Guide contributeur",
};

const STEPS = [
  {
    title: "1. Se connecter",
    body: "Rendez-vous sur /admin/login avec l'email et le mot de passe fournis par l'administrateur.",
  },
  {
    title: "2. Créer un article",
    body: "Depuis le Dashboard ou Articles → « Nouvel article ».",
  },
  {
    title: "3. Choisir un projet ou une thématique",
    body: "Sélectionnez le projet concerné (Tracteur, Arrosage, Énergie…) ou une autre catégorie pour classer l'article.",
  },
  {
    title: "4. Rédiger le contenu",
    body: "Renseignez le titre, l'extrait (160 caractères max) et le contenu dans l'éditeur.",
  },
  {
    title: "5. Ajouter une image de couverture",
    body: "Uploadez une image au format paysage (16:9 recommandé, ex. 1200×675 px). Elle apparaît sur la page d'accueil et dans les partages WhatsApp.",
  },
  {
    title: "6. Associer des documents (optionnel)",
    body: "Dans Documents, uploadez un PDF et associez-le à un article ou à un projet. Cochez « Public » pour le rendre téléchargeable sur le site.",
  },
  {
    title: "7. Enregistrer ou publier",
    body: "« Enregistrer brouillon » sauvegarde sans rendre visible. « Publier » met l'article en ligne immédiatement (titre, extrait, contenu et image requis).",
  },
];

export default function AdminHelpPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Guide contributeur</h1>
      <p className="mt-2 text-primary/70">
        Publier un article avec image et PDF en moins de 5 minutes.
      </p>

      <div className="mt-8 space-y-4">
        {STEPS.map((step) => (
          <Card key={step.title}>
            <h2 className="font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm text-primary/70">{step.body}</p>
          </Card>
        ))}
      </div>

      <section className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        <h2 className="font-semibold">Bonnes pratiques</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Rédigez un extrait court et percutant (visible dans les listes et sur WhatsApp).</li>
          <li>Utilisez des titres H2/H3 dans le contenu pour structurer la lecture.</li>
          <li>Vérifiez l&apos;aperçu sur mobile avant publication.</li>
          <li>Les images insérées dans le texte passent aussi par Cloudinary (upload sécurisé).</li>
        </ul>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/admin/articles/nouveau" variant="accent">
          Nouvel article
        </Button>
        <Button href="/admin/documents" variant="outline">
          Gérer les documents
        </Button>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center text-sm font-medium text-accent-dark hover:underline"
        >
          Voir le site public →
        </Link>
      </div>
    </div>
  );
}
