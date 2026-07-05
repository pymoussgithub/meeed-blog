import { PrismaClient, UserRole, ArticleStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_ADMIN_PASSWORD = "Meeed2026!";

const INITIAL_PROJECTS = [
  {
    slug: "tracteur",
    title: "Tracteur électrique en rétrofit",
    summary:
      "Réduire les émissions de CO₂ : par le retrofit ou la transformation d'un ancien tracteur thermique de 20 CV en tracteur électrique adapté aux travaux de maraîchage.",
    donationUrl:
      "https://www.helloasso.com/associations/maraichage-efficient-en-eau-et-en-energie-decarbonee/formulaires/1",
    color: "#4ecdc4",
    sortOrder: 1,
  },
  {
    slug: "arrosage",
    title: "Arrosage automatique sur ETp",
    summary:
      "Réduire la consommation d'eau : ajuster automatiquement et quotidiennement le volume d'arrosage suivant les données météorologiques locales.",
    color: "#4ebdf5",
    sortOrder: 2,
  },
  {
    slug: "energie",
    title: "Chambre fraîche adiabatique",
    summary:
      "Réduire le gaspillage alimentaire : entreposer les légumes récoltés dans un environnement frais et humide pour une bonne conservation de leurs qualités.",
    color: "#20c997",
    sortOrder: 3,
  },
] as const;

const INITIAL_ARTICLES = [
  {
    slug: "tracteur-electrique-retrofit",
    title: "Tracteur électrique de 20 CV en rétrofit",
    excerpt:
      "Transformer un tracteur thermique de 20 CV en tracteur électrique adapté au maraîchage pour réduire les émissions de CO₂.",
    categorySlug: "tracteur",
    content: `
      <h2>Le pourquoi</h2>
      <p>La mécanisation maraîchère repose encore largement sur des tracteurs thermiques. Le retrofit électrique permet de réutiliser un matériel existant tout en supprimant les émissions directes sur le parcelle.</p>
      <h2>Le comment</h2>
      <p>MEEED travaille sur la transformation d'un tracteur thermique de 20 CV en tracteur électrique, dimensionné pour les travaux courants du maraîchage de petite et moyenne dimension.</p>
      <p>Les avancées du projet sont documentées au fil de l'eau : composants, essais terrain et retours d'expérience seront publiés ici.</p>
      <p><strong>Statut :</strong> projet en cours de développement — revenez régulièrement pour les mises à jour.</p>
    `.trim(),
  },
  {
    slug: "arrosage-automatique-etp",
    title: "Arrosage automatique sur ETp",
    excerpt:
      "Ajuster quotidiennement le volume d'arrosage selon l'évapotranspiration potentielle calculée à partir des données météo locales.",
    categorySlug: "arrosage",
    content: `
      <h2>ETp — Évapotranspiration potentielle</h2>
      <p>Chaque jour, les conditions météorologiques varient : température, ensoleillement, vent, humidité, pluie… Chaque plante évapore dans l'atmosphère un volume d'eau qui dépend de ces conditions. Cette transpiration est naturelle et protège la plante, mais elle doit être compensée par l'arrosage.</p>
      <p>Pour arroser au minimum nécessaire, il faudrait connaître pour chaque culture son évapotranspiration. Des formules validées par la recherche permettent de l'estimer à partir des données météorologiques : c'est l'<strong>évapotranspiration potentielle (ETp)</strong>.</p>
      <h2>La solution MEEED</h2>
      <p>MEEED met en œuvre cette approche sur le terrain des Petits Loups Maraîchers. Une centrale météorologique alimente le calcul de l'ETp. Sur une base de temps d'arrosage définie pour chaque plantation, la valeur de l'ETp corrige automatiquement cette base chaque jour sur les vannes concernées.</p>
      <p>Il devient possible d'arroser suffisamment, mais surtout au minimum du besoin des plantes — et donc de réduire la consommation d'eau. Une telle fonction n'existe pas sur le marché pour une exploitation maraîchère de cette taille.</p>
      <p>Sur ses compétences en électrotechnique et en développement logiciel, MEEED a conçu une solution avec un automate connecté à une centrale météo et à des cartes relais pour la gestion des vannes. Les composants sont disponibles sur le marché à des prix accessibles.</p>
      <p><strong>Statut :</strong> déploiement et stabilisation en cours. Les dossiers techniques seront publiés lorsque le système sera validé sur le terrain.</p>
    `.trim(),
  },
  {
    slug: "chambre-fraiche-adiabatique",
    title: "Chambre fraîche adiabatique",
    excerpt:
      "Conserver les légumes récoltés dans un environnement frais et humide pour limiter le gaspillage et préserver leurs qualités.",
    categorySlug: "energie",
    content: `
      <h2>Le défi</h2>
      <p>Après récolte, les légumes se dégradent rapidement si la température et l'humidité ne sont pas maîtrisées. Une mauvaise conservation entraîne des pertes, du gaspillage alimentaire et une baisse de qualité pour la vente.</p>
      <h2>L'approche adiabatique</h2>
      <p>La chambre fraîche adiabatique utilise l'évaporation de l'eau pour refroidir l'air dans un espace clos, avec une consommation énergétique bien inférieure à une chambre froide classique. L'objectif est d'entreposer les légumes dans un environnement <strong>frais et humide</strong>, adapté aux besoins du maraîchage de proximité.</p>
      <h2>Projet MEEED</h2>
      <p>MEEED développe et expérimente cette solution pour une exploitation maraîchère, en visant un équilibre entre performance, coût et réplicabilité. Les résultats, plans et retours d'usage seront partagés sur cette page.</p>
      <p><strong>Statut :</strong> phase de conception et d'essais — documentation à venir.</p>
    `.trim(),
  },
] as const;

async function main() {
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@meeed.fr" },
    update: {},
    create: {
      email: "admin@meeed.fr",
      name: "Administrateur MEEED",
      passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const categories = [
    {
      name: "Tracteur",
      slug: "tracteur",
      description:
        "Rétrofit et mécanisation décarbonée — transformation de tracteurs thermiques en électrique.",
      color: "#4ecdc4",
      sortOrder: 1,
    },
    {
      name: "Arrosage",
      slug: "arrosage",
      description:
        "Gestion efficiente de l'eau — arrosage piloté par l'évapotranspiration potentielle (ETp).",
      color: "#4ebdf5",
      sortOrder: 2,
    },
    {
      name: "Énergie",
      slug: "energie",
      description:
        "Autonomie et énergies renouvelables — conservation adiabatique et efficacité énergétique.",
      color: "#20c997",
      sortOrder: 3,
    },
    {
      name: "Formation",
      slug: "formation",
      description: "Ressources pédagogiques et ateliers",
      color: "#292f36",
      sortOrder: 4,
    },
    {
      name: "Actualités",
      slug: "actualites",
      description: "Vie de l'association et annonces",
      color: "#3b9a93",
      sortOrder: 5,
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
    categoryMap.set(record.slug, record.id);
  }

  for (const project of INITIAL_PROJECTS) {
    const categoryId = categoryMap.get(project.slug);
    if (!categoryId) {
      throw new Error(`Catégorie introuvable pour le projet : ${project.slug}`);
    }

    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {
        title: project.title,
        summary: project.summary,
        donationUrl: "donationUrl" in project ? project.donationUrl : null,
        color: project.color,
        sortOrder: project.sortOrder,
        isActive: true,
        categoryId,
      },
      create: {
        title: project.title,
        slug: project.slug,
        summary: project.summary,
        donationUrl: "donationUrl" in project ? project.donationUrl : null,
        color: project.color,
        sortOrder: project.sortOrder,
        isActive: true,
        categoryId,
      },
    });
  }

  const publishedAt = new Date();

  for (const article of INITIAL_ARTICLES) {
    const categoryId = categoryMap.get(article.categorySlug);
    if (!categoryId) {
      throw new Error(`Catégorie introuvable : ${article.categorySlug}`);
    }

    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        status: ArticleStatus.PUBLISHED,
        publishedAt,
      },
      create: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        status: ArticleStatus.PUBLISHED,
        publishedAt,
        authorId: admin.id,
        categories: {
          create: [{ categoryId }],
        },
      },
    });
  }

  // Supprimer l'ancien brouillon de démo s'il existe encore
  await prisma.article.deleteMany({
    where: { slug: "tracteur-electrique-retrofit-demo" },
  });

  console.log("Seed terminé.");
  console.log("Admin : admin@meeed.fr");
  console.log(`Mot de passe temporaire : ${DEFAULT_ADMIN_PASSWORD}`);
  console.log("→ À changer dès la mise en production.");
  console.log(`${INITIAL_ARTICLES.length} articles publiés (tracteur, arrosage, énergie).`);
  console.log(`${INITIAL_PROJECTS.length} projets créés.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
