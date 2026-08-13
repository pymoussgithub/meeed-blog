"use client";

import Link from "next/link";
import { ForumPostModerationActions } from "@/components/admin/ForumPostModerationActions";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

type PostRow = {
  id: string;
  body: string;
  createdAt: Date | string;
  isHidden: boolean;
  deletedAt: Date | string | null;
  author: { id: string; name: string };
  topic: {
    id: string;
    title: string;
    slug: string;
    category: { id: string; name: string; slug: string };
  };
};

type ForumPostsModerationTableProps = {
  posts: PostRow[];
};

function plainExcerpt(html: string, max = 120) {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export function ForumPostsModerationTable({ posts }: ForumPostsModerationTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full table-fixed text-sm">
        <thead className="border-b border-gray-200 bg-gray-50 text-left">
          <tr>
            <th className="w-[70%] px-4 py-3 font-medium desk-md:w-[28%]">Message</th>
            <th className="hidden px-4 py-3 font-medium desk-md:table-cell">Discussion</th>
            <th className="hidden px-4 py-3 font-medium desk-md:table-cell">Auteur</th>
            <th className="hidden px-4 py-3 font-medium desk-md:table-cell">Rubrique</th>
            <th className="w-[30%] px-4 py-3 font-medium desk-md:w-[10%]">État</th>
            <th className="hidden px-4 py-3 font-medium desk-md:table-cell">Date</th>
            <th className="hidden px-4 py-3 font-medium desk-md:table-cell">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {posts.map((post) => (
            <tr key={post.id} className="group hover:bg-gray-50/60">
              <td className="max-w-[280px] px-4 py-3">
                <Link
                  href={`/forum/s/${post.topic.slug}#post-${post.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="line-clamp-2 text-primary-dark hover:text-accent-dark"
                >
                  {plainExcerpt(post.body)}
                </Link>
              </td>
              <td className="hidden max-w-[180px] px-4 py-3 desk-md:table-cell">
                <Link
                  href={`/forum/s/${post.topic.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="line-clamp-2 font-medium text-primary-dark hover:text-accent-dark"
                >
                  {post.topic.title}
                </Link>
              </td>
              <td className="hidden px-4 py-3 text-primary/70 desk-md:table-cell">{post.author.name}</td>
              <td className="hidden max-w-[160px] truncate px-4 py-3 text-primary/70 desk-md:table-cell">
                {post.topic.category.name}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {post.deletedAt ? (
                    <Badge color="#c0392b">Supprimé</Badge>
                  ) : post.isHidden ? (
                    <Badge color="#e09f3e">Masqué</Badge>
                  ) : (
                    <Badge color="#4ecdc4">Visible</Badge>
                  )}
                </div>
              </td>
              <td className="hidden px-4 py-3 text-primary/70 desk-md:table-cell">{formatDate(post.createdAt)}</td>
              <td className="hidden px-4 py-3 desk-md:table-cell">
                <ForumPostModerationActions
                  postId={post.id}
                  isHidden={post.isHidden}
                  deletedAt={post.deletedAt}
                  compact
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
