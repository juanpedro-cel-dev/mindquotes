import type { ReactNode } from "react";

type LanguageControl = {
  button: string;
  title: string;
  aria: string;
};

type FooterLink = {
  id: string;
  label: string;
};

type ZenShellProps = {
  title?: string;
  subtitle: string;
  navItems: Array<{ id: string; label: string }>;
  activeNavId?: string;
  onNavigate?: (id: string) => void;
  language: LanguageControl;
  onToggleLanguage: () => void;
  footerNote: string;
  footerLinks?: readonly FooterLink[];
  onFooterNavigate?: (id: string) => void;
  navAria: string;
  logoAlt: string;
  focusMode?: boolean;
  darkMode?: boolean;
  themeToggleLabel?: string;
  themeIcon?: string;
  onToggleTheme?: () => void;
  reduceMotion?: boolean;
  children?: ReactNode;
};

export default function ZenShell({
  title = "MindQuotes",
  subtitle,
  navItems,
  activeNavId,
  onNavigate,
  language,
  onToggleLanguage,
  footerNote,
  footerLinks,
  onFooterNavigate,
  navAria,
  logoAlt,
  focusMode = false,
  darkMode = false,
  themeToggleLabel,
  themeIcon,
  onToggleTheme,
  reduceMotion = false,
  children,
}: ZenShellProps) {
  const wrapperClass = [
    "relative flex items-center gap-4 text-center sm:text-left",
    reduceMotion ? "" : "group",
  ].join(" ");
  const haloClass = [
    "pointer-events-none absolute inset-0 -z-10 rounded-3xl bg-gradient-to-br from-teal-100/0 via-teal-200/20 to-teal-400/15 blur-2xl opacity-0 transition duration-500",
    reduceMotion ? "" : "group-hover:scale-110 group-hover:opacity-60",
  ].join(" ");
  const logoClass = [
    "w-16 sm:w-20 md:w-24 select-none drop-shadow-[0_4px_18px_rgba(26,87,76,0.18)] transition-transform duration-300",
    reduceMotion ? "" : "group-hover:-translate-y-1 group-hover:rotate-1",
  ].join(" ");
  const subtitleClass = [
    "sm:text-left transition-all duration-300",
    reduceMotion ? "" : "group-hover:-translate-y-1",
  ].join(" ");
  const taglineClass = [
    "mt-1 block text-[11px] uppercase tracking-[0.28em] transition-colors duration-300",
    darkMode ? "text-slate-400" : "text-teal-700/60",
    reduceMotion ? "" : darkMode ? "group-hover:text-slate-100" : "group-hover:text-teal-600/90",
  ].join(" ");

  const rootClass = [
    "min-h-screen w-full",
    darkMode
      ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-50"
      : "bg-[radial-gradient(100%_100%_at_50%_0%,#e6fff3_0%,#d9f7ee_35%,#c7efe7_65%,#b7e7df_100%)] text-teal-950",
  ].join(" ");

  return (
    <div className={rootClass}>
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 hover:drop-shadow-[0_12px_40px_rgba(26,87,76,0.08)]">
          {/* Logo + eslogan */}
          <a href="#/" aria-label={logoAlt} className={wrapperClass}>
            <div className={haloClass} />

            <img src="/logo-mindquotes.png" alt={logoAlt} className={logoClass} />

            <div className={subtitleClass}>
              <p className="font-semibold text-teal-900 leading-tight text-xl sm:text-2xl md:text-3xl">
                {subtitle}
              </p>
              <span className={taglineClass}>
                {title}
              </span>
            </div>
          </a>

          <div className="flex items-center gap-3">
            {!focusMode && (
              <nav
                aria-label={navAria}
                className="flex items-center gap-3 text-teal-800/85 text-sm sm:text-base"
              >
                {navItems.map((item) => {
                  const active = item.id === activeNavId;
                  const baseClass =
                    "px-3 py-1.5 rounded-2xl border transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-[1px]";
                  const stateClass = active
                    ? "border-teal-500/70 bg-white/70 text-teal-900 shadow-md"
                    : "border-transparent bg-white/20 hover:bg-white/50 hover:shadow-md";
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onNavigate?.(item.id)}
                      className={`${baseClass} ${stateClass}`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            )}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="inline-flex items-center justify-center rounded-full border border-teal-300/70 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-900 shadow-sm transition-all duration-200 hover:bg-white/95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
                title={themeToggleLabel}
                aria-label={themeToggleLabel}
              >
                {themeIcon ?? (darkMode ? "☀︎" : "☾")}
              </button>
            )}
            <button
              type="button"
              onClick={onToggleLanguage}
              className="inline-flex items-center justify-center rounded-full border border-teal-300/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-900 shadow-sm transition-all duration-200 hover:bg-white/95 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-95"
              title={language.title}
              aria-label={language.aria}
            >
              {language.button}
            </button>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="pb-12">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/60 py-6 text-xs text-teal-800/70">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} {footerNote}
            </p>
            {footerLinks && footerLinks.length > 0 && (
              <nav
                aria-label="Legal and contact links"
                className="flex flex-wrap items-center justify-center gap-3"
              >
                {footerLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => onFooterNavigate?.(link.id)}
                    className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700/80 hover:text-teal-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-full px-3 py-1 bg-white/40 hover:bg-white/70 transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
