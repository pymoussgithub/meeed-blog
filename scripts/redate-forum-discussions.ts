/**
 * Recalcule les dates des discussions demo-forum-* :
 * sujets étalés dans le passé, chaque réponse après le message précédent.
 *
 * Usage : npx tsx scripts/redate-forum-discussions.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Jours dans le passé pour le 1er message de chaque sujet (ordre = DISCUSSIONS du seed). */
const TOPIC_DAYS_AGO = [18, 16, 14, 12, 10, 8, 6, 4, 2, 1];

/** Heures après le message précédent pour chaque réponse (par sujet). */
const REPLY_HOURS_AFTER_PREVIOUS: number[][] = [
  [5, 11], // moteur
  [3, 8, 14], // batterie
  [6, 20], // transmission
  [2, 9], // météo
  [4, 12, 18], // vannes
  [7, 15], // bilan eau
  [5, 22], // chambre
  [3, 10, 16], // légumes
  [8, 19], // ferme solaire
  [2, 6, 13], // AG
];

function atLocalHour(daysAgo: number, hour: number, minute = 0): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  const topics = await prisma.forumTopic.findMany({
    where: { slug: { startsWith: "demo-forum-" } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      slug: true,
      posts: {
        orderBy: { createdAt: "asc" },
        select: { id: true },
      },
    },
  });

  if (topics.length === 0) {
    console.log("Aucun sujet demo-forum-* trouvé.");
    return;
  }

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i]!;
    const posts = topic.posts;
    if (posts.length === 0) continue;

    const daysAgo = TOPIC_DAYS_AGO[i] ?? 1 + (topics.length - i);
    const replyGaps = REPLY_HOURS_AFTER_PREVIOUS[i] ?? [4, 9, 15];

    // Premier message en matinée / début d’après-midi, décalé par sujet
    let cursor = atLocalHour(daysAgo, 9 + (i % 5), 10 + i * 3);

    for (let p = 0; p < posts.length; p++) {
      const post = posts[p]!;
      if (p > 0) {
        const gapHours = replyGaps[p - 1] ?? 4 + p * 3;
        cursor = new Date(cursor.getTime() + gapHours * 3_600_000);
      }

      await prisma.forumPost.update({
        where: { id: post.id },
        data: {
          createdAt: cursor,
          updatedAt: cursor,
        },
      });

      console.log(
        `${topic.slug}  post ${p + 1}/${posts.length}  ${cursor.toISOString()}`,
      );
    }

    const firstAt = (
      await prisma.forumPost.findUniqueOrThrow({
        where: { id: posts[0]!.id },
        select: { createdAt: true },
      })
    ).createdAt;
    const lastAt = (
      await prisma.forumPost.findUniqueOrThrow({
        where: { id: posts[posts.length - 1]!.id },
        select: { createdAt: true },
      })
    ).createdAt;

    await prisma.forumTopic.update({
      where: { id: topic.id },
      data: {
        createdAt: firstAt,
        updatedAt: lastAt,
        lastPostAt: lastAt,
      },
    });
  }

  console.log(`\nTerminé : ${topics.length} sujets redattés.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
