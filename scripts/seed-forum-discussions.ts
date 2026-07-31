/**
 * Seed de discussions forum liées aux articles demo.
 * ~10 sujets, 2–3 messages chacun, auteurs diversifiés.
 *
 * Usage : npx tsx scripts/seed-forum-discussions.ts
 */
import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/utils";

const prisma = new PrismaClient();

type ReplyDef = {
  /** Index dans la liste des auteurs actifs (triés par name). */
  authorIndex: number;
  body: string;
  /** Heures après le message précédent (pas après le 1er). */
  hoursAfterPrevious: number;
};

type DiscussionDef = {
  slug: string;
  title: string;
  articleSlug: string;
  categorySlug: "discussions-generales" | "projets" | "questions";
  authorIndex: number;
  /** Jours dans le passé pour le 1er message. */
  daysAgo: number;
  body: string;
  replies: ReplyDef[];
};

const DISCUSSIONS: DiscussionDef[] = [
  {
    slug: "demo-forum-moteur-20cv-choix",
    title: "Quel moteur 20 cv pour le rétrofit — retour d’expérience ?",
    articleSlug: "demo-choix-moteur-20cv",
    categorySlug: "questions",
    authorIndex: 0,
    daysAgo: 18,
    body: `<p>L’article sur le choix du moteur 20 cv m’a bien aidé, mais je hésite encore entre deux références disponibles d’occasion. Vous avez déjà croisé des problèmes de couple à bas régime sur ce type de montage ?</p>`,
    replies: [
      {
        authorIndex: 2,
        hoursAfterPrevious: 5,
        body: `<p>On a testé un moteur asynchrone 15 kW avec réducteur : le couple tient bien en travail du sol léger. Le point critique reste le refroidissement en été, pas le couple à bas régime.</p>`,
      },
      {
        authorIndex: 1,
        hoursAfterPrevious: 11,
        body: `<p>Idem de notre côté. Vérifie surtout l’adaptateur boîte / flasque — c’est là qu’on a perdu du temps, plus que sur le moteur lui-même.</p>`,
      },
    ],
  },
  {
    slug: "demo-forum-batterie-pack-dimensionnement",
    title: "Pack batterie tracteur : autonomie réelle vs fiche technique",
    articleSlug: "demo-batterie-pack-tracteur",
    categorySlug: "projets",
    authorIndex: 2,
    daysAgo: 16,
    body: `<p>Suite à l’article sur le pack batterie, on vise 3–4 h de travail discontinu. Vous calculez avec quel facteur de décharge pour rester confortable sur une journée maraîchère typique ?</p>`,
    replies: [
      {
        authorIndex: 3,
        hoursAfterPrevious: 3,
        body: `<p>On part sur 70 % de la capacité nominale utilisable, et on garde une marge pour les pics (démarrages, outils portés). Sur nos essais, 3 h 30 effectives tiennent sans stress.</p>`,
      },
      {
        authorIndex: 0,
        hoursAfterPrevious: 8,
        body: `<p>Attention aussi à la température des cellules en été : au-delà de 35 °C ambiant, l’autonomie chute plus vite que prévu. Un petit ventilateur dans le coffre aide vraiment.</p>`,
      },
      {
        authorIndex: 1,
        hoursAfterPrevious: 14,
        body: `<p>Et pensez au poste de recharge atelier décrit dans l’autre article — recharger la nuit change complètement le dimensionnement « journée ».</p>`,
      },
    ],
  },
  {
    slug: "demo-forum-essais-transmission",
    title: "Essais transmission rétrofit : protocoles et points de vigilance",
    articleSlug: "demo-essais-transmission-retrofit",
    categorySlug: "projets",
    authorIndex: 1,
    daysAgo: 14,
    body: `<p>On prépare une session d’essais transmission comme dans l’article. Vous notez quels indicateurs en priorité (température, bruit, jeu, vibrations) ?</p>`,
    replies: [
      {
        authorIndex: 0,
        hoursAfterPrevious: 6,
        body: `<p>Température boîte + bruit à charge constante, puis un test de jeu à l’arrêt. Les vibrations moteur / châssis viennent souvent d’un mauvais alignement de l’adaptateur.</p>`,
      },
      {
        authorIndex: 3,
        hoursAfterPrevious: 20,
        body: `<p>On filme aussi le démarrage en pente douce : c’est le scénario qui révèle le plus vite un sous-dimensionnement du couple.</p>`,
      },
    ],
  },
  {
    slug: "demo-forum-centrale-meteo-etp",
    title: "Centrale météo ETp : capteurs indispensables vs nice-to-have",
    articleSlug: "demo-centrale-meteo-etp",
    categorySlug: "questions",
    authorIndex: 3,
    daysAgo: 12,
    body: `<p>Pour démarrer une centrale météo orientée ETp, est-ce qu’un pyranomètre bas coût + anémomètre + thermo-hygro suffisent, ou faut-il absolument un rayonnement plus précis dès le début ?</p>`,
    replies: [
      {
        authorIndex: 1,
        hoursAfterPrevious: 2,
        body: `<p>Pour une première saison, le trio thermo-hygro / vent / rayonnement bas coût marche. On affine le rayonnement l’année suivante une fois le bilan eau calé.</p>`,
      },
      {
        authorIndex: 2,
        hoursAfterPrevious: 9,
        body: `<p>Le plus important c’est la position de la station (loin des bâtiments, hauteur standard) — un capteur moyen bien placé bat un bon capteur mal exposé.</p>`,
      },
    ],
  },
  {
    slug: "demo-forum-pilotage-vannes",
    title: "Pilotage vannes / relais : retours sur la fiabilité terrain",
    articleSlug: "demo-pilotage-vannes-relais",
    categorySlug: "projets",
    authorIndex: 0,
    daysAgo: 10,
    body: `<p>Après lecture de l’article sur le pilotage des vannes, on part sur des relais DIN classiques. Vous avez eu des collages de contact ou des faux déclenchements avec l’humidité ?</p>`,
    replies: [
      {
        authorIndex: 2,
        hoursAfterPrevious: 4,
        body: `<p>Oui, surtout en coffret non ventilé. On est passé en relais à contacts étanches + parasurtenseurs, et on aéré le coffret. Plus de collage depuis.</p>`,
      },
      {
        authorIndex: 1,
        hoursAfterPrevious: 12,
        body: `<p>Pense aussi à la maintenance des électrovannes (l’autre fiche) : souvent le « faux » problème électrique vient d’une vanne grippée.</p>`,
      },
      {
        authorIndex: 3,
        hoursAfterPrevious: 18,
        body: `<p>On logue chaque ouverture/fermeture : ça aide à détecter un cycle anormal avant la panne visible.</p>`,
      },
    ],
  },
  {
    slug: "demo-forum-bilan-eau",
    title: "Bilan eau sur deux semaines : vos seuils d’alerte",
    articleSlug: "demo-bilan-eau-deux-semaines",
    categorySlug: "discussions-generales",
    authorIndex: 2,
    daysAgo: 8,
    body: `<p>Suite au bilan eau présenté dans l’article, quels seuils d’écart (mm ou %) vous utilisez pour déclencher une visite terrain ou un ajustement des coefficients culturaux ?</p>`,
    replies: [
      {
        authorIndex: 0,
        hoursAfterPrevious: 7,
        body: `<p>Chez nous : ±15 % sur 7 jours glissants = revue des Kc ; ±25 % = contrôle débit / fuites. Au-delà on coupe le secteur concerné le temps du diagnostic.</p>`,
      },
      {
        authorIndex: 3,
        hoursAfterPrevious: 15,
        body: `<p>On croise aussi avec la pluie effective : un écart « sec » après un orage localisé n’est pas forcément un bug de calcul.</p>`,
      },
    ],
  },
  {
    slug: "demo-forum-chambre-adiabatique",
    title: "Chambre adiabatique : premier montage, par où commencer ?",
    articleSlug: "demo-principe-chambre-adiabatique",
    categorySlug: "questions",
    authorIndex: 1,
    daysAgo: 6,
    body: `<p>L’article sur le principe de la chambre adiabatique est clair. Pour un local existant de ~20 m², vous commencez par l’isolation, le média évaporatif, ou le ventilateur basse conso ?</p>`,
    replies: [
      {
        authorIndex: 0,
        hoursAfterPrevious: 5,
        body: `<p>Isolation d’abord (surtout plafond et portes), sinon le média travaille pour rien. Ensuite ventilateur dimensionné, puis média et circuit d’eau.</p>`,
      },
      {
        authorIndex: 2,
        hoursAfterPrevious: 22,
        body: `<p>Et instrumente tôt (hygro + T°) : l’article mesures hygro montre bien qu’on ajuste mieux avec des données qu’au feeling.</p>`,
      },
    ],
  },
  {
    slug: "demo-forum-qualite-legumes",
    title: "Qualité des légumes stockés : critères que vous suivez",
    articleSlug: "demo-qualite-legumes-stockes",
    categorySlug: "discussions-generales",
    authorIndex: 3,
    daysAgo: 4,
    body: `<p>En lien avec l’article sur la qualité des légumes stockés : vous notez plutôt perte de poids, fermeté, ou apparition de moisissures pour juger le réglage de la chambre ?</p>`,
    replies: [
      {
        authorIndex: 1,
        hoursAfterPrevious: 3,
        body: `<p>Perte de poids hebdo + contrôle visuel. La fermeté est utile mais plus subjective ; on la réserve aux lots sensibles (salades, fraises).</p>`,
      },
      {
        authorIndex: 0,
        hoursAfterPrevious: 10,
        body: `<p>On a un journal simple (lot, date entrée, T°/HR moyenne, % perte). Ça rejoint le bilan énergétique : on voit si on sur-refroidit pour un gain qualité faible.</p>`,
      },
      {
        authorIndex: 2,
        hoursAfterPrevious: 16,
        body: `<p>Entretien saisonnier du média et filtres : dès que l’air sent le moisi, la qualité chute avant même les moisissures visibles.</p>`,
      },
    ],
  },
  {
    slug: "demo-forum-ferme-solaire-dimensionnement",
    title: "Ferme solaire : dimensionner sans surinvestir — vos retours",
    articleSlug: "design-ferme-solaire-dimensionnement",
    categorySlug: "projets",
    authorIndex: 0,
    daysAgo: 2,
    body: `<p>L’approche « partir des usages » de l’article me parle. Vous avez surdimensionné au début, ou plutôt sous-dimensionné puis étendu ?</p>`,
    replies: [
      {
        authorIndex: 2,
        hoursAfterPrevious: 8,
        body: `<p>On a volontairement sous-dimensionné (pompes + automate + chambre). Extension toiture l’année suivante une fois le profil de conso connu. Moins de regret financier.</p>`,
      },
      {
        authorIndex: 1,
        hoursAfterPrevious: 19,
        body: `<p>Même logique. Batterie reportée : l’autonomie nocturne n’était pas critique grâce au contrat / réseau. À revoir si on branche le tracteur rétrofité.</p>`,
      },
    ],
  },
  {
    slug: "demo-forum-ag-2026-suite",
    title: "Suite de l’AG 2026 : atelier documentation ouverte",
    articleSlug: "demo-assemblee-generale-2026",
    categorySlug: "discussions-generales",
    authorIndex: 1,
    daysAgo: 1,
    body: `<p>L’AG a lancé le groupe « documentation ouverte ». Qui participe déjà, et vous priorisez quelles fiches en premier (tracteur, arrosage, chambre) ?</p>`,
    replies: [
      {
        authorIndex: 3,
        hoursAfterPrevious: 2,
        body: `<p>Je m’inscris côté rédaction. Je partirais des notices montage tracteur (adaptateur, batterie) — ce sont les plus demandées en atelier.</p>`,
      },
      {
        authorIndex: 2,
        hoursAfterPrevious: 6,
        body: `<p>+1 pour le tracteur, puis la centrale météo ETp. On peut s’appuyer sur les articles déjà publiés et les enrichir avec les retours forum.</p>`,
      },
      {
        authorIndex: 0,
        hoursAfterPrevious: 13,
        body: `<p>OK pour un créneau bi-mensuel. Je prépare un canevas de fiche type (matériel, étapes, sécurité, photos) pour homogénéiser.</p>`,
      },
    ],
  },
];

