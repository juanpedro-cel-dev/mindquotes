export type Lang = "es" | "en";

export type QuoteCategory = "inspiration" | "motivation" | "heartbreak";

export type LanguageCopy = {
  button: string;
  title: string;
  aria: string;
};

type ShellCopy = {
  subtitle: string;
  nav: string[];
  language: LanguageCopy;
  footer: string;
  navAria: string;
  logoAlt: string;
};

type UserCopy = {
  greeting: string;
  premiumActive: string;
  freeActive: string;
  toggleToPremium: string;
  toggleToFree: string;
  logout: string;
};

type LoginCopy = {
  nameLabel: string;
  placeholder: string;
  premiumLabel: string;
  submit: string;
};

export type MusicCopy = {
  title: string;
  descPlaying: string;
  descResume: string;
  descIdle: string;
  play: string;
  pause: string;
  volume: string;
  volumeSrLabel: string;
  volumeAria: string;
  errorNoContext: string;
  errorInit: string;
};

type QuoteFilterCopy = {
  id: QuoteCategory;
  label: string;
};

type QuotesCopy = {
  tagline: string;
  beta: string;
  newQuote: string;
  logoAlt: string;
  filterLabel: string;
  allLabel: string;
  filters: QuoteFilterCopy[];
  empty: string;
};

type AdCopy = {
  ariaLabel: string;
};

export type AppCopy = {
  shell: ShellCopy;
  user: UserCopy;
  login: LoginCopy;
  music: MusicCopy;
  quotes: QuotesCopy;
  ad: AdCopy;
};

export const copy: Record<Lang, AppCopy> = {
  es: {
    shell: {
      subtitle: "Calma, foco y constancia.",
      nav: ["Frases", "Favoritos", "Diario"],
      language: {
        button: "Idioma: ES",
        title: "Cambiar al inglés",
        aria: "Cambiar idioma a inglés",
      },
      footer: "MindQuotes · Hecho con calma.",
      navAria: "Secciones de MindQuotes",
      logoAlt: "Logotipo de MindQuotes",
    },
    user: {
      greeting: "Hola",
      premiumActive: "MindQuotes Premium activo: tu espacio sin anuncios.",
      freeActive: "Plan gratuito activo: anuncios ligeros mientras fluyes.",
      toggleToPremium: "Activar premium",
      toggleToFree: "Desactivar premium",
      logout: "Cerrar sesión",
    },
    login: {
      nameLabel: "Tu nombre zen",
      placeholder: "¿Cómo quieres que te llamemos?",
      premiumLabel: "Activar modo premium (sin anuncios)",
      submit: "Entrar",
    },
    music: {
      title: "Música zen",
      descPlaying: "Sonido ambiente activo, respira hondo.",
      descResume: "Listo para volver a sonar cuando quieras.",
      descIdle: "Activa una capa suave de calma cuando lo necesites.",
      play: "Reproducir calma",
      pause: "Pausar calma",
      volume: "Volumen",
      volumeSrLabel: "Volumen de la música zen",
      volumeAria: "Control de volumen música zen",
      errorNoContext: "AudioContext no disponible en este navegador.",
      errorInit: "No pudimos iniciar el audio. Intenta de nuevo.",
    },
    quotes: {
      tagline: "Un momento de calma para seguir creando.",
      beta: "Beta — centrado en calma, diseño y monetización sin prisa.",
      newQuote: "Nueva frase",
      logoAlt: "Símbolo de MindQuotes",
      filterLabel: "Elige el mood",
      allLabel: "Todas",
      filters: [
        { id: "inspiration", label: "Inspiradoras" },
        { id: "motivation", label: "Motivación" },
        { id: "heartbreak", label: "Despecho suave" },
      ],
      empty: "Pronto sumaremos más frases para este mood. Gracias por tu paciencia zen.",
    },
    ad: {
      ariaLabel: "Espacio promocional MindQuotes",
    },
  },
  en: {
    shell: {
      subtitle: "Calm, focus and consistency.",
      nav: ["Quotes", "Favorites", "Journal"],
      language: {
        button: "Language: EN",
        title: "Switch to Spanish",
        aria: "Switch language to Spanish",
      },
      footer: "MindQuotes · Made with calm.",
      navAria: "MindQuotes sections",
      logoAlt: "MindQuotes logo",
    },
    user: {
      greeting: "Hi",
      premiumActive: "MindQuotes Premium on: your calm space without ads.",
      freeActive: "Free plan active: light ads while you flow.",
      toggleToPremium: "Enable premium",
      toggleToFree: "Disable premium",
      logout: "Sign out",
    },
    login: {
      nameLabel: "Your zen name",
      placeholder: "How should we call you?",
      premiumLabel: "Enable premium mode (no ads)",
      submit: "Continue",
    },
    music: {
      title: "Zen music",
      descPlaying: "Ambient sound is playing, take a deep breath.",
      descResume: "Ready to flow again whenever you want.",
      descIdle: "Start a soft layer of calm whenever you need it.",
      play: "Play calm",
      pause: "Pause calm",
      volume: "Volume",
      volumeSrLabel: "Zen music volume",
      volumeAria: "Zen music volume control",
      errorNoContext: "AudioContext is not available in this browser.",
      errorInit: "We couldn't start the audio. Please try again.",
    },
    quotes: {
      tagline: "A moment of calm to keep creating.",
      beta: "Beta — focused on calm, design, and monetization at an easy pace.",
      newQuote: "New quote",
      logoAlt: "MindQuotes symbol",
      filterLabel: "Choose your mood",
      allLabel: "All",
      filters: [
        { id: "inspiration", label: "Inspiring" },
        { id: "motivation", label: "Motivation" },
        { id: "heartbreak", label: "Heartbreak & healing" },
      ],
      empty: "We will add more quotes for this mood soon. Thanks for staying zen.",
    },
    ad: {
      ariaLabel: "MindQuotes promotional space",
    },
  },
};
