import { useMemo, useState } from "react";
import type { FavoriteQuote } from "../context/UserContext";
import type { FavoritesPageCopy, Lang, QuoteCategory } from "../i18n/copy";

type FavoritesPageProps = {
  favorites: FavoriteQuote[];
  copy: FavoritesPageCopy;
  categoryOptions: Array<{ id: QuoteCategory; label: string }>;
  onRemove: (favorite: FavoriteQuote) => void;
  isAuthenticated: boolean;
};

export default function FavoritesPage({
  favorites,
  copy,
  categoryOptions,
  onRemove,
  isAuthenticated,
}: FavoritesPageProps) {
  const [categoryFilter, setCategoryFilter] = useState<"all" | QuoteCategory>("all");
  const [langFilter, setLangFilter] = useState<"all" | Lang>("all");

  const categoryLabelMap = useMemo(
    () => new Map(categoryOptions.map(({ id, label }) => [id, label])),
    [categoryOptions]
  );

  const groupedFavorites = useMemo(() => {
    const grouped = new Map<QuoteCategory, FavoriteQuote[]>();
    favorites.forEach((favorite) => {
      const matchesCategory =
        categoryFilter === "all" || favorite.category === categoryFilter;
      const matchesLang = langFilter === "all" || favorite.lang === langFilter;
      if (!matchesCategory || !matchesLang) return;
      const bucket = grouped.get(favorite.category);
      if (bucket) {
        bucket.push(favorite);
      } else {
        grouped.set(favorite.category, [favorite]);
      }
    });
    return grouped;
  }, [categoryFilter, favorites, langFilter]);

  const hasFavorites = favorites.length > 0;
  const filteredCount = useMemo(() => {
    let total = 0;
    groupedFavorites.forEach((list) => {
      total += list.length;
    });
    return total;
  }, [groupedFavorites]);

  const renderedGroups = useMemo(() => {
    if (categoryFilter !== "all") {
      const target = groupedFavorites.get(categoryFilter);
      if (!target) return [];
      return [
        {
          id: categoryFilter,
          label: categoryLabelMap.get(categoryFilter) ?? categoryFilter,
          items: target,
        },
      ];
    }

    return categoryOptions
      .map(({ id, label }) => ({ id, label, items: groupedFavorites.get(id) ?? [] }))
      .filter(({ items }) => items.length > 0);
  }, [categoryFilter, categoryLabelMap, categoryOptions, groupedFavorites]);

  return (
    <div className="mt-12 space-y-6">
      <header className="rounded-3xl border border-white/70 bg-white/60 px-6 py-6 text-center shadow-[0_12px_48px_rgba(20,73,63,0.1)] backdrop-blur-xl sm:text-left">
        <h1 className="text-2xl font-semibold text-teal-950 sm:text-3xl">
          {copy.title}
        </h1>
        <p className="mt-2 text-sm text-teal-700/80 sm:text-base">{copy.subtitle}</p>
        {hasFavorites && (
          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-teal-600/80">
            {filteredCount} / {favorites.length}
          </p>
        )}
      </header>

      {!isAuthenticated ? (
        <div className="rounded-3xl border border-white/70 bg-white/55 px-6 py-8 text-center text-teal-800 shadow-[0_12px_48px_rgba(20,73,63,0.1)]">
          <p className="text-sm sm:text-base">{copy.empty}</p>
        </div>
      ) : !hasFavorites ? (
        <div className="rounded-3xl border border-white/70 bg-white/55 px-6 py-8 text-center text-teal-800 shadow-[0_12px_48px_rgba(20,73,63,0.1)]">
          <p className="text-sm sm:text-base">{copy.empty}</p>
        </div>
      ) : (
        <section className="space-y-6">
          <div className="flex flex-col gap-4 rounded-3xl border border-white/70 bg-white/60 px-6 py-5 shadow-[0_12px_48px_rgba(20,73,63,0.08)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700/70">
                {copy.categoryFilterLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                <ToggleButton
                  label={copy.allOption}
                  active={categoryFilter === "all"}
                  onClick={() => setCategoryFilter("all")}
                />
                {categoryOptions.map(({ id, label }) => (
                  <ToggleButton
                    key={id}
                    label={label}
                    active={categoryFilter === id}
                    onClick={() => setCategoryFilter(id)}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700/70">
                {copy.langFilterLabel}
              </span>
              <div className="flex flex-wrap gap-2">
                <ToggleButton
                  label={copy.allOption}
                  active={langFilter === "all"}
                  onClick={() => setLangFilter("all")}
                />
                {Object.entries(copy.langOptions).map(([lang, label]) => (
                  <ToggleButton
                    key={lang}
                    label={label}
                    active={langFilter === lang}
                    onClick={() => setLangFilter(lang as Lang)}
                  />
                ))}
              </div>
            </div>
          </div>

          {filteredCount === 0 ? (
            <div className="rounded-3xl border border-white/70 bg-white/55 px-6 py-8 text-center text-teal-800 shadow-[0_12px_48px_rgba(20,73,63,0.1)]">
              <p className="text-sm sm:text-base">{copy.emptyFiltered}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {renderedGroups.map(({ id, label, items }) => (
                <article
                  key={id}
                  className="rounded-3xl border border-white/70 bg-white/70 px-6 py-6 shadow-[0_12px_48px_rgba(20,73,63,0.08)]"
                >
                  <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-teal-950 sm:text-xl">
                        {label}
                      </h2>
                      <p className="text-sm text-teal-700/75">
                        {items.length}{" "}
                        {items.length === 1 ? copy.countSingular : copy.countPlural}
                      </p>
                    </div>
                  </header>

                  <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="group flex h-full flex-col justify-between rounded-2xl border border-teal-100/80 bg-white/80 p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md"
                      >
                        <div>
                          <p className="text-sm text-teal-950">“{item.text}”</p>
                          {item.author && (
                            <p className="mt-2 text-xs text-teal-700/75">— {item.author}</p>
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-teal-100/70 bg-teal-50 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-700/80">
                            {item.lang.toUpperCase()}
                          </span>
                          <button
                            type="button"
                            onClick={() => onRemove(item)}
                            className="ml-auto inline-flex items-center rounded-full border border-transparent bg-teal-600 px-3 py-[3px] text-xs font-semibold uppercase tracking-[0.18em] text-white shadow-sm transition hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                          >
                            {copy.remove}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

type ToggleButtonProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function ToggleButton({ label, active, onClick }: ToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-[1px] ${
        active
          ? "border-teal-500/70 bg-teal-500/15 text-teal-900 shadow-sm"
          : "border-teal-200/60 bg-white/70 text-teal-700/80 hover:bg-white/90"
      }`}
    >
      {label}
    </button>
  );
}
