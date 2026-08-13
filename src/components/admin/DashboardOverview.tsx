"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ArticleStatusBadge } from "@/components/admin/ArticleStatusBadge";
import { cn, formatDate } from "@/lib/utils";

type DashboardArticle = {
  id: string;
  title: string;
  status: string;
  updatedAt: string | Date;
  author: { name: string };
};

type DashboardDocument = {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  visibility: string;
  visibilityLabel: string;
  createdAt: string | Date;
  article: { id: string; title: string } | null;
  uploadedBy: { name: string };
};

type TabId = "recent" | "published" | "drafts" | "archived" | "documents";

type DashboardOverviewProps = {
  recent: DashboardArticle[];
  published: DashboardArticle[];
  drafts: DashboardArticle[];
  archived: DashboardArticle[];
  documents: DashboardDocument[];
  counts: {
    recent: number;
    published: number;
    drafts: number;
    archived: number;
    documents: number;
  };
  isAdmin: boolean;
};

const TABS: { id: TabId; label: string }[] = [
  { id: "recent", label: "Récents" },
  { id: "published", label: "Publiés" },
  { id: "drafts", label: "Brouillons" },
  { id: "archived", label: "Archivés" },
  { id: "documents", label: "Documents" },
];

function isTabId(value: string | null): value is TabId {
  return TABS.some((tab) => tab.id === value);
}

export function DashboardOverview({
  recent,
  published,
  drafts,
  archived,
  documents,
  counts,
  isAdmin,
}: DashboardOverviewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: TabId = isTabId(tabParam) ? tabParam : "recent";

  const setTab = useCallback(
    (tab: TabId) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "recent") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const query = params.toString();
      router.replace(query ? `/admin?${query}` : "/admin", { scroll: false });
    },
    [router, searchParams],
  );

  const tabCounts: Record<TabId, number> = {
    recent: counts.recent,
    published: counts.published,
    drafts: counts.drafts,
    archived: counts.archived,
    documents: counts.documents,
  };

  const own = isAdmin ? "" : "Vous n’avez ";
  const emptyPrefix = isAdmin ? "Aucun" : `${own}aucun`;

  return (
    <section
      className="overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm"
      data-tour-id="admin.dashboard.recents"
    >
      <div className="border-b border-primary/10 bg-bg-soft/30 px-4 pt-3 sm:px-5">
        <div
          className="flex flex-wrap items-end gap-1 overflow-x-auto overflow-y-hidden sm:overflow-visible"
          role="tablist"
          aria-label="Aperçu du compte"
        >
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setTab(tab.id)}
                className={cn(
                  "relative shrink-0 rounded-t-lg px-3.5 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white text-accent-dark shadow-[0_-1px_0_0_white]"
                    : "text-primary/60 hover:bg-white/60 hover:text-primary-dark",
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "ml-2 inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold",
                    isActive ? "bg-accent/20 text-accent-dark" : "bg-primary/10 text-primary/55",
                  )}
                >
                  {tabCounts[tab.id]}
                </span>
                {isActive ? (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-accent"
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-0" role="tabpanel">
        {activeTab === "recent" ? (
          <ArticlesTable
            items={recent}
            empty={`${emptyPrefix} contenu pour le moment.`}
            seeAllHref="/admin/articles"
            seeAllLabel="Voir tous les articles"
          />
        ) : null}

        {activeTab === "published" ? (
          <ArticlesTable
            items={published}
            empty={
              isAdmin
                ? "Aucun article publié pour le moment."
                : "Vous n’avez pas encore d’article publié."
            }
            seeAllHref="/admin/articles?status=PUBLISHED"
            seeAllLabel="Voir tous les publiés"
          />
        ) : null}

        {activeTab === "drafts" ? (
          <ArticlesTable
            items={drafts}
            empty={
              isAdmin
                ? "Aucun brouillon en cours."
                : "Vous n’avez aucun brouillon en cours."
            }
            seeAllHref="/admin/articles?status=DRAFT"
            seeAllLabel="Voir tous les brouillons"
          />
        ) : null}

        {activeTab === "archived" ? (
          <ArticlesTable
            items={archived}
            empty={
              isAdmin
                ? "Aucun article archivé."
                : "Vous n’avez aucun article archivé."
            }
            seeAllHref="/admin/articles?status=ARCHIVED"
            seeAllLabel="Voir tous les archivés"
          />
        ) : null}

        {activeTab === "documents" ? (
          <DocumentsTable
            items={documents}
            empty={
              isAdmin
                ? "Aucun document uploadé."
                : "Vous n’avez encore uploadé aucun document."
            }
            isAdmin={isAdmin}
          />
        ) : null}
      </div>
    </section>
  );
}

