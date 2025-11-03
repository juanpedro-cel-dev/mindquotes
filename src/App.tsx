import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import ZenShell from "./components/ZenShell";
import AdBox from "./components/AdBox";
import MusicPlayer from "./components/MusicPlayer";
import {
  useUser,
  createFavoriteId,
  type FavoriteQuote,
} from "./context/UserContext";
import { copy, type Lang, type QuoteCategory } from "./i18n/copy";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";

import quotesES from "./data/quotes.es.json";
import quotesEN from "./data/quotes.en.json";

type Quote = { text: string; author?: string; category: QuoteCategory };
type QuoteFilter = "all" | QuoteCategory;

const CATEGORY_STORAGE_KEY = "mq_quote_category";
const VALID_FILTERS: QuoteFilter[] = [
  "all",
  "inspiration",
  "motivation",
  "heartbreak",
];
const FAVORITES_PREVIEW_LIMIT = 4;

type LogoZenProps = {
  alt: string;
};

const createFavoritePayload = (
  quote: Quote,
  lang: Lang
): FavoriteQuote => ({
  id: createFavoriteId(quote.text, quote.author, lang),
  text: quote.text,
  author: quote.author,
  category: quote.category,
  lang,
});

/** Logo con fade-up zen al montar */
function LogoZen({ alt }: LogoZenProps) {
  return (
    <motion.img
      src="/logo-symbol.png"
      alt={alt}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
      className="w-24 sm:w-28 opacity-90 select-none drop-shadow-soft"
    />
  );
}

