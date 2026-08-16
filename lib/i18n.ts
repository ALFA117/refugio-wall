// Internationalization for the Wall of Guardians. English is the default; Spanish optional
// (toggle in the header). Kept as a simple typed dictionary — no runtime i18n framework needed.

export type Lang = "en" | "es";

export type System = { name: string; blurb: string };

export type Dict = {
  eyebrowLive: string;
  eyebrowPreview: string;
  titlePre: string;
  titleEm: string;
  subtitle: string;
  filters: { all: string; week: string; today: string };
  searchPlaceholder: string;
  noResults: string;
  you: string;
  footerLive: string;
  footerPreview: string;
  footerStats: { guardians: string; totalBrasas: string };
  reconnecting: string;
  retryNow: string;
  retrying: string;
  leaderboardError: string;
  cta: { scene: string; sceneSoon: string; demo: string; github: string; share: string; copied: string };
  howTitle: string;
  howEyebrow: string;
  systems: System[];
  badges: { eternal: string; firekeeper: string; ember: string; kindling: string; spark: string };
  langLabel: string;
  brasas: string;
  rounds: string;
  leading: string;
  emptyState: string;
  taglines: string[];
  viewAllGuardians: string;
  shortcuts: {
    hint: string;
    title: string;
    search: string;
    toggleHelp: string;
    close: string;
  };
  onboarding: {
    skip: string;
    next: string;
    done: string;
    steps: { title: string; body: string }[];
  };
  comparePage: {
    eyebrow: string;
    title: string;
    pickPlaceholder: string;
    clear: string;
    ahead: string;
    tied: string;
    back: string;
    compare: string;
  };
  statsPage: {
    eyebrow: string;
    title: string;
    subtitle: string;
    totalGuardians: string;
    totalBrasas: string;
    totalRounds: string;
    avgBrasas: string;
    mostActive: string;
    topGainer: string;
    badgeDistribution: string;
    back: string;
  };
  guardiansPage: {
    eyebrow: string;
    title: string;
    subtitle: string;
    loadMore: string;
    back: string;
  };
  profile: {
    rank: string;
    of: string;
    roundsPlayed: string;
    share: string;
    copied: string;
    back: string;
    notFound: string;
    notFoundBody: string;
    didYouMean: string;
    viewFull: string;
    trend: string;
    aheadOfPct: string;
  };
  demo: {
    eyebrow: string;
    title: string;
    titleEm: string;
    subtitle: string;
    addGuardian: string;
    emptyCircle: string;
    intensityLabel: string;
    fireHealth: string;
    feedHint: string;
    feedPrompt: string;
    fedToast: string;
    missedToast: string;
    backToWall: string;
    tryLive: string;
    play: string;
    difficulty: string;
    modes: { easy: string; normal: string; hard: string };
    streak: string;
    best: string;
    gameOverTitle: string;
    gameOverBody: string;
    playAgain: string;
    share: string;
    copied: string;
    shareText: string;
    guardiansLabel: string;
    seatsFull: string;
  };
};

