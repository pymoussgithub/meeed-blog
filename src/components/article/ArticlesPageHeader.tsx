type ArticlesPageHeaderProps = {
  title: string;
  total: number;
  showCount: boolean;
};

export function ArticlesPageHeader({ title, total, showCount }: ArticlesPageHeaderProps) {
  return (
    <header className="mb-6">
      <p className="text-sm font-medium uppercase tracking-wider text-accent-dark">Actualités</p>
      <h1 className="mt-1 text-2xl sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-primary/60">
        Articles, retours d&apos;expérience et informations sur la transition agricole.
      </p>
      {showCount && total > 0 ? (
        <p className="mt-2 text-sm font-medium text-primary/50">
          {total} article{total > 1 ? "s" : ""}
        </p>
      ) : null}
    </header>
  );
}
