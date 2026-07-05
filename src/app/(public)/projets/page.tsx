import type { Metadata } from "next";
import { ProjectsShowcaseList } from "@/components/projects/ProjectsShowcaseList";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/seo/JsonLd";
import { HELLOASSO_URL } from "@/lib/content/site";
import { getActiveProjects } from "@/lib/services/project.service";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Nos projets",
  description: "Projets innovants et réplicables pour le maraîchage efficient.",
  path: "/projets",
});

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof getActiveProjects>> = [];

  try {
    projects = await getActiveProjects();
  } catch {
    // DB indisponible au build ou en local
  }

  return (
    <div className="pb-16">
      <div className="container-meeed max-w-7xl py-12 lg:py-16">
        <JsonLd
          data={buildBreadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Nos projets", path: "/projets" },
          ])}
        />

        <p className="text-sm font-medium uppercase tracking-wider text-accent-dark">
          Nos valeurs visibles à travers
        </p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl lg:text-5xl">Nos projets en cours</h1>
        <p className="mt-4 max-w-3xl text-lg text-primary/70">
          Des sujets pragmatiques et innovants, réplicables, pour faire évoluer le maraîchage
          vers des solutions plus économiques en eau et en énergie, avec moins d&apos;impact
          carbone.
        </p>
      </div>

      {projects.length > 0 ? (
        <ProjectsShowcaseList projects={projects} />
      ) : (
        <p className="container-meeed text-primary/60">
          Les projets seront bientôt disponibles. Revenez prochainement.
        </p>
      )}

      <section className="container-meeed mt-20 max-w-7xl rounded-2xl bg-bg-soft p-8 sm:p-10 lg:mt-28">
        <h2 className="text-xl font-semibold sm:text-2xl">Projets en développement</h2>
        <p className="mt-3 max-w-3xl text-primary/70">
          MEEED est une association jeune. Nos projets sont en phase de développement et
          d&apos;expérimentation sur le terrain. Cette section accueille les avancées,
          documents descriptifs et vidéos au fil du temps.
        </p>
        <div className="mt-6">
          <Button href={HELLOASSO_URL} variant="accent" external>
            Soutenir l&apos;association
          </Button>
        </div>
      </section>
    </div>
  );
}
