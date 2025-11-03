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
  trackLoading: string;
  trackActive: string;
  trackPaused: string;
  trackSwitchOff: string;
  trackSwitchOn: string;
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
  save: string;
  saved: string;
  saveLogin: string;
  favoritesTitle: string;
  favoritesEmpty: string;
  favoritesAction: string;
  favoritesClose: string;
  favoritesSubtitle: string;
  favoritesEmptyDetail: string;
  favoritesRemove: string;
  focusMode: {
    title: string;
    description: string;
    activate: string;
    deactivate: string;
    premiumNotice: string;
  };
  moodPrompt: {
    question: string;
    accept: string;
    decline: string;
  };
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
      trackLoading: "Cargando ambiente...",
      trackActive: "Reproduciendo {title} · {author}",
      trackPaused: "Ambiente pausado: {title}",
      trackSwitchOff: "Volver al sonido generativo",
      trackSwitchOn: "Usar música según mood",
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
      empty:
        "Pronto sumaremos más frases para este mood. Gracias por tu paciencia zen.",
      save: "Guardar",
      saved: "Guardada",
      saveLogin: "Inicia sesión para guardar tus frases favoritas.",
      favoritesTitle: "Tus frases favoritas",
      favoritesEmpty: "Aún no guardas frases. Captura la primera cuando sientas el clic.",
      favoritesAction: "Ver todas",
      favoritesClose: "Cerrar favoritos",
      favoritesSubtitle: "Desmárcalas cuando quieras que vuelvan al flujo zen.",
      favoritesEmptyDetail:
        "Cuando guardes frases, aparecerán aquí para volver a ellas sin perder la calma.",
      favoritesRemove: "Quitar",
      focusMode: {
        title: "Modo focus",
        description: "Oculta navegación y anuncios para quedarte solo con la cita y la música.",
        activate: "Activar modo focus",
        deactivate: "Salir de modo focus",
        premiumNotice: "Modo focus disponible para MindQuotes Premium.",
      },
      moodPrompt: {
        question: "¿Quieres acompañar este mood con música a juego?",
        accept: "Activar música",
        decline: "No ahora",
      },
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
      trackLoading: "Loading ambience...",
      trackActive: "Now playing {title} · {author}",
      trackPaused: "Ambience paused: {title}",
      trackSwitchOff: "Return to generative sound",
      trackSwitchOn: "Use mood-based music",
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
      empty:
        "We will add more quotes for this mood soon. Thanks for staying zen.",
      save: "Save",
      saved: "Saved",
      saveLogin: "Sign in to keep your favorite quotes close.",
      favoritesTitle: "Your favorite quotes",
      favoritesEmpty: "No favorites yet. Save the first one that resonates.",
      favoritesAction: "View all",
      favoritesClose: "Close favorites",
      favoritesSubtitle: "Unsave anytime to let them flow back into the stream.",
      favoritesEmptyDetail:
        "Once you save quotes, they will live here so you can revisit them without breaking the calm.",
      favoritesRemove: "Remove",
      focusMode: {
        title: "Focus mode",
        description: "Hide navigation and ads to stay with the quote and the music.",
        activate: "Enable focus mode",
        deactivate: "Leave focus mode",
        premiumNotice: "Focus mode is available for MindQuotes Premium.",
      },
      moodPrompt: {
        question: "Want to pair this mood with matching music?",
        accept: "Play ambience",
        decline: "Not now",
      },
    },
    ad: {
      ariaLabel: "MindQuotes promotional space",
    },
  },
};
