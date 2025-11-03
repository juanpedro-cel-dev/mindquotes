import type { ReactNode } from "react";

type ZenShellProps = {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
};

export default function ZenShell({
  children,
  title = "MindQuotes",
  subtitle = "Calma, foco y constancia.",
}: ZenShellProps) {
  return (
    <div className="min-h-screen w-full bg-[radial-gradient(100%_100%_at_50%_0%,#e6fff3_0%,#d9f7ee_35%,#c7efe7_65%,#b7e7df_100%)]">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Logo + eslogan */}
          <div className="flex items-center gap-4 text-center sm:text-left">
            <img
              src="/logo-mindquotes.png"
              alt="MindQuotes logo"
              className="w-16 sm:w-20 md:w-24 select-none"
            />
            <h1 className="font-semibold text-teal-900 leading-tight text-xl sm:text-2xl md:text-3xl">
              {subtitle}
            </h1>
          </div>

          {/* Navegación (placeholder) */}
          <nav className="flex items-center gap-4 text-teal-800/80 text-sm sm:text-base">
            <span className="px-2 py-1 rounded-lg hover:bg-white/60 transition">Frases</span>
            <span className="px-2 py-1 rounded-lg hover:bg-white/60 transition">Favoritos</span>
            <span className="px-2 py-1 rounded-lg hover:bg-white/60 transition">Diario</span>
          </nav>
        </header>

        {/* Contenido principal */}
        <main className="pb-10">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/60 py-6 text-center text-xs text-teal-800/70">
          <p>© {new Date().getFullYear()} MindQuotes · Hecho con calma.</p>
        </footer>
      </div>
    </div>
  );
}
