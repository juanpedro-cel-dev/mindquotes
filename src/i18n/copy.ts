export type Lang = "es" | "en";

export type QuoteCategory = "inspiration" | "motivation" | "heartbreak";

export type LanguageCopy = {
  button: string;
  title: string;
  aria: string;
};

type ShellNavId = "quotes" | "favorites" | "journal" | "feedback";

type ShellNavItem = {
  id: ShellNavId;
  label: string;
};

type ShellCopy = {
  subtitle: string;
  nav: ShellNavItem[];
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
  title: string;
  modeLogin: string;
  modeRegister: string;
  switchToLogin: string;
  switchToRegister: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  passwordHint: string;
  submitLogin: string;
  submitRegister: string;
  verificationEmail: string;
  errors: {
    generic: string;
  };
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
  trackSwitchOn: string;
  selectMoodPrompt: string;
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

export type FeedbackCopy = {
  title: string;
  subtitle: string;
  messageLabel: string;
  messagePlaceholder: string;
  messageHint: string;
  emailLabel: string;
  emailOptional: string;
  submit: string;
  loading: string;
  successTitle: string;
  successDescription: string;
  error: string;
  back: string;
};

export type FavoritesPageCopy = {
  title: string;
  subtitle: string;
  empty: string;
  emptyFiltered: string;
  categoryFilterLabel: string;
  langFilterLabel: string;
  allOption: string;
  langOptions: Record<Lang, string>;
  remove: string;
  countSingular: string;
  countPlural: string;
};

export type JournalPageCopy = {
  title: string;
  subtitle: string;
  loginPrompt: string;
  cloudNotice: string;
  localNotice: string;
  syncing: string;
  syncError: string;
  saveError: string;
  deleteError: string;
  empty: string;
  titleLabel: string;
  titlePlaceholder: string;
  contentLabel: string;
  contentPlaceholder: string;
  contentHint: string;
  submit: string;
  delete: string;
  timestampPrefix: string;
};

export type AppCopy = {
  shell: ShellCopy;
  user: UserCopy;
  login: LoginCopy;
  music: MusicCopy;
  quotes: QuotesCopy;
  ad: AdCopy;
  feedback: FeedbackCopy;
  favoritesPage: FavoritesPageCopy;
  journalPage: JournalPageCopy;
};

export const copy: Record<Lang, AppCopy> = {
  es: {
    shell: {
      subtitle: "Calma, foco y constancia.",
      nav: [
        { id: "quotes", label: "Frases" },
        { id: "favorites", label: "Favoritos" },
        { id: "journal", label: "Diario" },
        { id: "feedback", label: "Buzón de ideas" },
      ],
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
      title: "Accede a MindQuotes",
      modeLogin: "Iniciar sesión",
      modeRegister: "Crear cuenta",
      switchToLogin: "¿Ya tienes cuenta?",
      switchToRegister: "¿Aún no tienes cuenta?",
      nameLabel: "Nombre para mostrar",
      namePlaceholder: "¿Cómo quieres que te llamemos?",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "tu@correo.com",
      passwordLabel: "Contraseña",
      passwordPlaceholder: "Mínimo 6 caracteres",
      passwordHint: "Usa al menos 6 caracteres.",
      submitLogin: "Entrar",
      submitRegister: "Registrarme",
      verificationEmail:
        "Te enviamos un correo para confirmar tu cuenta. Revísalo y vuelve cuando esté activada.",
      errors: {
        generic: "No pudimos completar la acción. Intenta de nuevo.",
      },
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
      trackSwitchOn: "Usar música según mood",
      selectMoodPrompt: "Elige un mood para comenzar la música.",
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
    feedback: {
      title: "Buzón zen de ideas",
      subtitle:
        "Comparte mejoras, carencias o cualquier pensamiento que ayude a que MindQuotes crezca con calma.",
      messageLabel: "¿Qué te gustaría contarnos?",
      messagePlaceholder:
        "Cuéntanos qué te gustaría mejorar, qué echas en falta o cualquier idea zen...",
      messageHint: "Máximo 600 caracteres. Puedes enviar varias ideas.",
      emailLabel: "Correo para responderte",
      emailOptional: "Opcional si quieres que te escribamos.",
      submit: "Enviar sugerencia",
      loading: "Enviando...",
      successTitle: "¡Gracias por tu idea!",
      successDescription: "Guardamos tu mensaje y lo revisaremos con calma.",
      error: "No pudimos enviar el mensaje. Intenta de nuevo.",
      back: "Volver a las frases",
    },
    favoritesPage: {
      title: "Tus frases favoritas",
      subtitle:
        "Explora tus citas guardadas, organiza por mood o idioma y quita las que ya no necesites.",
      empty: "Aún no guardas frases. Captura la primera en la página principal.",
      emptyFiltered: "No hay frases que coincidan con los filtros actuales.",
      categoryFilterLabel: "Mood",
      langFilterLabel: "Idioma",
      allOption: "Todos",
      langOptions: {
        es: "Español",
        en: "Inglés",
      },
      remove: "Quitar",
      countSingular: "cita",
      countPlural: "citas",
    },
    journalPage: {
      title: "Diario zen",
      subtitle:
        "Escribe cómo te sientes, qué aprendiste o en qué quieres enfocarte. Nadie más lo ve.",
      loginPrompt:
        "Inicia sesión para empezar tu diario y sincronizarlo en este dispositivo.",
      cloudNotice:
        "Tus entradas se guardan en Supabase y podrás revisarlas desde cualquier dispositivo.",
      localNotice: "Tus entradas actuales viven solo en este dispositivo.",
      syncing: "Sincronizando tu diario…",
      syncError: "No pudimos sincronizar el diario. Mostramos lo guardado aquí.",
      saveError: "No pudimos guardar la entrada. Intenta de nuevo.",
      deleteError: "No pudimos eliminar la entrada. Intenta nuevamente.",
      empty: "Cuando escribas tu primera entrada, aparecerá aquí.",
      titleLabel: "Título",
      titlePlaceholder: "Una idea corta o resumen (opcional)",
      contentLabel: "Entrada",
      contentPlaceholder: "Hoy me siento...",
      contentHint: "Máximo 800 caracteres.",
      submit: "Guardar entrada",
      delete: "Eliminar",
      timestampPrefix: "Creado el",
    },
  },
  en: {
    shell: {
      subtitle: "Calm, focus and consistency.",
      nav: [
        { id: "quotes", label: "Quotes" },
        { id: "favorites", label: "Favorites" },
        { id: "journal", label: "Journal" },
        { id: "feedback", label: "Feedback" },
      ],
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
      title: "Access MindQuotes",
      modeLogin: "Sign in",
      modeRegister: "Create account",
      switchToLogin: "Already have an account?",
      switchToRegister: "Need a calm space?",
      nameLabel: "Display name",
      namePlaceholder: "How should we call you?",
      emailLabel: "Email",
      emailPlaceholder: "you@email.com",
      passwordLabel: "Password",
      passwordPlaceholder: "Minimum 6 characters",
      passwordHint: "Use at least 6 characters.",
      submitLogin: "Continue",
      submitRegister: "Create account",
      verificationEmail:
        "We just sent you a confirmation email. Check your inbox and come back once you activate it.",
      errors: {
        generic: "We couldn't complete the action. Please try again.",
      },
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
      trackSwitchOn: "Use mood-based music",
      selectMoodPrompt: "Select a mood to start the ambience.",
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
    feedback: {
      title: "Calm feedback inbox",
      subtitle:
        "Share improvements, missing pieces, or any thought that helps MindQuotes keep growing.",
      messageLabel: "What would you like to share?",
      messagePlaceholder:
        "Tell us what we can refine, what you miss, or any calm idea you have in mind...",
      messageHint: "Up to 600 characters. You can submit more than one idea.",
      emailLabel: "Email to reach you",
      emailOptional: "Optional if you'd like a reply.",
      submit: "Send suggestion",
      loading: "Sending...",
      successTitle: "Thanks for your idea!",
      successDescription: "We saved your note and will review it with care.",
      error: "We couldn't send the message. Please try again.",
      back: "Back to quotes",
    },
    favoritesPage: {
      title: "Your saved quotes",
      subtitle:
        "Review every quote you saved, filter by mood or language, and remove the ones you no longer need.",
      empty: "No favorites yet. Save your first quote from the main page.",
      emptyFiltered: "No favorites match the current filters.",
      categoryFilterLabel: "Mood",
      langFilterLabel: "Language",
      allOption: "All",
      langOptions: {
        es: "Spanish",
        en: "English",
      },
      remove: "Remove",
      countSingular: "quote",
      countPlural: "quotes",
    },
    journalPage: {
      title: "Calm journal",
      subtitle:
        "Capture how you feel, what you learned, or what you want to focus on. It stays on this device.",
      loginPrompt:
        "Sign in to start your journal and keep it linked to your profile on this device.",
      cloudNotice: "Entries sync to Supabase so you can revisit them from any device.",
      localNotice: "Entries are stored locally on this device.",
      syncing: "Syncing your journal…",
      syncError: "We couldn’t sync the journal. Showing what’s saved locally.",
      saveError: "We couldn’t save the entry. Please try again.",
      deleteError: "We couldn’t delete the entry. Please try again.",
      empty: "Once you add your first entry it will appear here.",
      titleLabel: "Title",
      titlePlaceholder: "A short idea or summary (optional)",
      contentLabel: "Entry",
      contentPlaceholder: "Today I feel...",
      contentHint: "Up to 800 characters.",
      submit: "Save entry",
      delete: "Delete",
      timestampPrefix: "Created on",
    },
  },
};
