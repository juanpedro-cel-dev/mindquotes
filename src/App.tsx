import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ZenShell from "./components/ZenShell";
import AdBox from "./components/AdBox";
import MusicPlayer from "./components/MusicPlayer";
import { useUser } from "./context/UserContext";
import { copy, type Lang, type QuoteCategory } from "./i18n/copy";

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

const cardTransition = { duration: 0.45, ease: "easeOut" as const };

type LogoZenProps = {
  alt: string;
};

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
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem("mq_lang");
    return saved === "en" || saved === "es" ? (saved as Lang) : "es";
  });
  const { user, login, logout, togglePremium } = useUser();
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

  useEffect(() => {
    localStorage.setItem("mq_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CATEGORY_STORAGE_KEY, category);
  }, [category]);

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
  }, [user]);

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
  const hasQuotes = filteredQuotes.length > 0;

  const filterOptions: Array<{ id: QuoteFilter; label: string }> = [
    { id: "all", label: t.quotes.allLabel },
    ...filters,
  ];

  return (
    <ZenShell
      subtitle={t.shell.subtitle}
      navItems={t.shell.nav}
      language={t.shell.language}
      onToggleLanguage={toggleLang}
      footerNote={t.shell.footer}
      navAria={t.shell.navAria}
      logoAlt={t.shell.logoAlt}
    >
      <section className="mt-12 sm:mt-14 space-y-6">
        {user ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={cardTransition}
            className="rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgba(20,73,63,0.08)] px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-center sm:text-left">
              <p className="text-base font-semibold text-teal-950">
                {t.user.greeting}, {user.name}
              </p>
              <p className="text-sm text-teal-700/80">
                {user.premium ? t.user.premiumActive : t.user.freeActive}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={togglePremium}
                aria-pressed={user.premium}
                className="inline-flex items-center justify-center rounded-full border border-teal-300/70 bg-white/80 px-5 py-2.5 text-sm font-semibold text-teal-800 shadow-sm transition-all duration-200 hover:bg-white/95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
              >
                {user.premium ? t.user.toggleToFree : t.user.toggleToPremium}
              </button>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
              >
                {t.user.logout}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 16 }}
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

      <MusicPlayer copy={t.music} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={cardTransition}
        className="relative mt-10 rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgba(20,73,63,0.1)] p-8"
      >
        <section
          className={[
            "relative flex flex-col items-center text-center gap-6 transition-opacity duration-200",
            langFading ? "opacity-0" : "opacity-100",
          ].join(" ")}
        >
          {/* Logo dentro de la tarjeta con animación fade-up */}
          <LogoZen alt={t.quotes.logoAlt} />

          <p className="max-w-prose text-sm text-teal-700/80 mt-2">
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

          {current ? (
            <blockquote
              aria-live="polite"
              className={[
                "mt-1 text-teal-950 text-xl sm:text-2xl leading-relaxed transition-opacity duration-200",
                fading ? "opacity-0" : "opacity-100",
              ].join(" ")}
            >
              “{current.text}”
              {current.author && (
                <footer className="mt-3 text-teal-700/80 text-base">
                  — {current.author}
                </footer>
              )}
            </blockquote>
          ) : (
            <p className="max-w-prose text-sm text-teal-700/80">
              {t.quotes.empty}
            </p>
          )}

          <div className="mt-2 flex items-center justify-center">
            <button
              onClick={nextQuote}
              disabled={!hasQuotes}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-teal-600 text-white font-medium shadow-md hover:shadow-lg hover:bg-teal-700 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t.quotes.newQuote}
            </button>
          </div>

          <p className="mt-5 text-xs text-teal-700/70">{t.quotes.beta}</p>
        </section>
      </motion.div>

      {!user?.premium && <AdBox ariaLabel={t.ad.ariaLabel} />}
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