export default function App() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("mq_lang");
    return saved === "en" || saved === "es" ? (saved as Lang) : "es";
  });
  const { user, login, logout, togglePremium, toggleFavorite, setFocusMode } =
    useUser();
  const [category, setCategory] = useState<QuoteFilter>(() => {
    if (typeof window === "undefined") return "all";
    const saved = window.localStorage.getItem(
      CATEGORY_STORAGE_KEY
    ) as QuoteFilter | null;
    return saved && VALID_FILTERS.includes(saved) ? saved : "all";
  });
  const [current, setCurrent] = useState<Quote | null>(null);
  const [lastText, setLastText] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const [langFading, setLangFading] = useState(false);
  const [nameDraft, setNameDraft] = useState(user?.name ?? "");
  const [premiumDraft, setPremiumDraft] = useState(user?.premium ?? false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [selectedTrackMood, setSelectedTrackMood] =
    useState<QuoteCategory | null>(null);
  const [pendingTrackMood, setPendingTrackMood] =
    useState<QuoteCategory | null>(null);
  const [showTrackPrompt, setShowTrackPrompt] = useState(false);
  const [autoPlayMood, setAutoPlayMood] =
    useState<QuoteCategory | null>(null);
  const declinedMoodsRef = useRef<Set<QuoteCategory>>(new Set());

  const quotes = useMemo<Quote[]>(
    () => ((lang === "es" ? quotesES : quotesEN) as Quote[]),
    [lang]
  );
  const filteredQuotes = useMemo<Quote[]>(
    () =>
      category === "all"
        ? quotes
        : quotes.filter((quote) => quote.category === category),
    [category, quotes]
  );
  const focusMode = user?.focusMode ?? false;

  useEffect(() => {
    localStorage.setItem("mq_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CATEGORY_STORAGE_KEY, category);
  }, [category]);

  useEffect(() => {
    if (category === "all") {
      setPendingTrackMood(null);
      setShowTrackPrompt(false);
      return;
    }
    const mood = category as QuoteCategory;
    if (selectedTrackMood === mood) return;
    if (declinedMoodsRef.current.has(mood)) return;
    setPendingTrackMood(mood);
    setShowTrackPrompt(true);
  }, [category, selectedTrackMood]);

  useEffect(() => {
    if (!filteredQuotes.length) {
      setCurrent(null);
      setLastText(null);
      setFading(false);
      return;
    }
    const q = pickRandom(filteredQuotes, null);
    setCurrent(q);
    setLastText(q.text);
    setFading(false);
  }, [filteredQuotes]);

  useEffect(() => {
    setNameDraft(user?.name ?? "");
    setPremiumDraft(user?.premium ?? false);
    if (!user) {
      setFavoritesOpen(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !user.premium && focusMode) {
      setFocusMode(false);
    }
  }, [focusMode, setFocusMode, user]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nameDraft.trim()) return;
    login(nameDraft, premiumDraft);
  };

  const nextQuote = () => {
    if (!filteredQuotes.length) return;
    setFading(true);
    setTimeout(() => {
      const q = pickRandom(filteredQuotes, lastText);
      setCurrent(q);
      setLastText(q.text);
      setFading(false);
    }, 180);
  };

  const toggleLang = () => {
    setLangFading(true);
    setTimeout(() => {
      setLang((value) => (value === "es" ? "en" : "es"));
      setTimeout(() => setLangFading(false), 180);
    }, 140);
  };

  const t = copy[lang];
  const filters = t.quotes.filters;
  const filterOptions: Array<{ id: QuoteFilter; label: string }> = [
    { id: "all", label: t.quotes.allLabel },
    ...filters,
  ];
  const hasQuotes = filteredQuotes.length > 0;
  const categoryLabelMap = useMemo(
    () => new Map(filters.map(({ id, label }) => [id, label])),
    [filters]
  );
  const favoritesPreview =
    user?.favorites.slice(-FAVORITES_PREVIEW_LIMIT).reverse() ?? [];
  const totalFavorites = user?.favorites.length ?? 0;
  const favoritesList = user ? [...user.favorites].reverse() : [];

  const currentFavoriteId =
    current && user
      ? createFavoriteId(current.text, current.author, lang)
      : null;
  const isCurrentFavorite = Boolean(
    currentFavoriteId &&
      user?.favorites.some((fav) => fav.id === currentFavoriteId)
  );

  const handleToggleFavorite = () => {
    if (!user || !current) return;
    const payload = createFavoritePayload(current, lang);
    toggleFavorite(payload);
  };

  const handleFocusToggle = () => {
    if (!user || !user.premium) return;
    setFocusMode(!focusMode);
  };

  const handleAcceptTrack = () => {
    if (!pendingTrackMood) return;
    setSelectedTrackMood(pendingTrackMood);
    setAutoPlayMood(pendingTrackMood);
    declinedMoodsRef.current.delete(pendingTrackMood);
    setPendingTrackMood(null);
    setShowTrackPrompt(false);
  };

  const handleDeclineTrack = () => {
    if (pendingTrackMood) {
      declinedMoodsRef.current.add(pendingTrackMood);
    }
    setPendingTrackMood(null);
    setShowTrackPrompt(false);
  };

  const handleDisableTrack = () => {
    setSelectedTrackMood(null);
    setAutoPlayMood(null);
  };

  useEffect(() => {
    if (!favoritesOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFavoritesOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [favoritesOpen]);

  const favoritesTitleId = "favorites-dialog-title";
  const favoritesDescId = "favorites-dialog-description";
  const quoteCardClass = [
    "relative mt-10 rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgba(20,73,63,0.1)] p-8",
    focusMode
      ? "mx-auto mt-12 max-w-4xl border-white/80 bg-white/75 shadow-[0_16px_50px_rgba(20,73,63,0.18)]"
      : "",
  ].join(" ");
  const quoteSectionClass = [
    "relative flex flex-col items-center text-center gap-6 transition-opacity duration-200",
    langFading ? "opacity-0" : "opacity-100",
    focusMode ? "mx-auto max-w-2xl" : "",
  ].join(" ");
  const blockquoteClass = [
    "mt-1 text-teal-950 text-xl sm:text-2xl leading-relaxed transition-opacity duration-200",
    focusMode ? "sm:text-3xl" : "",
    fading ? "opacity-0" : "opacity-100",
  ].join(" ");
  const cardTransition = useMemo(
    () =>
      prefersReducedMotion
        ? { duration: 0 }
        : ({ duration: 0.45, ease: "easeOut" } as const),
    [prefersReducedMotion]
  );
  const primaryInitial = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 16 };
  const primaryQuoteInitial = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 20 };
  const musicInitial = prefersReducedMotion
    ? { opacity: 1, y: 0 }
    : { opacity: 0, y: 18 };

  return (
    <ZenShell
      subtitle={t.shell.subtitle}
      navItems={t.shell.nav}
      language={t.shell.language}
      onToggleLanguage={toggleLang}
      footerNote={t.shell.footer}
      navAria={t.shell.navAria}
      logoAlt={t.shell.logoAlt}
      focusMode={focusMode}
      reduceMotion={prefersReducedMotion}
    >
      <section className="mt-12 sm:mt-14 space-y-6">
        {user ? (
          <motion.div
            initial={primaryInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={cardTransition}
            className="rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgba(20,73,63,0.08)] px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-3 text-center sm:text-left">
              <div>
                <p className="text-base font-semibold text-teal-950">
                  {t.user.greeting}, {user.name}
                </p>
                <p className="text-sm text-teal-700/80">
                  {user.premium ? t.user.premiumActive : t.user.freeActive}
                </p>
              </div>

              <motion.div
                layout
                className="rounded-2xl border border-teal-200/50 bg-white/60 px-4 py-3 text-left shadow-sm"
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700/70">
                  {t.quotes.favoritesTitle}
                </p>
                {favoritesPreview.length ? (
                  <motion.ul
                    layout
                    className="mt-2 flex flex-wrap gap-2 text-left"
                  >
                    {favoritesPreview.map((fav) => (
                      <motion.li
                        layout
                        key={fav.id}
                        className="min-w-[12rem] max-w-[18rem] rounded-2xl border border-teal-200/60 bg-white/80 px-3 py-2 shadow-sm"
                      >
                        <p className="text-sm text-teal-900">
                          “{fav.text}”
                        </p>
                        {fav.author && (
                          <p className="mt-1 text-xs text-teal-700/80">
                            — {fav.author}
                          </p>
                        )}
                        <span className="mt-2 inline-flex items-center rounded-full border border-teal-200/70 bg-white/70 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-600/80">
                          {categoryLabelMap.get(fav.category) ?? fav.category}
                        </span>
                      </motion.li>
                    ))}
                  </motion.ul>
                ) : (
                  <p className="mt-2 text-xs text-teal-700/70">
                    {t.quotes.favoritesEmpty}
                  </p>
                )}
                {totalFavorites > 0 && (
                  <button
                    type="button"
                    onClick={() => setFavoritesOpen(true)}
                    className="mt-3 inline-flex items-center justify-center rounded-full border border-teal-300/70 bg-white/75 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-800 shadow-sm transition-all duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
                  >
                    {t.quotes.favoritesAction}
                  </button>
                )}
              </motion.div>

              <div className="rounded-2xl border border-teal-200/50 bg-white/65 px-4 py-3 text-left shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700/70">
                  {t.quotes.focusMode.title}
                </p>
                <p className="mt-1 text-xs text-teal-700/75">
                  {t.quotes.focusMode.description}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleFocusToggle}
                    disabled={!user.premium}
                    aria-pressed={focusMode}
                    title={!user.premium ? t.quotes.focusMode.premiumNotice : undefined}
                    className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                      focusMode
                        ? "border-teal-500/80 bg-teal-100/70 text-teal-900 shadow-inner shadow-teal-900/10"
                        : "border-teal-300/70 bg-white/80 text-teal-800 hover:bg-white"
                    }`}
                  >
                    {focusMode
                      ? t.quotes.focusMode.deactivate
                      : t.quotes.focusMode.activate}
                  </button>
                  {!user.premium && (
                    <span className="text-[10px] uppercase tracking-[0.22em] text-teal-600/70">
                      {t.quotes.focusMode.premiumNotice}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  void togglePremium();
                }}
                aria-pressed={user.premium}
                className="inline-flex items-center justify-center rounded-full border border-teal-300/70 bg-white/80 px-5 py-2.5 text-sm font-semibold text-teal-800 shadow-sm transition-all duration-200 hover:bg-white/95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
              >
                {user.premium ? t.user.toggleToFree : t.user.toggleToPremium}
              </button>
              <button
                type="button"
                onClick={() => {
                  void logout();
                }}
                className="inline-flex items-center justify-center rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
              >
                {t.user.logout}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            initial={primaryInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={cardTransition}
            onSubmit={handleLogin}
            className="rounded-3xl border border-white/70 bg-white/55 backdrop-blur-xl shadow-[0_8px_30px_rgba(20,73,63,0.08)] px-6 py-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"
          >
            <div className="w-full sm:max-w-xs">
              <label
                htmlFor="user-name"
                className="block text-xs font-semibold uppercase tracking-[0.12em] text-teal-700/70"
              >
                {t.login.nameLabel}
              </label>
              <input
                id="user-name"
                name="user-name"
                value={nameDraft}
                onChange={(event) => setNameDraft(event.currentTarget.value)}
                placeholder={t.login.placeholder}
                className="mt-2 w-full rounded-2xl border border-teal-200/80 bg-white/80 px-4 py-2.5 text-sm text-teal-950 shadow-inner shadow-teal-950/5 placeholder:text-teal-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition"
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
              <label
                htmlFor="user-premium"
                className="inline-flex items-center gap-3 text-sm text-teal-800/85"
              >
                <input
                  id="user-premium"
                  type="checkbox"
                  checked={premiumDraft}
                  onChange={(event) =>
                    setPremiumDraft(event.currentTarget.checked)
                  }
                  className="h-5 w-5 rounded-md border border-teal-300/80 bg-white/90 text-teal-600 accent-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                />
                <span>{t.login.premiumLabel}</span>
              </label>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!nameDraft.trim()}
              >
                {t.login.submit}
              </button>
            </div>
          </motion.form>
        )}
      </section>

      <motion.div
        initial={musicInitial}
        animate={{ opacity: 1, y: 0 }}
        transition={cardTransition}
      >
        <MusicPlayer
          copy={t.music}
          trackMood={selectedTrackMood}
          autoPlayMood={autoPlayMood}
          onAutoPlayConsumed={() => setAutoPlayMood(null)}
          onDisableTrack={handleDisableTrack}
        />
      </motion.div>

      <motion.div
        initial={primaryQuoteInitial}
        animate={{ opacity: 1, y: 0 }}
        transition={cardTransition}
        className={quoteCardClass}
      >
        <section className={quoteSectionClass}>
          {/* Logo dentro de la tarjeta con animación fade-up */}
          <LogoZen alt={t.quotes.logoAlt} />

          <p className="mt-2 max-w-prose text-sm text-teal-700/80 sm:text-base">
            {t.quotes.tagline}
          </p>

          <div className="flex flex-col items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.24em] text-teal-600/80">
              {t.quotes.filterLabel}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {filterOptions.map(({ id, label }) => {
                const active = category === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCategory(id)}
                    aria-pressed={active}
                    className={`inline-flex items-center justify-center rounded-full border px-4 py-1.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 ${
                      active
                        ? "border-teal-500/80 bg-teal-500/15 text-teal-900 shadow-inner shadow-teal-900/10"
                        : "border-teal-200/70 bg-white/60 text-teal-800 hover:bg-white/85 hover:border-teal-400/70"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {showTrackPrompt && pendingTrackMood && (
            <div
              className="w-full max-w-md rounded-2xl border border-teal-200/60 bg-white/80 px-5 py-4 text-sm text-teal-900 shadow-sm sm:text-base"
              role="alert"
            >
              <p>{t.quotes.moodPrompt.question}</p>
              <div className="mt-3 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={handleAcceptTrack}
                  className="inline-flex items-center justify-center rounded-full bg-teal-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white shadow-md shadow-teal-900/15 transition-all duration-200 hover:bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
                >
                  {t.quotes.moodPrompt.accept}
                </button>
                <button
                  type="button"
                  onClick={handleDeclineTrack}
                  className="inline-flex items-center justify-center rounded-full border border-teal-300/70 bg-white/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 shadow-sm transition-all duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
                >
                  {t.quotes.moodPrompt.decline}
                </button>
              </div>
            </div>
          )}

          {current ? (
            <blockquote aria-live="polite" className={blockquoteClass}>
              “{current.text}”
              {current.author && (
                <footer className="mt-3 text-base text-teal-700/80">
                  — {current.author}
                </footer>
              )}
            </blockquote>
          ) : (
            <p className="max-w-prose text-sm text-teal-700/80">
              {t.quotes.empty}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleToggleFavorite}
              disabled={!user || !current}
              aria-pressed={isCurrentFavorite}
              className={`inline-flex items-center justify-center rounded-full border px-5 py-2 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${
                isCurrentFavorite
                  ? "border-teal-500/80 bg-teal-500/15 text-teal-900 shadow-inner shadow-teal-900/10"
                  : "border-teal-300/70 bg-white/70 text-teal-800 hover:bg-white/90"
              }`}
              title={!user ? t.quotes.saveLogin : undefined}
            >
              {isCurrentFavorite ? t.quotes.saved : t.quotes.save}
            </button>
            <button
              type="button"
              onClick={nextQuote}
              disabled={!hasQuotes}
              className="inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-teal-700 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t.quotes.newQuote}
            </button>
          </div>

          <p className="mt-5 text-xs text-teal-700/70">{t.quotes.beta}</p>
        </section>
      </motion.div>

      {!focusMode && !user?.premium && <AdBox ariaLabel={t.ad.ariaLabel} />}

      {favoritesOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
          <button
            type="button"
            onClick={() => setFavoritesOpen(false)}
            aria-label={t.quotes.favoritesClose}
            className="absolute inset-0 bg-emerald-950/40 backdrop-blur-sm transition-opacity"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby={favoritesTitleId}
            aria-describedby={favoritesDescId}
            className="relative z-10 w-full max-w-4xl rounded-3xl border border-white/70 bg-white/85 backdrop-blur-2xl p-6 shadow-[0_24px_80px_rgba(20,73,63,0.18)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id={favoritesTitleId}
                  className="text-lg font-semibold text-teal-950"
                >
                  {t.quotes.favoritesTitle}
                </h2>
                <p
                  id={favoritesDescId}
                  className="mt-1 text-sm text-teal-700/80"
                >
                  {t.quotes.favoritesSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setFavoritesOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-teal-200/70 bg-white/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-teal-800 shadow-sm transition-all duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
              >
                {t.quotes.favoritesClose}
              </button>
            </div>

            <div className="mt-6 max-h-[60vh] overflow-y-auto pr-1">
              {favoritesList.length ? (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {favoritesList.map((fav) => (
                    <li
                      key={fav.id}
                      className="group rounded-2xl border border-teal-200/60 bg-white/80 p-4 shadow-sm transition hover:border-teal-300 hover:shadow-md"
                    >
                      <p className="text-sm text-teal-950">“{fav.text}”</p>
                      {fav.author && (
                        <p className="mt-2 text-xs text-teal-700/80">
                          — {fav.author}
                        </p>
                      )}
                      <div className="mt-3 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-teal-200/70 bg-white/70 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-600/80">
                          {categoryLabelMap.get(fav.category) ?? fav.category}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-teal-100/70 bg-teal-50 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-700/80">
                          {fav.lang.toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleFavorite(fav)}
                          className="ml-auto inline-flex items-center rounded-full border border-transparent bg-teal-100/70 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-700 transition hover:bg-teal-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        >
                          {t.quotes.favoritesRemove}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-teal-700/80">
                  {t.quotes.favoritesEmptyDetail}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </ZenShell>
  );
}

function pickRandom(list: Quote[], last?: string | null): Quote {
  if (!list.length) {
    throw new Error("pickRandom requires a non-empty list");
  }
  if (list.length === 1) return list[0]!;
  let q: Quote;
  do {
    q = list[Math.floor(Math.random() * list.length)];
  } while (q.text === last);
  return q;
}