const en: Dict = {
  eyebrowLive: "Refugio · Live",
  eyebrowPreview: "Refugio · Preview",
  titlePre: "Wall of",
  titleEm: "Guardians",
  subtitle:
    "Every ember earned keeping the fire alive. The more guardians who show up, the higher it burns — and the leaderboard remembers.",
  filters: { all: "All-time", week: "This week", today: "Today" },
  searchPlaceholder: "Find your name…",
  noResults: "No guardian by that name — yet.",
  you: "you",
  footerLive: "Updates as rounds complete in the scene.",
  footerPreview: "Preview data — goes live once the scene starts pushing rounds.",
  footerStats: { guardians: "Guardians", totalBrasas: "Total embers" },
  reconnecting: "reconnecting…",
  retryNow: "retry now",
  retrying: "retrying…",
  leaderboardError: "Something went wrong showing the leaderboard here.",
  cta: { scene: "Enter the scene", sceneSoon: "Scene — publishing soon", demo: "Try it in your browser", github: "GitHub", share: "Share", copied: "Link copied" },
  howTitle: "How the fire works",
  howEyebrow: "The scene",
  systems: [
    { name: "Living Fire", blurb: "The flame scales in real time with the players present." },
    { name: "Seats", blurb: "Tap a log to sit; occupancy syncs to every client." },
    { name: "Guardians of the Fire", blurb: "A 3-min co-op round — feed the fire in time, together." },
    { name: "Embers", blurb: "Earned on round completion, saved per wallet, never zero." },
    { name: "Leaderboard", blurb: "The top guardians, persisted and shown in-world." },
    { name: "Referral", blurb: "Invite a friend; both earn a bonus after a round together." },
    { name: "No host", blurb: "The server runs the rounds — it works even if you arrive cold." },
  ],
  badges: { eternal: "Eternal Flame", firekeeper: "Firekeeper", ember: "Ember", kindling: "Kindling", spark: "Spark" },
  langLabel: "ES",
  brasas: "embers",
  rounds: "rounds",
  leading: "Leading",
  emptyState: "The fire is waiting for its first guardians.",
  taglines: [
    "The fire remembers who showed up.",
    "No host. No schedule. Just whoever's here.",
    "One log at a time, together.",
    "Presence is the only requirement.",
  ],
  viewAllGuardians: "View all guardians",
  shortcuts: {
    hint: "Keyboard shortcuts",
    title: "Keyboard shortcuts",
    search: "Jump to search",
    toggleHelp: "Show this help",
    close: "Close",
  },
  onboarding: {
    skip: "Skip",
    next: "Next",
    done: "Got it",
    steps: [
      { title: "This is the Wall", body: "The public leaderboard for Refugio — a Decentraland campfire that only burns when people actually show up." },
      { title: "Try it yourself", body: "No install needed. The demo runs the real feed-the-fire mechanic right in your browser." },
      { title: "Explore further", body: "Compare guardians, browse the full roster, or check community stats — all linked from the footer." },
    ],
  },
  comparePage: {
    eyebrow: "Head to head",
    title: "Compare guardians",
    pickPlaceholder: "Search a guardian…",
    clear: "Remove",
    ahead: "{name} is ahead by {n} embers.",
    tied: "It's a tie.",
    back: "Back to the Wall",
    compare: "Compare",
  },
  statsPage: {
    eyebrow: "The numbers",
    title: "Fire stats",
    subtitle: "What the whole community has built together.",
    totalGuardians: "Guardians",
    totalBrasas: "Embers earned",
    totalRounds: "Rounds played",
    avgBrasas: "Avg. embers / guardian",
    mostActive: "Most active",
    topGainer: "Today's top gainer",
    badgeDistribution: "Badges earned",
    back: "Back to the Wall",
  },
  guardiansPage: {
    eyebrow: "Every guardian",
    title: "All guardians",
    subtitle: "{n} guardians have kept the fire alive.",
    loadMore: "Load more",
    back: "Back to the Wall",
  },
  profile: {
    rank: "Rank",
    of: "of",
    roundsPlayed: "rounds played",
    share: "Share",
    copied: "Link copied",
    back: "Back to the Wall",
    notFound: "No such guardian",
    notFoundBody: "This name isn't on the Wall yet.",
    didYouMean: "Did you mean",
    trend: "Last 30 days",
    viewFull: "View full profile",
    aheadOfPct: "Ahead of {pct}% of guardians",
  },
  demo: {
    eyebrow: "Try it — no install",
    title: "Feel the fire",
    titleEm: "before you visit it.",
    subtitle:
      "This is the real mechanic, in your browser. Add guardians and watch the fire grow. Then keep it alive.",
    addGuardian: "Someone arrives",
    emptyCircle: "Empty the circle",
    intensityLabel: "Fire intensity",
    fireHealth: "Fire health",
    feedHint: "Tap the wood before it burns out to feed the fire.",
    feedPrompt: "Feed it!",
    fedToast: "Fed!",
    missedToast: "Missed…",
    backToWall: "Back to the Wall",
    tryLive: "This is a simplified web version — the real scene runs on Decentraland with real players.",
    play: "Play",
    difficulty: "Difficulty",
    modes: { easy: "Easy", normal: "Normal", hard: "Hard" },
    streak: "Streak",
    best: "Best",
    gameOverTitle: "The fire went out.",
    gameOverBody: "Nobody fed it in time — but a fire always finds someone willing to try again.",
    playAgain: "Play again",
    share: "Share",
    copied: "Link copied",
    shareText: "I kept Refugio's fire alive for a streak of",
    guardiansLabel: "guardians",
    seatsFull: "Seats full",
  },
};

