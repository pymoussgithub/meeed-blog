import Link from "next/link";
import type { ForumIndexRow } from "@/lib/services/forum-category.service";
import { formatDate } from "@/lib/utils";

type ForumCategoryTableProps = {
  rows: ForumIndexRow[];
  emptyMessage?: string;
};

const topicTitleButtonClassName =
  "inline-flex max-w-full items-center rounded-full border border-accent/35 bg-white px-3 py-1 text-sm font-medium text-accent-dark transition-colors hover:border-accent hover:bg-bg-soft hover:text-accent";

function CategoryMeta({
  row,
  last,
}: {
  row: ForumIndexRow;
  last: ForumIndexRow["lastTopic"];
}) {
  return (
    <>
      <Link href={row.href} className="group block min-w-0" data-tour-id="forum.category.row">
        <span className="font-heading text-base font-semibold text-primary-dark group-hover:text-accent-dark">
          {row.name}
        </span>
        {row.description ? (
          <p className="mt-0.5 text-xs text-primary/55 sm:text-sm">{row.description}</p>
        ) : null}
      </Link>

      <div className="mt-2 space-y-1 text-xs text-primary/55 md:hidden">
        <p className="sm:hidden">
          {row.messagesCount} message{row.messagesCount > 1 ? "s" : ""}
        </p>
        {last ? (
          <div className="space-y-1">
            <p className="text-primary/65">
              <span className="font-medium text-primary/75">Dernière activité :</span>{" "}
              {last.title}
            </p>
            <p>
              {formatDate(last.lastPostAt)} · {last.lastAuthorName}
            </p>
          </div>
        ) : (
          <p>Aucune activité</p>
        )}
      </div>
    </>
  );
}

function MobileCategoryRow({ row }: { row: ForumIndexRow }) {
  const last = row.lastTopic;

  return (
    <div className="flex items-start gap-2 px-3 py-3 transition-colors hover:bg-bg-soft/40">
      <div className="min-w-0 flex-1">
        <CategoryMeta row={row} last={last} />
      </div>
      <p className="w-14 shrink-0 pt-0.5 text-center tabular-nums text-primary/65">
        {row.topicsCount}
      </p>
    </div>
  );
}

function CategoryRow({ row }: { row: ForumIndexRow }) {
  const last = row.lastTopic;

  return (
    <tr className="transition-colors hover:bg-bg-soft/40">
      <td className="px-4 py-3 text-left align-middle">
        <CategoryMeta row={row} last={last} />
      </td>

      <td className="px-3 py-3 text-center align-middle tabular-nums text-primary/65">
        {row.topicsCount}
      </td>

      <td className="hidden px-3 py-3 text-center align-middle tabular-nums text-primary/65 sm:table-cell">
        {row.messagesCount}
      </td>

      <td className="hidden px-4 py-3 text-center align-middle md:table-cell">
        {last ? (
          <div className="mx-auto flex min-w-0 max-w-sm flex-col items-center gap-1">
            <Link href={`/forum/s/${last.slug}`} className={topicTitleButtonClassName}>
              <span className="truncate">{last.title}</span>
            </Link>
            <p className="text-xs text-primary/50">
              {formatDate(last.lastPostAt)} · {last.lastAuthorName}
            </p>
          </div>
        ) : (
          <span className="text-primary/40">—</span>
        )}
      </td>
    </tr>
  );
}

export function ForumCategoryTable({
  rows,
  emptyMessage = "Aucune rubrique active pour le moment.",
}: ForumCategoryTableProps) {
  if (rows.length === 0) {
    return <p className="text-center text-primary/60">{emptyMessage}</p>;
  }

  const viewRows = rows.filter((row) => row.id.startsWith("view-"));
  const categoryRows = rows.filter((row) => !row.id.startsWith("view-"));

  return (
    <div
      className="overflow-hidden rounded-xl border border-primary/10 bg-white sm:overflow-x-auto"
      data-tour-id="forum.categories.table"
    >
      <div className="sm:hidden">
        <div className="flex border-b border-primary/10 bg-bg-soft/60 text-primary/70">
          <p className="min-w-0 flex-1 px-3 py-2.5 font-heading font-semibold text-primary-dark">
            Rubrique
          </p>
          <p className="w-14 shrink-0 px-1 py-2.5 text-center font-heading font-semibold text-primary-dark">
            Sujets
          </p>
        </div>
        <div className="divide-y divide-primary/10">
          {viewRows.map((row) => (
            <MobileCategoryRow key={row.id} row={row} />
          ))}
          {viewRows.length > 0 && categoryRows.length > 0 ? (
            <div className="h-2 bg-bg-soft/40" />
          ) : null}
          {categoryRows.map((row) => (
            <MobileCategoryRow key={row.id} row={row} />
          ))}
        </div>
      </div>

      <table className="hidden min-w-full text-sm sm:table">
        <thead className="border-b border-primary/10 bg-bg-soft/60 text-primary/70">
          <tr>
            <th className="min-w-[12rem] px-4 py-2.5 text-left font-heading font-semibold text-primary-dark">
              Rubrique
            </th>
            <th className="w-20 px-3 py-2.5 text-center font-heading font-semibold text-primary-dark">
              Sujets
            </th>
            <th className="hidden w-24 px-3 py-2.5 text-center font-heading font-semibold text-primary-dark sm:table-cell">
              Messages
            </th>
            <th className="hidden min-w-[14rem] whitespace-nowrap px-4 py-2.5 text-center font-heading font-semibold text-primary-dark md:table-cell">
              Dernière activité
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-primary/10">
          {viewRows.map((row) => (
            <CategoryRow key={row.id} row={row} />
          ))}
          {viewRows.length > 0 && categoryRows.length > 0 ? (
            <tr className="bg-bg-soft/40">
              <td
                colSpan={4}
                className="px-4 py-1.5 text-left text-xs font-medium uppercase tracking-wide text-primary/45"
              />
            </tr>
          ) : null}
          {categoryRows.map((row) => (
            <CategoryRow key={row.id} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
