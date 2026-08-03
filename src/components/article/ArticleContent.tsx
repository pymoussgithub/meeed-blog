import { rewriteCloudinaryRawDocumentLinks } from "@/lib/inline-document";

type ArticleContentProps = {
  html: string;
};

export function ArticleContent({ html }: ArticleContentProps) {
  const content = rewriteCloudinaryRawDocumentLinks(html);

  return (
    <div
      className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:text-primary-dark prose-a:text-accent-dark prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
