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
  cta: { scene: string; demo: string; github: string };
  howTitle: string;
  howEyebrow: string;
  systems: System[];
  badges: { firekeeper: string; ember: string; kindling: string };
  langLabel: string;
  brasas: string;
  rounds: string;
  leading: string;
  emptyState: string;
  taglines: string[];
  profile: {
    rank: string;
    of: string;
    roundsPlayed: string;
    share: string;
    copied: string;
    back: string;
    notFound: string;
    notFoundBody: string;
    viewFull: string;
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
  cta: { scene: "Enter the scene", demo: "Try it in your browser", github: "GitHub" },
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
  badges: { firekeeper: "Firekeeper", ember: "Ember", kindling: "Kindling" },
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
  profile: {
    rank: "Rank",
    of: "of",
    roundsPlayed: "rounds played",
    share: "Share",
    copied: "Link copied",
    back: "Back to the Wall",
    notFound: "No such guardian",
    notFoundBody: "This name isn't on the Wall yet.",
    viewFull: "View full profile",
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
  cta: { scene: "Entrar a la escena", demo: "Pruébalo en tu navegador", github: "GitHub" },
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
  badges: { firekeeper: "Guardián", ember: "Brasa", kindling: "Chispa" },
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
  profile: {
    rank: "Puesto",
    of: "de",
    roundsPlayed: "rondas jugadas",
    share: "Compartir",
    copied: "Enlace copiado",
    back: "Volver al muro",
    notFound: "Guardián no encontrado",
    notFoundBody: "Este nombre aún no está en el muro.",
    viewFull: "Ver perfil completo",
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
  },
};

export const DICTS: Record<Lang, Dict> = { en, es };
