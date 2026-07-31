"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { reorderProjectsAction } from "@/actions/project.actions";
import { ProjectListActions } from "@/components/admin/ProjectListActions";
import { ProjectStatusBadge } from "@/components/admin/ProjectStatusBadge";
import { Toast } from "@/components/ui/Toast";
import { formatDate } from "@/lib/utils";

export type ProjectTableRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: Date | string;
  coverUrl: string | null;
  category: { name: string; slug: string };
  _count: { articles: number };
};

type ProjectsAdminTableProps = {
  projects: ProjectTableRow[];
  canReorder: boolean;
};

const tableActionClassName =
  "inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

export function ProjectsAdminTable({ projects, canReorder }: ProjectsAdminTableProps) {
  const router = useRouter();
  const [ordered, setOrdered] = useState(projects);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [reordering, setReordering] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(
    null,
  );

  useEffect(() => {
    setOrdered(projects);
  }, [projects]);

  const persistOrder = async (nextOrdered: ProjectTableRow[]) => {
    const previous = ordered;
    setOrdered(nextOrdered);
    setReordering(true);

    const result = await reorderProjectsAction({
      orderedIds: nextOrdered.map((project) => project.id),
    });

    setReordering(false);

    if (!result.success) {
      setOrdered(previous);
      setToast({ message: result.error, variant: "error" });
      return;
    }

    router.refresh();
  };

  const moveProject = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;

    const next = [...ordered];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    void persistOrder(next);
  };

  return (
    <div className="mt-6 space-y-3">
      <p className="text-sm text-primary/60">
        {canReorder
          ? `Glissez-déposez les lignes pour définir l’ordre d’apparition sur le site.${reordering ? " Enregistrement…" : ""}`
          : "Réinitialisez les filtres pour réordonner les projets par glisser-déposer."}
      </p>
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left">
            <tr>
              {canReorder ? <th className="w-10 px-2 py-3" aria-label="Réordonner" /> : null}
              <th className="px-4 py-3 font-medium">Projet</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Articles</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Ordre</th>
              <th className="px-4 py-3 font-medium">Modifié</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ordered.map((project, index) => {
              const articleCount = project._count.articles;

              return (
                <tr
                  key={project.id}
                  draggable={canReorder && !reordering}
                  onDragStart={
                    canReorder
                      ? (event) => {
                          setDraggedId(project.id);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", project.id);
                        }
                      : undefined
                  }
                  onDragOver={
                    canReorder
                      ? (event) => {
                          event.preventDefault();
                          event.dataTransfer.dropEffect = "move";
                          if (dragOverId !== project.id) setDragOverId(project.id);
                        }
                      : undefined
                  }
                  onDragLeave={
                    canReorder
                      ? () => {
                          if (dragOverId === project.id) setDragOverId(null);
                        }
                      : undefined
                  }
                  onDrop={
                    canReorder
                      ? (event) => {
                          event.preventDefault();
                          const fromId = event.dataTransfer.getData("text/plain") || draggedId;
                          setDraggedId(null);
                          setDragOverId(null);
                          if (!fromId) return;
                          const fromIndex = ordered.findIndex((item) => item.id === fromId);
                          moveProject(fromIndex, index);
                        }
                      : undefined
                  }
                  onDragEnd={
                    canReorder
                      ? () => {
                          setDraggedId(null);
                          setDragOverId(null);
                        }
                      : undefined
                  }
                  className={[
                    "group hover:bg-gray-50/60",
                    draggedId === project.id ? "opacity-40" : "",
                    dragOverId === project.id && draggedId !== project.id
                      ? "bg-accent/10 ring-1 ring-inset ring-accent/40"
                      : "",
                    canReorder
                      ? reordering
                        ? "cursor-wait"
                        : "cursor-grab active:cursor-grabbing"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {canReorder ? (
                    <td className="px-2 py-3 text-center text-primary/35">
                      <span
                        className="inline-flex select-none"
                        title="Glisser pour réordonner"
                        aria-hidden
                      >
                        <svg viewBox="0 0 16 16" className="size-4" fill="currentColor">
                          <circle cx="5" cy="3.5" r="1.25" />
                          <circle cx="11" cy="3.5" r="1.25" />
                          <circle cx="5" cy="8" r="1.25" />
                          <circle cx="11" cy="8" r="1.25" />
                          <circle cx="5" cy="12.5" r="1.25" />
                          <circle cx="11" cy="12.5" r="1.25" />
                        </svg>
                      </span>
                    </td>
                  ) : null}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="hidden h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 sm:block">
                        {project.coverUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={project.coverUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-primary/30">
                            Sans image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/projets/${project.id}`}
                          className="font-medium text-primary-dark hover:text-accent-dark"
                        >
                          {project.title}
                        </Link>
                        <p className="mt-0.5 line-clamp-1 text-xs text-primary/50">
                          {project.category.name} · /c/{project.category.slug}
                        </p>
                        {project.summary ? (
                          <p className="mt-0.5 line-clamp-1 text-xs text-primary/50">
                            {project.summary}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ProjectStatusBadge isActive={project.isActive} />
                  </td>
                  <td className="hidden px-4 py-3 text-primary/70 sm:table-cell">
                    {articleCount}
                  </td>
                  <td className="hidden px-4 py-3 text-primary/70 md:table-cell">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-primary/70">
                    {formatDate(project.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/projets/${project.id}`}
                        className={`${tableActionClassName} border-accent/30 bg-accent/10 text-accent-dark hover:bg-accent/20`}
                      >
                        Éditer
                      </Link>
                      {project.isActive ? (
                        <Link
                          href={`/actualites?project=${project.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`${tableActionClassName} border-primary/15 bg-gray-50 text-primary/70 hover:border-accent/30 hover:bg-accent/10 hover:text-accent-dark`}
                        >
                          Voir
                        </Link>
                      ) : null}
                      <ProjectListActions
                        projectId={project.id}
                        projectTitle={project.title}
                        isActive={project.isActive}
                        className={tableActionClassName}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {toast ? (
        <Toast
          message={toast.message}
          visible
          variant={toast.variant}
          onClose={() => setToast(null)}
        />
      ) : null}
    </div>
  );
}