function ArticlesTable({
  items,
  empty,
  seeAllHref,
  seeAllLabel,
}: {
  items: DashboardArticle[];
  empty: string;
  seeAllHref: string;
  seeAllLabel: string;
}) {
  if (items.length === 0) {
    return <EmptyState message={empty} href={seeAllHref} label={seeAllLabel} />;
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-primary/10 bg-bg-soft/40 text-left">
            <tr>
              <th className="px-4 py-3 font-heading font-semibold text-primary-dark sm:px-5">
                Titre
              </th>
              <th className="hidden px-4 py-3 font-heading font-semibold text-primary-dark desk-sm:table-cell">
                Auteur
              </th>
              <th className="px-4 py-3 font-heading font-semibold text-primary-dark">Statut</th>
              <th className="hidden px-4 py-3 font-heading font-semibold text-primary-dark desk-md:table-cell">
                Mis à jour
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {items.map((article) => (
              <tr key={article.id} className="transition-colors hover:bg-bg-soft/35">
                <td className="px-4 py-3 sm:px-5">
                  <Link
                    href={`/admin/articles/${article.id}`}
                    className="font-medium text-primary-dark hover:text-accent-dark"
                  >
                    {article.title}
                  </Link>
                </td>
                <td className="hidden px-4 py-3 text-primary/65 desk-sm:table-cell">
                  {article.author.name}
                </td>
                <td className="px-4 py-3">
                  <ArticleStatusBadge status={article.status} />
                </td>
                <td className="hidden px-4 py-3 text-primary/55 desk-md:table-cell">
                  {formatDate(article.updatedAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FooterLink href={seeAllHref} label={seeAllLabel} />
    </div>
  );
}

function DocumentsTable({
  items,
  empty,
  isAdmin,
}: {
  items: DashboardDocument[];
  empty: string;
  isAdmin: boolean;
}) {
  if (items.length === 0) {
    return (
      <EmptyState message={empty} href="/admin/documents" label="Gérer les documents" />
    );
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-primary/10 bg-bg-soft/40 text-left">
            <tr>
              <th className="px-4 py-3 font-heading font-semibold text-primary-dark sm:px-5">
                Titre
              </th>
              <th className="hidden px-4 py-3 font-heading font-semibold text-primary-dark desk-sm:table-cell">
                Taille
              </th>
              <th className="hidden px-4 py-3 font-heading font-semibold text-primary-dark desk-md:table-cell">
                Lié à
              </th>
              {isAdmin ? (
                <th className="hidden px-4 py-3 font-heading font-semibold text-primary-dark desk-lg:table-cell">
                  Par
                </th>
              ) : null}
              <th className="px-4 py-3 font-heading font-semibold text-primary-dark">Visibilité</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/10">
            {items.map((document) => (
              <tr key={document.id} className="transition-colors hover:bg-bg-soft/35">
                <td className="px-4 py-3 sm:px-5">
                  <Link
                    href="/admin/documents"
                    className="font-medium text-primary-dark hover:text-accent-dark"
                  >
                    {document.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-primary/45">{document.fileName}</p>
                </td>
                <td className="hidden px-4 py-3 text-primary/65 desk-sm:table-cell">
                  {(document.fileSize / 1024).toFixed(1)} Ko
                </td>
                <td className="hidden px-4 py-3 text-primary/65 desk-md:table-cell">
                  {document.article?.title ?? "—"}
                </td>
                {isAdmin ? (
                  <td className="hidden px-4 py-3 text-primary/65 desk-lg:table-cell">
                    {document.uploadedBy.name}
                  </td>
                ) : null}
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
                      document.visibility === "PUBLIC"
                        ? "bg-accent/15 text-accent-dark"
                        : document.visibility === "CONTRIBUTOR"
                          ? "bg-sky-100 text-sky-800"
                          : "bg-primary/10 text-primary/60",
                    )}
                  >
                    {document.visibilityLabel}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FooterLink href="/admin/documents" label="Voir tous les documents" />
    </div>
  );
}

function EmptyState({
  message,
  href,
  label,
}: {
  message: string;
  href: string;
  label: string;
}) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm text-primary/60">{message}</p>
      <Link
        href={href}
        className="mt-4 inline-flex text-sm font-medium text-accent-dark hover:underline"
      >
        {label}
      </Link>
    </div>
  );
}

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <div className="border-t border-primary/10 px-4 py-3 text-right sm:px-5">
      <Link href={href} className="text-sm font-medium text-accent-dark hover:underline">
        {label} →
      </Link>
    </div>
  );
}
