type ArticleContentProps = {
  html: string;
};

export function ArticleContent({ html }: ArticleContentProps) {
  return (
    <div
      className="prose prose-neutral max-w-none prose-headings:font-bold prose-headings:text-primary-dark prose-a:text-accent-dark prose-img:rounded-xl"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
