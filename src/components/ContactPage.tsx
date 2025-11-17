import { motion } from "framer-motion";

type ContactPageProps = {
  lang: "es" | "en";
  reduceMotion?: boolean;
};

export default function ContactPage({ lang, reduceMotion = false }: ContactPageProps) {
  const isEs = lang === "es";
  const title = isEs ? "Contacto" : "Contact";
  const body = isEs
    ? "Si tienes dudas, propuestas de colaboración o ideas para mejorar MindQuotes, puedes escribirnos con calma. Leemos cada mensaje con atención."
    : "If you have questions, collaboration ideas, or suggestions to improve MindQuotes, feel free to reach out. Every message is read with care.";
  const emailLabel = isEs ? "Correo de contacto" : "Contact email";
  const note = isEs
    ? "Intentamos responder en un plazo razonable, siempre desde la calma y sin prisas."
    : "We aim to respond within a reasonable timeframe, always calmly and without rush.";

  // Reemplaza este correo por el tuyo real.
  const emailAddress = "hola@mindquotes.app";

  const containerInitial = reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 };
  const containerTransition = reduceMotion
    ? { duration: 0 }
    : ({ duration: 0.4, ease: "easeOut" } as const);

  return (
    <motion.section
      initial={containerInitial}
      animate={{ opacity: 1, y: 0 }}
      transition={containerTransition}
      className="mt-12 sm:mt-16"
    >
      <div className="rounded-3xl border border-white/70 bg-white/70 px-6 py-7 shadow-[0_18px_60px_rgba(20,73,63,0.18)] backdrop-blur-2xl max-w-2xl mx-auto space-y-5">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-teal-950 sm:text-3xl">{title}</h1>
          <p className="text-sm text-teal-800/80 sm:text-base">{body}</p>
        </header>
        <div className="space-y-3 text-sm text-teal-900/85 sm:text-base">
          <p className="font-semibold uppercase tracking-[0.18em] text-teal-700/80">
            {emailLabel}
          </p>
          <a
            href={`mailto:${emailAddress}`}
            className="inline-flex items-center rounded-full border border-teal-300/70 bg-white/90 px-4 py-2 text-sm font-semibold text-teal-800 shadow-sm transition-colors hover:bg-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            {emailAddress}
          </a>
          <p className="text-xs text-teal-700/80">{note}</p>
        </div>
      </div>
    </motion.section>
  );
}