const es: Dict = {
  eyebrowLive: "Refugio · En vivo",
  eyebrowPreview: "Refugio · Vista previa",
  titlePre: "Muro de",
  titleEm: "Guardianes",
  subtitle:
    "Cada brasa ganada por mantener el fuego vivo. Mientras más guardianes llegan, más alto arde — y el ranking lo recuerda.",
  filters: { all: "Histórico", week: "Esta semana", today: "Hoy" },
  searchPlaceholder: "Busca tu nombre…",
  noResults: "Ningún guardián con ese nombre — todavía.",
  you: "tú",
  footerLive: "Se actualiza cuando terminan rondas en la escena.",
  footerPreview: "Datos de muestra — se activa cuando la escena empiece a enviar rondas.",
  footerStats: { guardians: "Guardianes", totalBrasas: "Brasas totales" },
  reconnecting: "reconectando…",
  retryNow: "reintentar",
  retrying: "reintentando…",
  leaderboardError: "Algo salió mal mostrando el leaderboard aquí.",
  cta: { scene: "Entrar a la escena", sceneSoon: "Escena — próximamente", demo: "Pruébalo en tu navegador", github: "GitHub", share: "Compartir", copied: "Enlace copiado" },
  howTitle: "Cómo funciona el fuego",
  howEyebrow: "La escena",
  systems: [
    { name: "Fuego vivo", blurb: "La llama escala en tiempo real con los jugadores presentes." },
    { name: "Asientos", blurb: "Toca un tronco para sentarte; la ocupación se sincroniza." },
    { name: "Guardianes del Fuego", blurb: "Ronda cooperativa de 3 min — alimenten el fuego a tiempo." },
    { name: "Brasas", blurb: "Se ganan al cerrar la ronda, guardadas por wallet, nunca cero." },
    { name: "Leaderboard", blurb: "Los mejores guardianes, persistidos y visibles in-world." },
    { name: "Invitación", blurb: "Invita a alguien; ambos ganan bonus tras una ronda juntos." },
    { name: "Sin host", blurb: "El servidor corre las rondas — funciona aunque llegues solo." },
  ],
  badges: { eternal: "Llama Eterna", firekeeper: "Guardián", ember: "Brasa", kindling: "Leña", spark: "Chispa" },
  langLabel: "EN",
  brasas: "brasas",
  rounds: "rondas",
  leading: "A la cabeza",
  emptyState: "El fuego espera a sus primeros guardianes.",
  taglines: [
    "El fuego recuerda quién llegó.",
    "Sin host. Sin horario. Solo quien está.",
    "Un tronco a la vez, juntos.",
    "La presencia es el único requisito.",
  ],
  viewAllGuardians: "Ver todos los guardianes",
  shortcuts: {
    hint: "Atajos de teclado",
    title: "Atajos de teclado",
    search: "Ir a la búsqueda",
    toggleHelp: "Mostrar esta ayuda",
    close: "Cerrar",
  },
  onboarding: {
    skip: "Saltar",
    next: "Siguiente",
    done: "Entendido",
    steps: [
      { title: "Esto es el Muro", body: "El leaderboard público de Refugio — una fogata de Decentraland que solo arde cuando la gente realmente aparece." },
      { title: "Pruébalo tú mismo", body: "Sin instalar nada. La demo corre la mecánica real de alimentar el fuego directo en tu navegador." },
      { title: "Explora más", body: "Compara guardianes, mira el listado completo o revisa las estadísticas de la comunidad — todo enlazado desde el pie de página." },
    ],
  },
  comparePage: {
    eyebrow: "Cara a cara",
    title: "Comparar guardianes",
    pickPlaceholder: "Buscar un guardián…",
    clear: "Quitar",
    ahead: "{name} va adelante por {n} brasas.",
    tied: "Están empatados.",
    back: "Volver al muro",
    compare: "Comparar",
  },
  statsPage: {
    eyebrow: "Los números",
    title: "Estadísticas del fuego",
    subtitle: "Lo que toda la comunidad ha construido junta.",
    totalGuardians: "Guardianes",
    totalBrasas: "Brasas ganadas",
    totalRounds: "Rondas jugadas",
    avgBrasas: "Brasas prom. / guardián",
    mostActive: "Más activo",
    topGainer: "Mayor subida de hoy",
    badgeDistribution: "Insignias ganadas",
    back: "Volver al muro",
  },
  guardiansPage: {
    eyebrow: "Todos los guardianes",
    title: "Todos los guardianes",
    subtitle: "{n} guardianes han mantenido el fuego vivo.",
    loadMore: "Cargar más",
    back: "Volver al muro",
  },
  profile: {
    rank: "Puesto",
    of: "de",
    roundsPlayed: "rondas jugadas",
    share: "Compartir",
    copied: "Enlace copiado",
    back: "Volver al muro",
    notFound: "Guardián no encontrado",
    notFoundBody: "Este nombre aún no está en el muro.",
    didYouMean: "¿Quisiste decir",
    trend: "Últimos 30 días",
    viewFull: "Ver perfil completo",
    aheadOfPct: "Por delante del {pct}% de guardianes",
  },
  demo: {
    eyebrow: "Pruébalo — sin instalar nada",
    title: "Siente el fuego",
    titleEm: "antes de visitarlo.",
    subtitle:
      "Esta es la mecánica real, en tu navegador. Suma guardianes y mira crecer el fuego. Luego mantenlo vivo.",
    addGuardian: "Alguien llega",
    emptyCircle: "Vaciar el círculo",
    intensityLabel: "Intensidad del fuego",
    fireHealth: "Salud del fuego",
    feedHint: "Toca la leña antes de que se apague para alimentar el fuego.",
    feedPrompt: "¡Aliméntalo!",
    fedToast: "¡Alimentado!",
    missedToast: "Se apagó…",
    backToWall: "Volver al muro",
    tryLive: "Esta es una versión web simplificada — la escena real corre en Decentraland con jugadores reales.",
    play: "Jugar",
    difficulty: "Dificultad",
    modes: { easy: "Fácil", normal: "Normal", hard: "Difícil" },
    streak: "Racha",
    best: "Mejor",
    gameOverTitle: "El fuego se apagó.",
    gameOverBody: "Nadie lo alimentó a tiempo — pero un fuego siempre encuentra a alguien dispuesto a intentarlo de nuevo.",
    playAgain: "Jugar de nuevo",
    share: "Compartir",
    copied: "Enlace copiado",
    shareText: "Mantuve el fuego de Refugio vivo con una racha de",
    guardiansLabel: "guardianes",
    seatsFull: "Asientos llenos",
  },
};

export const DICTS: Record<Lang, Dict> = { en, es };
