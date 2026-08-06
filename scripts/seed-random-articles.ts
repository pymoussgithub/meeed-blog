import { PrismaClient, ArticleStatus } from "@prisma/client";

const prisma = new PrismaClient();

const TITLES = [
  "Observations de terrain après une semaine de pluie",
  "Notes sur le dimensionnement d’un circuit basse tension",
  "Retour d’expérience : capteurs d’humidité en serre",
  "Calendrier cultural et consommation énergétique",
  "Essais comparatifs de paillage organique",
  "Point d’étape sur la maintenance des vannes",
  "Réflexions autour du stockage des récoltes d’été",
  "Petit guide improvisé pour les relevés météo",
  "Compte rendu d’atelier technique du mois",
  "Hypothèses de travail pour la prochaine saison",
];

const EXCERPTS = [
  "Quelques notes dispersées, sans prétention de synthèse définitive.",
  "Un texte libre pour alimenter le flux d’actualités pendant les tests.",
  "Contenu généré pour vérifier l’affichage sans image de couverture.",
  "Brouillon publié à des fins de recette et de navigation.",
  "Article factice avec un extrait volontairement générique.",
];

const PARAGRAPHS = [
  "Les conditions de la semaine ont modifié le rythme habituel des interventions. Rien d’alarmant, mais assez pour justifier un rappel méthodique.",
  "On retient surtout la nécessité de documenter chaque écart, même mineur, afin de pouvoir le comparer plus tard avec d’autres périodes.",
  "Les échanges avec l’équipe ont confirmé plusieurs points déjà soupçonnés : priorité au suivi quotidien, et simplification des procédures.",
  "Ce contenu n’a pas vocation à être définitif. Il sert surtout à peupler la base et à tester le rendu des listes d’articles.",
  "Dans la pratique, l’absence de photo de couverture permet de vérifier le fallback prévu côté interface publique.",
  "Les titres et paragraphes ont été choisis de manière aléatoire, sans lien strict avec un chantier en cours.",
  "Si besoin, ces articles pourront être archivés ou supprimés une fois la recette terminée.",
];

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

function slugify(title: string, index: number): string {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
  return `${base}-${Date.now().toString(36)}-${index}`;
}

function buildContent(): string {
  const parts = Array.from({ length: 3 + Math.floor(Math.random() * 2) }, () => pick(PARAGRAPHS));
  return [
    "<h2>Contexte</h2>",
    `<p>${parts[0]}</p>`,
    "<h2>Observations</h2>",
    `<p>${parts[1]}</p>`,
    "<h2>Suite</h2>",
    `<p>${parts[2]}${parts[3] ? ` ${parts[3]}` : ""}</p>`,
  ].join("\n");
}

async function main() {
  const author =
    (await prisma.user.findFirst({ where: { role: "ADMIN" } })) ??
    (await prisma.user.findFirst());

  if (!author) {
    throw new Error("Aucun utilisateur trouvé. Lancez d’abord le seed principal.");
  }

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  if (categories.length === 0) {
    throw new Error("Aucun domaine trouvé. Lancez d’abord le seed principal.");
  }

  const shuffledTitles = [...TITLES].sort(() => Math.random() - 0.5).slice(0, 10);
  const created: string[] = [];

  for (let i = 0; i < shuffledTitles.length; i++) {
    const title = shuffledTitles[i]!;
    const category = categories[i % categories.length]!;
    const publishedAt = new Date(Date.now() - i * 86_400_000 - Math.floor(Math.random() * 3_600_000));

    const article = await prisma.article.create({
      data: {
        title,
        slug: slugify(title, i),
        excerpt: pick(EXCERPTS),
        content: buildContent(),
        coverImageUrl: null,
        coverImagePublicId: null,
        status: ArticleStatus.PUBLISHED,
        publishedAt,
        authorId: author.id,
        categories: {
          create: [{ categoryId: category.id }],
        },
      },
    });

    created.push(`${article.title} → /a/${article.slug}`);
  }

  console.log(`${created.length} articles créés (sans photo) :`);
  for (const line of created) {
    console.log(`- ${line}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
