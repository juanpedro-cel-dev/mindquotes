import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ZenShell from "./components/ZenShell";
import AdBox from "./components/AdBox";
import MusicPlayer from "./components/MusicPlayer";
import FeedbackPage from "./components/FeedbackPage";
import FavoritesPage from "./components/FavoritesPage";
import JournalPage from "./components/JournalPage";
import PomodoroZen from "./components/PomodoroZen";
import PrivacyPage from "./components/PrivacyPage";
import TermsPage from "./components/TermsPage";
import ContactPage from "./components/ContactPage";
import {
  useUser,
  createFavoriteId,
  type FavoriteQuote,
} from "./context/UserContext";
import { copy, type Lang, type QuoteCategory } from "./i18n/copy";
import { usePrefersReducedMotion } from "./hooks/usePrefersReducedMotion";
import { useAdsenseLoader } from "./hooks/useAdsenseLoader";

import quotesES from "./data/quotes.es.json";
import quotesEN from "./data/quotes.en.json";

type Quote = { text: string; author?: string; category: QuoteCategory };
type QuoteFilter = "all" | QuoteCategory;

type ViewId =
  | "quotes"
  | "favorites"
  | "journal"
  | "feedback"
  | "pomodoro"
  | "privacy"
  | "terms"
  | "contact";

