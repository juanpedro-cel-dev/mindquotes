import { motion } from "framer-motion";

type PrivacyPageProps = {
  lang: "es" | "en";
  reduceMotion?: boolean;
};

export default function PrivacyPage({ lang, reduceMotion = false }: PrivacyPageProps) {
  const isEs = lang === "es";
  const title = isEs ? "Política de privacidad" : "Privacy Policy";
  const intro = isEs
    ? "En MindQuotes respetamos tu tiempo, tu atención y tus datos. Recogemos la mínima información necesaria para que la experiencia funcione y sea mejor con el tiempo."
    : "At MindQuotes we respect your time, your attention, and your data. We collect the minimum information needed for the experience to work and improve over time.";
  const sections = isEs
    ? [
        {
          heading: "Quiénes somos",
          body:
            "MindQuotes es un proyecto personal orientado a la calma y la productividad consciente. Esta web no vende tus datos ni los comparte con terceros para fines distintos a los descritos aquí.",
        },
        {
          heading: "Datos que recopilamos",
          body:
            "Cuando creas una cuenta, almacenamos tu correo, nombre que eliges mostrar y un identificador técnico. También guardamos tus frases favoritas y, si usas el diario en la nube, las entradas que escribes.",
        },
        {
          heading: "Uso de cookies y AdSense",
          body:
            "Usamos cookies propias para recordar tus preferencias (idioma, música, modo enfoque) y cookies de terceros a través de Google AdSense para mostrar anuncios. Google puede usar cookies y tecnologías similares para personalizar o medir la publicidad. Puedes gestionar estas opciones en la configuración de tu navegador.",
        },
        {
          heading: "Base legal y conservación",
          body:
            "Tratamos tus datos con tu consentimiento y para prestarte el servicio que has solicitado. Puedes solicitar la eliminación de tu cuenta escribiendo al correo de contacto indicado en esta web. Conservamos la información el tiempo estrictamente necesario para prestar el servicio y cumplir obligaciones legales.",
        },
        {
          heading: "Tus derechos",
          body:
            "Puedes solicitar acceso, rectificación o eliminación de tus datos, así como limitar u oponerte a determinados tratamientos, contactando con nosotros por correo electrónico. Responderemos con calma y dentro de un plazo razonable.",
        },
      ]
    : [
        {
          heading: "Who we are",
          body:
            "MindQuotes is a personal project focused on calm and mindful productivity. We do not sell your data or share it with third parties for purposes other than those described here.",
        },
        {
          heading: "Data we collect",
          body:
            "When you create an account, we store your email address, the display name you choose, and a technical identifier. We also store your favorite quotes and, if you use the cloud journal, the entries you write.",
        },
        {
          heading: "Cookies and AdSense",
          body:
            "We use first-party cookies to remember your preferences (language, music, focus mode) and third-party cookies through Google AdSense to show ads. Google may use cookies and similar technologies to personalize or measure advertising. You can manage these options in your browser settings.",
        },
        {
          heading: "Legal basis and retention",
          body:
            "We process your data based on your consent and to provide the service you requested. You can request deletion of your account by writing to the contact email shown on this site. We retain data only as long as necessary to provide the service and meet legal obligations.",
        },
        {
          heading: "Your rights",
          body:
            "You can request access, rectification, or deletion of your data, as well as restrict or object to certain uses, by contacting us via email. We will respond calmly and within a reasonable timeframe.",
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

