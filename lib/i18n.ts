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
  cta: { scene: "Enter the scene", demo: "Watch the demo", github: "GitHub" },
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
  cta: { scene: "Entrar a la escena", demo: "Ver el demo", github: "GitHub" },
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
};

export const DICTS: Record<Lang, Dict> = { en, es };