type ThemeMode = "auto" | "light" | "dark";

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
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "auto";
    const stored = window.localStorage.getItem("mq_theme");
    return stored === "light" || stored === "dark" || stored === "auto"
      ? (stored as ThemeMode)
      : "auto";
  });
  const resolveViewFromHash = (hash: string): ViewId => {
    switch (hash) {
      case "#/favorites":
        return "favorites";
      case "#/journal":
        return "journal";
      case "#/feedback":
        return "feedback";
      case "#/pomodoro":
        return "pomodoro";
      case "#/privacy":
        return "privacy";
      case "#/terms":
        return "terms";
      case "#/contact":
        return "contact";
      default:
        return "quotes";
    }
  };

  const [view, setView] = useState<ViewId>(() => {
    if (typeof window === "undefined") return "quotes";
    return resolveViewFromHash(window.location.hash);
  });
  const {
    user,
    register,
    login,
    logout,
    toggleFavorite,
    setFocusMode,
    submitFeedback,
  } =
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
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [nameDraft, setNameDraft] = useState("");
  const [emailDraft, setEmailDraft] = useState("");
  const [passwordDraft, setPasswordDraft] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [selectedTrackMood, setSelectedTrackMood] =
    useState<QuoteCategory | null>(() => copy.es.quotes.filters[0]?.id ?? null);
  const [autoPlayMood, setAutoPlayMood] =
    useState<QuoteCategory | null>(null);
  const adsenseClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;
  const premiumCheckoutUrl = import.meta.env.VITE_PREMIUM_CHECKOUT_URL ?? "";
  const billingPortalUrl = import.meta.env.VITE_BILLING_PORTAL_URL ?? "";

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
  const planFeatures = user?.features;
  const canUseFocusFeatures = planFeatures?.focusMode ?? false;
  const canUseCloudJournal = planFeatures?.cloudJournal ?? false;
  const showAdsForUser = user ? user.showAds : true;
  const shouldRenderAds = !focusMode && showAdsForUser;
  useAdsenseLoader(Boolean(showAdsForUser && adsenseClientId), adsenseClientId);
  const planActionUrl = user
    ? user.premium
      ? billingPortalUrl || premiumCheckoutUrl
      : premiumCheckoutUrl
    : premiumCheckoutUrl;

  useEffect(() => {
    localStorage.setItem("mq_lang", lang);
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("mq_theme", themeMode);
  }, [themeMode]);

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setDarkMode(false);
      return;
    }
    const computeDark = () => {
      if (themeMode === "dark") return true;
      if (themeMode === "light") return false;
      const hour = new Date().getHours();
      const isNight = hour >= 20 || hour < 7;
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      return prefersDark || isNight;
    };
    setDarkMode(computeDark());
  }, [themeMode]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const syncFromHash = () => {
      setView(resolveViewFromHash(window.location.hash));
    };
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const targetHash =
      view === "favorites"
        ? "#/favorites"
        : view === "journal"
        ? "#/journal"
        : view === "feedback"
        ? "#/feedback"
        : view === "pomodoro"
        ? "#/pomodoro"
        : view === "privacy"
        ? "#/privacy"
        : view === "terms"
        ? "#/terms"
        : view === "contact"
        ? "#/contact"
        : "#/";
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash;
    }
  }, [view]);

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
    if (user) {
      setAuthMode("login");
      setAuthError(null);
      setAuthInfo(null);
      setPasswordDraft("");
    } else {
      setFavoritesOpen(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !canUseFocusFeatures && focusMode) {
      setFocusMode(false);
    }
  }, [canUseFocusFeatures, focusMode, setFocusMode, user]);

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
  const planCtaLabel = user?.premium ? t.user.managePlan : t.user.upgradeCta;
  const planCtaDescription = user?.premium
    ? t.user.manageDescription
    : t.user.upgradeDescription;
  const planCtaDisabled = !planActionUrl;
  const planCtaTitle = planCtaDisabled ? t.user.upgradeUnavailable : undefined;
  const planStatusText = user?.premium ? t.user.premiumActive : t.user.freeActive;
  const filters = t.quotes.filters;
  const navItems = t.shell.nav;
  const activeNavId = view;
  const filterOptions: Array<{ id: QuoteFilter; label: string }> = [
    { id: "all", label: t.quotes.allLabel },
    ...filters,
  ];
  useEffect(() => {
    if (!filters.length) return;
    setSelectedTrackMood((current) => {
      if (current && filters.some(({ id }) => id === current)) {
        return current;
      }
      return filters[0]!.id;
    });
  }, [filters]);
  const handleNavigate = (id: string) => {
    const nextView: ViewId =
      id === "favorites" ||
      id === "journal" ||
      id === "feedback" ||
      id === "pomodoro" ||
      id === "privacy" ||
      id === "terms" ||
      id === "contact"
        ? (id as ViewId)
        : "quotes";
    setView(nextView);
    if (nextView !== "quotes") {
      setFavoritesOpen(false);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const footerLinks = [
    {
      id: "privacy",
      label: lang === "es" ? "Política de privacidad" : "Privacy policy",
    },
    {
      id: "terms",
      label: lang === "es" ? "Términos y condiciones" : "Terms",
    },
    {
      id: "contact",
      label: lang === "es" ? "Contacto" : "Contact",
    },
  ] as const;

  const shellProps = {
    subtitle: t.shell.subtitle,
    navItems,
    activeNavId,
    onNavigate: handleNavigate,
    language: t.shell.language,
    onToggleLanguage: toggleLang,
    footerNote: t.shell.footer,
    footerLinks,
    onFooterNavigate: handleNavigate,
    navAria: t.shell.navAria,
    logoAlt: t.shell.logoAlt,
    focusMode: view === "quotes" ? focusMode : false,
    darkMode,
    themeToggleLabel:
      themeMode === "dark"
        ? lang === "es"
          ? "Modo oscuro fijo"
          : "Dark mode (fixed)"
        : themeMode === "light"
        ? lang === "es"
          ? "Modo claro fijo"
          : "Light mode (fixed)"
        : lang === "es"
        ? "Modo automático (día/noche)"
        : "Auto mode (day/night)",
    onToggleTheme: handleToggleTheme,
    reduceMotion: prefersReducedMotion,
  } as const;
  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAuthError(null);
    setAuthInfo(null);

    const emailValue = emailDraft.trim();
    const passwordValue = passwordDraft.trim();
    const nameValue = nameDraft.trim();

    try {
      if (authMode === "login") {
        if (!emailValue || !passwordValue) return;
        await login({ email: emailValue, password: passwordValue });
        setPasswordDraft("");
      } else {
        if (!emailValue || !passwordValue || !nameValue) return;
        const result = await register({
          name: nameValue,
          email: emailValue,
          password: passwordValue,
        });
        setPasswordDraft("");
        if (result.verificationRequired) {
          setAuthInfo(t.login.verificationEmail);
        }
      }
    } catch (error: unknown) {
      console.error("[App] auth submit failed:", error);
      setAuthError(t.login.errors.generic);
    }
  };
  const hasQuotes = filteredQuotes.length > 0;
  const categoryLabelMap = useMemo(
    () => new Map(filters.map(({ id, label }) => [id, label])),
    [filters]
  );
  const favoritesPreview =
    user?.favorites.slice(-FAVORITES_PREVIEW_LIMIT).reverse() ?? [];
  const totalFavorites = user?.favorites.length ?? 0;
  const favoritesList = user ? [...user.favorites].reverse() : [];
  const journalStorageKey = useMemo(() => {
    if (user?.id) {
      return `mq_journal_${user.id}`;
    }
    if (user?.name?.trim()) {
      return `mq_journal_${user.name.trim().toLowerCase().replace(/\s+/g, "_")}`;
    }
    return "mq_journal_guest";
  }, [user]);

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
    if (!user || !canUseFocusFeatures) return;
    setFocusMode(!focusMode);
  };

  const handleSelectTrackMood = (mood: QuoteCategory) => {
    setSelectedTrackMood(mood);
    setAutoPlayMood(mood);
  };

  const handleStartPomodoroFromQuote = () => {
    let mood: QuoteCategory | null = null;
    if (current?.category) {
      mood = current.category;
    } else if (category !== "all") {
      mood = category as QuoteCategory;
    } else if (filters[0]) {
      mood = filters[0].id;
    }
    if (mood) {
      handleSelectTrackMood(mood);
    }
    setView("pomodoro");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePlanCta = () => {
    if (!planActionUrl) return;
    if (typeof window === "undefined") return;
    window.open(planActionUrl, "_blank", "noopener,noreferrer");
  };

  function handleToggleTheme() {
    setThemeMode((current) =>
      current === "auto" ? "dark" : current === "dark" ? "light" : "auto"
    );
  }

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
    "relative rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl shadow-[0_8px_30px_rgba(20,73,63,0.1)] p-8",
    focusMode
      ? "mx-auto max-w-4xl border-white/80 bg-white/75 shadow-[0_16px_50px_rgba(20,73,63,0.18)]"
      : "",
  ].join(" ");
  const quoteSectionClass = [
    "relative flex flex-col items-center text-center gap-6 transition-opacity duration-200",
    langFading ? "opacity-0" : "opacity-100",
    focusMode ? "mx-auto max-w-2xl" : "",
  ].join(" ");
  const blockquoteClass = [
    "mt-1 text-teal-950 text-2xl sm:text-3xl leading-relaxed tracking-tight transition-opacity duration-200",
    focusMode ? "sm:text-[2.2rem] lg:text-[2.6rem]" : "lg:text-[2rem]",
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

  const authHeading = authMode === "register" ? t.login.modeRegister : t.login.modeLogin;
  const authToggleLabel =
    authMode === "register" ? t.login.switchToLogin : t.login.switchToRegister;

  const leftPanel = user ? (
    <motion.section
      key="panel-logged"
      initial={primaryInitial}
      animate={{ opacity: 1, y: 0 }}
      transition={cardTransition}
      className="rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl px-6 py-6 shadow-[0_12px_48px_rgba(20,73,63,0.12)] flex flex-col gap-6"
    >
      <div className="space-y-1 text-center sm:text-left">
        <p className="text-lg font-semibold text-teal-950">
          {t.user.greeting}, {user.name}
        </p>
        <p className="text-sm text-teal-700/80">{planStatusText}</p>
      </div>

      <motion.div
        layout
        className="rounded-2xl border border-teal-200/60 bg-white/70 px-4 py-3 text-left shadow-sm"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700/70">
          {t.quotes.favoritesTitle}
        </p>
        {favoritesPreview.length ? (
          <motion.ul layout className="mt-2 flex flex-wrap gap-2 text-left">
            {favoritesPreview.map((fav) => (
              <motion.li
                layout
                key={fav.id}
                className="min-w-[12rem] max-w-[18rem] rounded-2xl border border-teal-200/60 bg-white/80 px-3 py-2 shadow-sm"
              >
                <p className="text-sm text-teal-900">“{fav.text}”</p>
                {fav.author && (
                  <p className="mt-1 text-xs text-teal-700/80">— {fav.author}</p>
                )}
                <span className="mt-2 inline-flex items-center rounded-full border border-teal-200/70 bg-white/70 px-2 py-[2px] text-[10px] font-semibold uppercase tracking-[0.24em] text-teal-600/80">
                  {categoryLabelMap.get(fav.category) ?? fav.category}
                </span>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <p className="mt-2 text-xs text-teal-700/70">{t.quotes.favoritesEmpty}</p>
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

      <div className="space-y-4">
        <div className="rounded-2xl border border-teal-200/60 bg-white/70 px-4 py-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700/70">
                {t.quotes.focusMode.title}
              </p>
              <p className="mt-1 text-xs text-teal-700/75">
                {t.quotes.focusMode.description}
              </p>
            </div>
            <button
              type="button"
              onClick={handleFocusToggle}
              disabled={!canUseFocusFeatures}
              className="inline-flex items-center justify-center rounded-full border border-teal-300/70 bg-white/85 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800 shadow-sm transition-all duration-200 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {focusMode ? t.quotes.focusMode.deactivate : t.quotes.focusMode.activate}
            </button>
          </div>
          {!canUseFocusFeatures && (
            <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-teal-600/70">
              {t.quotes.focusMode.premiumNotice}
            </p>
          )}
        </div>

        {!user.premium && t.user.benefits.length > 0 && (
          <div className="rounded-2xl border border-teal-200/60 bg-white/70 px-4 py-3 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700/70">
              {t.user.benefitsTitle}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-teal-800/80">
              {t.user.benefits.map((benefit) => (
                <li key={benefit} className="flex items-start gap-2">
                  <span
                    className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-500"
                    aria-hidden="true"
                  />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-2xl border border-teal-200/60 bg-white/70 px-4 py-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePlanCta}
              disabled={planCtaDisabled}
              title={planCtaTitle}
              className="inline-flex items-center justify-center rounded-full border border-teal-300/70 bg-white/80 px-5 py-2.5 text-sm font-semibold text-teal-800 shadow-sm transition-all duration-200 hover:bg-white/95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {planCtaLabel}
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
          <p className="text-xs text-teal-700/70">{planCtaDescription}</p>
        </div>
      </div>
    </motion.section>
  ) : (
    <motion.section
      key="panel-guest"
      initial={primaryInitial}
      animate={{ opacity: 1, y: 0 }}
      transition={cardTransition}
      className="rounded-3xl border border-white/70 bg-white/60 backdrop-blur-xl px-6 py-5 shadow-[0_12px_48px_rgba(20,73,63,0.12)]"
    >
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-teal-950 sm:text-xl">{authHeading}</h2>
        <button
          type="button"
          onClick={() => {
            setAuthMode(authMode === "register" ? "login" : "register");
            setAuthError(null);
            setAuthInfo(null);
          }}
          className="text-sm font-semibold text-teal-700 underline-offset-4 hover:underline"
        >
          {authToggleLabel}
        </button>
      </header>

      <form onSubmit={handleAuthSubmit} className="mt-5 space-y-3">
        {authMode === "register" && (
          <div className="space-y-2">
            <label
              htmlFor="auth-name"
              className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700/70"
            >
              {t.login.nameLabel}
            </label>
            <input
              id="auth-name"
              name="auth-name"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.currentTarget.value)}
              placeholder={t.login.namePlaceholder}
              className="w-full rounded-2xl border border-teal-200/80 bg-white/85 px-4 py-2 text-sm text-teal-950 shadow-inner shadow-teal-950/5 placeholder:text-teal-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition"
            />
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="auth-email"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700/70"
          >
            {t.login.emailLabel}
          </label>
          <input
            id="auth-email"
            name="auth-email"
            type="email"
            value={emailDraft}
            onChange={(event) => setEmailDraft(event.currentTarget.value)}
            placeholder={t.login.emailPlaceholder}
            className="w-full rounded-2xl border border-teal-200/80 bg-white/85 px-4 py-2 text-sm text-teal-950 shadow-inner shadow-teal-950/5 placeholder:text-teal-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="auth-password"
            className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700/70"
          >
            {t.login.passwordLabel}
          </label>
          <input
            id="auth-password"
            name="auth-password"
            type="password"
            value={passwordDraft}
            onChange={(event) => setPasswordDraft(event.currentTarget.value)}
            placeholder={t.login.passwordPlaceholder}
            className="w-full rounded-2xl border border-teal-200/80 bg-white/85 px-4 py-2 text-sm text-teal-950 shadow-inner shadow-teal-950/5 placeholder:text-teal-700/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white transition"
          />
          <p className="text-xs text-teal-700/60">{t.login.passwordHint}</p>
        </div>

        <button
          type="submit"
          className="w-full inline-flex items-center justify-center rounded-full bg-teal-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition-all duration-200 hover:bg-teal-700 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={
            authMode === "login"
              ? !emailDraft.trim() || !passwordDraft.trim()
              : !nameDraft.trim() ||
                !emailDraft.trim() ||
                passwordDraft.trim().length < 6
          }
        >
          {authMode === "login" ? t.login.submitLogin : t.login.submitRegister}
        </button>
      </form>

      {authError && (
        <p className="mt-3 rounded-2xl border border-red-200/60 bg-red-50/70 px-4 py-2 text-sm text-red-600/80">
          {authError}
        </p>
      )}
      {authInfo && (
        <p className="mt-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/80 px-4 py-2 text-sm text-emerald-700/80">
          {authInfo}
        </p>
      )}
    </motion.section>
  );

  if (view === "feedback") {
    return (
      <ZenShell {...shellProps}>
        <FeedbackPage
          copy={t.feedback}
          onSubmit={submitFeedback}
          onBack={() => handleNavigate("quotes")}
          reduceMotion={prefersReducedMotion}
          userName={user?.name}
          userEmail={user?.email}
        />
      </ZenShell>
    );
  }

  if (view === "favorites") {
    return (
      <ZenShell {...shellProps}>
        <FavoritesPage
          favorites={user?.favorites ?? []}
          copy={t.favoritesPage}
          categoryOptions={filters}
          onRemove={(favorite) => {
            void toggleFavorite(favorite);
          }}
          isAuthenticated={Boolean(user)}
        />
      </ZenShell>
    );
  }

  if (view === "journal") {
    return (
      <ZenShell {...shellProps}>
        <JournalPage
          copy={t.journalPage}
          storageKey={journalStorageKey}
          reduceMotion={prefersReducedMotion}
          lang={lang}
          userName={user?.name}
          userId={user?.id ?? null}
          cloudSyncAllowed={canUseCloudJournal}
          upgradeHint={t.journalPage.upgradePrompt}
        />
      </ZenShell>
    );
  }

  if (view === "pomodoro") {
    return (
      <ZenShell {...shellProps}>
        <section className="mt-12 grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <PomodoroZen lang={lang} reduceMotion={prefersReducedMotion} />
          <motion.div
            layout
            initial={primaryQuoteInitial}
            animate={{ opacity: 1, y: 0 }}
            transition={cardTransition}
            className="flex min-w-0"
          >
            <MusicPlayer
              copy={t.music}
              trackMood={selectedTrackMood}
              autoPlayMood={autoPlayMood}
              onAutoPlayConsumed={() => setAutoPlayMood(null)}
              moodOptions={filters}
              onSelectMood={handleSelectTrackMood}
            />
          </motion.div>
          {shouldRenderAds && (
            <div className="lg:col-span-2">
              <AdBox ariaLabel={t.ad.ariaLabel} />
            </div>
          )}
        </section>
      </ZenShell>
    );
  }

  if (view === "privacy") {
    return (
      <ZenShell {...shellProps}>
        <PrivacyPage lang={lang} reduceMotion={prefersReducedMotion} />
      </ZenShell>
    );
  }

  if (view === "terms") {
    return (
      <ZenShell {...shellProps}>
        <TermsPage lang={lang} reduceMotion={prefersReducedMotion} />
      </ZenShell>
    );
  }

  if (view === "contact") {
    return (
      <ZenShell {...shellProps}>
        <ContactPage lang={lang} reduceMotion={prefersReducedMotion} />
      </ZenShell>
    );
  }

  return (
    <ZenShell {...shellProps}>
      <section className="mt-12 grid gap-6 lg:gap-8 lg:grid-cols-[minmax(0,360px)_minmax(0,1.45fr)_minmax(0,0.95fr)] xl:grid-cols-[minmax(0,360px)_minmax(0,1.6fr)_minmax(0,1fr)]">
        {leftPanel}
        <motion.div
          layout
          initial={primaryQuoteInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={cardTransition}
          className={quoteCardClass}
        >
          <section className={quoteSectionClass}>
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

            <motion.blockquote
              key={current?.text ?? "empty"}
              layout
              aria-live="polite"
              className={blockquoteClass}
            >
              “{current?.text ?? t.quotes.empty}”
            </motion.blockquote>

            {current?.author && (
              <p className="text-base text-teal-700/85">— {current.author}</p>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
              <button
                type="button"
                onClick={handleStartPomodoroFromQuote}
                className="inline-flex items-center justify-center rounded-full border border-teal-300/70 bg-white/75 px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-800 shadow-sm transition-all duration-200 hover:bg-white/95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
              >
                {t.quotes.pomodoroCta}
              </button>
            </div>

            <p className="mt-5 text-xs text-teal-700/70">{t.quotes.beta}</p>
          </section>
        </motion.div>

        <motion.div
          layout
          initial={primaryQuoteInitial}
          animate={{ opacity: 1, y: 0 }}
          transition={cardTransition}
          className="flex min-w-0"
        >
          <MusicPlayer
            copy={t.music}
            trackMood={selectedTrackMood}
            autoPlayMood={autoPlayMood}
            onAutoPlayConsumed={() => setAutoPlayMood(null)}
            moodOptions={filters}
            onSelectMood={handleSelectTrackMood}
          />
        </motion.div>

        {shouldRenderAds && (
          <div className="lg:col-span-3">
            <AdBox ariaLabel={t.ad.ariaLabel} />
          </div>
        )}
      </section>

      <section className="mt-10 max-w-3xl mx-auto rounded-3xl border border-white/70 bg-white/70 px-6 py-6 shadow-[0_12px_48px_rgba(20,73,63,0.12)]">
        <h2 className="text-lg font-semibold text-teal-950 sm:text-xl">
          {lang === "es" ? "Sobre MindQuotes" : "About MindQuotes"}
        </h2>
        <p className="mt-3 text-sm text-teal-800/85 sm:text-base">
          {lang === "es"
            ? "MindQuotes es un espacio digital creado para inspirar calma, enfoque y positividad a través de frases seleccionadas con cariño. Un refugio de serenidad en la era del ruido."
            : "MindQuotes is a digital space created to inspire calm, focus, and positivity through carefully selected quotes. A small refuge of serenity in the age of constant noise."}
        </p>
      </section>

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