function atLocalHour(daysAgo: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function ensureUniqueTopicSlug(base: string) {
  const candidate = slugify(base) || "sujet";
  let suffix = 0;
  while (true) {
    const slug = suffix === 0 ? candidate : `${candidate}-${suffix}`.slice(0, 80);
    const existing = await prisma.forumTopic.findFirst({
      where: { slug },
      select: { id: true },
    });
    if (!existing) return slug;
    suffix += 1;
  }
}

async function main() {
  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  if (users.length < 2) {
    throw new Error("Au moins 2 utilisateurs actifs sont requis pour diversifier les auteurs.");
  }

  console.log(
    `Auteurs (${users.length}) :`,
    users.map((u, i) => `[${i}] ${u.name ?? u.email}`).join(", "),
  );

  const categories = await prisma.forumCategory.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, name: true },
  });
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  const articleSlugs = [...new Set(DISCUSSIONS.map((d) => d.articleSlug))];
  const articles = await prisma.article.findMany({
    where: {
      slug: { in: articleSlugs },
      status: "PUBLISHED",
    },
    select: { id: true, slug: true, title: true },
  });
  const articleBySlug = new Map(articles.map((a) => [a.slug, a]));

  let created = 0;
  let skipped = 0;

  for (const def of DISCUSSIONS) {
    const existing = await prisma.forumTopic.findFirst({
      where: { slug: def.slug },
      select: { id: true, title: true },
    });
    if (existing) {
      console.log(`⏭  déjà présent : ${def.slug}`);
      skipped += 1;
      continue;
    }

    const article = articleBySlug.get(def.articleSlug);
    if (!article) {
      console.warn(`⚠  article introuvable, skip : ${def.articleSlug}`);
      skipped += 1;
      continue;
    }

    const category = categoryBySlug.get(def.categorySlug);
    if (!category) {
      console.warn(`⚠  rubrique introuvable, skip : ${def.categorySlug}`);
      skipped += 1;
      continue;
    }

    const author = users[def.authorIndex % users.length]!;
    let cursor = atLocalHour(def.daysAgo, 9 + (created % 5), 10 + created * 3);
    const firstAt = cursor;
    const slug = await ensureUniqueTopicSlug(def.slug);

    const topic = await prisma.$transaction(async (tx) => {
      const topicRow = await tx.forumTopic.create({
        data: {
          title: def.title,
          slug,
          categoryId: category.id,
          authorId: author.id,
          postsCount: 1 + def.replies.length,
          lastPostAt: firstAt,
          createdAt: firstAt,
          updatedAt: firstAt,
          posts: {
            create: {
              body: def.body,
              authorId: author.id,
              createdAt: firstAt,
              updatedAt: firstAt,
            },
          },
          articles: {
            create: [{ articleId: article.id }],
          },
          subscriptions: {
            create: {
              userId: author.id,
              isActive: true,
            },
          },
        },
        select: { id: true, slug: true },
      });

      let lastAt = firstAt;
      for (const reply of def.replies) {
        const replyAuthor = users[reply.authorIndex % users.length]!;
        cursor = new Date(cursor.getTime() + reply.hoursAfterPrevious * 3_600_000);
        lastAt = cursor;
        await tx.forumPost.create({
          data: {
            body: reply.body,
            topicId: topicRow.id,
            authorId: replyAuthor.id,
            createdAt: cursor,
            updatedAt: cursor,
          },
        });
        await tx.forumTopicSubscription.upsert({
          where: {
            topicId_userId: { topicId: topicRow.id, userId: replyAuthor.id },
          },
          update: {},
          create: {
            topicId: topicRow.id,
            userId: replyAuthor.id,
            isActive: true,
          },
        });
      }

      await tx.forumTopic.update({
        where: { id: topicRow.id },
        data: { lastPostAt: lastAt, updatedAt: lastAt },
      });

      return topicRow;
    });

    const replyAuthors = def.replies
      .map((r) => users[r.authorIndex % users.length]?.name ?? "?")
      .join(", ");
    console.log(
      `✓  ${topic.slug} ← ${article.slug} | auteur: ${author.name} | réponses: ${replyAuthors}`,
    );
    created += 1;
  }

  console.log(`\nTerminé : ${created} créés, ${skipped} ignorés.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
