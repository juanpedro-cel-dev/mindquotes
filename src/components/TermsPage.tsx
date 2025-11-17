import { motion } from "framer-motion";

type TermsPageProps = {
  lang: "es" | "en";
  reduceMotion?: boolean;
};

export default function TermsPage({ lang, reduceMotion = false }: TermsPageProps) {
  const isEs = lang === "es";
  const title = isEs ? "Términos y condiciones" : "Terms and Conditions";
  const intro = isEs
    ? "Al usar MindQuotes aceptas estos términos de forma sencilla y sin letra pequeña. El objetivo es ofrecerte un espacio de calma, no complicarte la vida."
    : "By using MindQuotes you agree to these simple terms. The goal is to offer you a calm space, not to overwhelm you with fine print.";

  const sections = isEs
    ? [
        {
          heading: "Uso personal",
          body:
            "MindQuotes está pensado para uso personal. Puedes leer, guardar citas y usar las herramientas de enfoque para ti mismo. No está permitido revender el servicio ni integrarlo en productos sin permiso previo.",
        },
        {
          heading: "Contenido",
          body:
            "Las frases se seleccionan y adaptan con cariño, pero no constituyen asesoramiento médico, psicológico, financiero ni legal. Úsalas como inspiración, no como sustituto de ayuda profesional.",
        },
        {
          heading: "Cuenta y seguridad",
          body:
            "Eres responsable de mantener la confidencialidad de tu cuenta. Si detectas un uso no autorizado, avísanos cuanto antes a través del correo de contacto.",
        },
        {
          heading: "Cambios en el servicio",
          body:
            "Podemos actualizar la web, añadir o retirar funciones (incluyendo el plan Premium) para mejorar la experiencia o por motivos técnicos. Siempre intentaremos hacerlo con transparencia y sin romper tu flujo.",
        },
        {
          heading: "Limitación de responsabilidad",
          body:
            "MindQuotes se ofrece tal cual, sin garantías. No podemos hacernos responsables de interrupciones del servicio, pérdida puntual de datos o decisiones personales tomadas a partir del contenido.",
        },
      ]
    : [
        {
          heading: "Personal use",
          body:
            "MindQuotes is intended for personal use. You can read, save quotes, and use the focus tools for yourself. Reselling the service or integrating it into other products without prior permission is not allowed.",
        },
        {
          heading: "Content",
          body:
            "Quotes are curated and adapted with care, but they are not medical, psychological, financial, or legal advice. Treat them as inspiration, not as a replacement for professional help.",
        },
        {
          heading: "Account and security",
          body:
            "You are responsible for keeping your account credentials safe. If you notice unauthorized use, please notify us as soon as possible using the contact email.",
        },
        {
          heading: "Changes to the service",
          body:
            "We may update the site, add or remove features (including Premium) to improve the experience or for technical reasons. We will aim to do so transparently and without breaking your flow.",
        },
        {
          heading: "Limitation of liability",
          body:
            "MindQuotes is provided as-is, without warranties. We cannot be held responsible for service interruptions, occasional data loss, or personal decisions made based on the content.",
        },
      ];

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
      <div className="rounded-3xl border border-white/70 bg-white/70 px-6 py-7 shadow-[0_18px_60px_rgba(20,73,63,0.18)] backdrop-blur-2xl max-w-3xl mx-auto space-y-5">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-teal-950 sm:text-3xl">{title}</h1>
          <p className="text-sm text-teal-800/80 sm:text-base">{intro}</p>
        </header>
        <div className="space-y-4 text-sm text-teal-900/85 sm:text-base">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700/80">
                {section.heading}
              </h2>
              <p className="mt-2">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

