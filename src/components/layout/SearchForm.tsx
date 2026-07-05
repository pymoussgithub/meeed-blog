type SearchFormProps = {
  defaultValue?: string;
  className?: string;
  action?: string;
  hiddenFields?: Record<string, string>;
};

export function SearchForm({
  defaultValue = "",
  className = "",
  action = "/recherche",
  hiddenFields = {},
}: SearchFormProps) {
  return (
    <form action={action} method="get" className={className}>
      <label htmlFor="site-search" className="sr-only">
        Rechercher
      </label>
      <div className="flex gap-2">
        {Object.entries(hiddenFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <input
          id="site-search"
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="Rechercher un article…"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark"
        >
          OK
        </button>
      </div>
    </form>
  );
}
