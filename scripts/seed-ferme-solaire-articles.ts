/**
 * Deux articles liés au projet Ferme solaire (catégorie Énergie).
 * Images : Unsplash (licence Unsplash) — URLs publiques.
 *
 * Usage : npx tsx scripts/seed-ferme-solaire-articles.ts
 */
import { PrismaClient, ArticleStatus } from "@prisma/client";

const prisma = new PrismaClient();

function unsplash(photoId: string): string {
  return `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&h=675&q=80`;
}

const ARTICLES = [
  {
    slug: "design-ferme-solaire-dimensionnement",
    title: "Design d’une ferme solaire : dimensionner sans surinvestir",
    excerpt:
      "Méthode pour estimer les besoins électriques de l’exploitation et caler la puissance photovoltaïque adaptée au maraîchage.",
    authorName: "Alexandre",
    coverPhotoId: "photo-1509391366360-2e959784a276",
    daysAgo: 1,
    content: `
      <h2>Partir des usages, pas des panneaux</h2>
      <p>Avant de choisir un kit photovoltaïque, il faut cartographier la consommation réelle de la ferme : pompes d’irrigation, automate d’arrosage, chambre fraîche, outillage atelier, recharge éventuelle d’un engin rétrofité. Un relevé sur plusieurs semaines — compteurs dédiés ou factures détaillées — évite de surdimensionner l’installation.</p>
      <h2>Critères de dimensionnement</h2>
      <ul>
        <li><strong>Puissance utile</strong> — viser d’abord les postes prioritaires (eau, conservation) plutôt qu’une couverture totale théorique.</li>
        <li><strong>Profil journalier</strong> — croiser production solaire (pic midi) et consommation (souvent matinale ou continue).</li>
        <li><strong>Emprise au sol</strong> — toiture de bâtiment, ombrières légères ou parcelle dédiée, en limitant l’artificialisation des surfaces cultivables.</li>
        <li><strong>Stockage</strong> — batterie seulement si l’autonomie nocturne ou la continuité d’un usage critique le justifie.</li>
      </ul>
      <h2>Choix d’implantation</h2>
      <p>L’orientation, l’ombrage saisonnier et l’accessibilité pour la maintenance pèsent autant que le rendement nominal des modules. Sur une exploitation maraîchère, un schéma simple (toiture + onduleur string) reste souvent plus robuste qu’un dispositif complexe peu suivi.</p>
      <h2>Livrable de conception</h2>
      <p>Le design aboutit à une fiche claire : puissance cible, schéma unifilaire simplifié, estimation des coûts, et priorisation des charges alimentées en priorité. C’est cette base qui guidera ensuite le chantier d’installation.</p>
    `.trim(),
  },
  {
    slug: "installation-ferme-solaire-chantier",
    title: "Installation de la ferme solaire : du plan au premier kWh",
    excerpt:
      "Retour de chantier : préparation du site, pose des modules, raccordement électrique et mises en service sur l’exploitation.",
    authorName: "Thierry",
    coverPhotoId: "photo-1508514177221-188b1cf16e9d",
    daysAgo: 0,
    content: `
      <h2>Préparer le chantier</h2>
      <p>Une fois le dimensionnement validé, l’installation commence par la sécurisation du site : accès engins, zones de stockage des modules, consignation des circuits existants, et briefing sécurité pour l’équipe. Les supports (rails toiture ou structures au sol) sont calés et contrôlés avant toute pose de panneaux.</p>
      <h2>Pose et câblage</h2>
      <p>Les modules sont fixés selon le plan d’implantation, avec respect des couples de serrage et des chemins de câbles. Le câblage DC rejoint l’onduleur ; le côté AC est protégé (disjoncteurs, parafoudre) avant raccordement au tableau de la ferme. Chaque étape est consignée pour faciliter la maintenance ultérieure.</p>
      <h2>Mise en service</h2>
      <p>Après contrôles d’isolement et vérification des polarités, l’onduleur est mis sous tension. On valide la production, la communication éventuelle (monitoring), et le comportement sur les usages prioritaires — pompe, automate, chambre fraîche. Un premier relevé de production sur quelques jours confirme que le chantier tient les hypothèses du design.</p>
      <h2>Suite</h2>
      <p>Le journal de chantier et les photos d’installation seront complétés par un bilan énergétique après une saison complète, pour croiser production réelle et besoins de l’exploitation.</p>
    `.trim(),
  },
] as const;

async function main() {
  const ferme = await prisma.project.findUnique({ where: { slug: "ferme-solaire" } });
  if (!ferme) {
    throw new Error("Projet « ferme-solaire » introuvable.");
  }

  const created: string[] = [];
  const updated: string[] = [];

  for (const item of ARTICLES) {
    const author = await prisma.user.findFirst({
      where: { name: item.authorName, isActive: true },
    });
    if (!author) {
      throw new Error(`Utilisateur « ${item.authorName} » introuvable.`);
    }

    const publishedAt = new Date(Date.now() - item.daysAgo * 86_400_000);
    const coverImageUrl = unsplash(item.coverPhotoId);

    const existing = await prisma.article.findUnique({ where: { slug: item.slug } });
    if (existing) {
      await prisma.article.update({
        where: { id: existing.id },
        data: {
          title: item.title,
          excerpt: item.excerpt,
          content: item.content,
          coverImageUrl,
          projectId: ferme.id,
          authorId: author.id,
          status: ArticleStatus.PUBLISHED,
          publishedAt: existing.publishedAt ?? publishedAt,
        },
      });
      await prisma.articleCategory.deleteMany({ where: { articleId: existing.id } });
      updated.push(item.slug);
      continue;
    }

    const article = await prisma.article.create({
      data: {
        title: item.title,
        slug: item.slug,
        excerpt: item.excerpt,
        content: item.content,
        coverImageUrl,
        coverImagePublicId: null,
        status: ArticleStatus.PUBLISHED,
        publishedAt,
        authorId: author.id,
        projectId: ferme.id,
      },
      include: {
        author: { select: { name: true } },
        project: { select: { title: true } },
      },
    });

    created.push(
      `${article.title} — ${article.author.name} → /a/${article.slug} (${article.project?.title})`,
    );
  }

  console.log(`\n${created.length} article(s) créé(s) :\n`);
  for (const line of created) {
    console.log(`  • ${line}`);
  }
  if (updated.length > 0) {
    console.log(`\n${updated.length} mis à jour (projet Ferme solaire) : ${updated.join(", ")}`);
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
