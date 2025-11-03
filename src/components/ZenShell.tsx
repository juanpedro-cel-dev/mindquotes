import type { ReactNode } from "react";

type LanguageControl = {
  button: string;
  title: string;
  aria: string;
};

type ZenShellProps = {
  title?: string;
  subtitle: string;
  navItems: string[];
  language: LanguageControl;
  onToggleLanguage: () => void;
  footerNote: string;
  navAria: string;
  logoAlt: string;
  children?: ReactNode;
};

export default function ZenShell({
  title = "MindQuotes",
  subtitle,
  navItems,
  language,
  onToggleLanguage,
  footerNote,
  navAria,
  logoAlt,
  children,
}: ZenShellProps) {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(100%_100%_at_50%_0%,#e6fff3_0%,#d9f7ee_35%,#c7efe7_65%,#b7e7df_100%)] text-teal-950">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-200 hover:drop-shadow-[0_12px_40px_rgba(26,87,76,0.08)]">
          {/* Logo + eslogan */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img
              src="/logo-mindquotes.png"
              alt={logoAlt}
              className="w-16 sm:w-20 md:w-24 select-none drop-shadow-[0_4px_18px_rgba(26,87,76,0.18)]"
            />
            <div>
              <p className="font-semibold text-teal-900 leading-tight text-xl sm:text-2xl md:text-3xl">
                {subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Navegación (placeholder) */}
            <nav
              aria-label={navAria}
              className="flex items-center gap-3 text-teal-800/85 text-sm sm:text-base"
            >
              {navItems.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="px-3 py-1.5 rounded-2xl border border-transparent bg-white/20 transition-all duration-200 hover:bg-white/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-[1px]"
                >
                  {item}
                </button>
              ))}
            </nav>

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
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/60 py-6 text-center text-xs text-teal-800/70">
          <p>© {new Date().getFullYear()} {footerNote}</p>
        </footer>
      </div>
    </div>
  );
}
