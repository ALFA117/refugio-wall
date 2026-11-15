"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  type Variants,
} from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Flame, Crown, ArrowUpRight, ArrowRight, Search, ChevronDown, ChevronUp, Share2, Check, Play, Info, Keyboard,
  Armchair, Timer, Coins, Trophy, UserPlus, ServerCog,
} from "lucide-react";
import type { LeaderboardBundle, Guardian, Timeframe } from "@/lib/leaderboard";
import { DICTS, type Dict } from "@/lib/i18n";
import { badgeForBrasas } from "@/lib/badges";
import { diffActivity } from "@/lib/activity";
import { EASE_OUT, TAP_PRESS, SNAPPY } from "@/lib/motion";
import { useLang } from "./useLang";
import { TickerNumber } from "./TickerNumber";
import { SiteHeader, RefugioMark } from "./SiteHeader";
import { ErrorBoundary } from "./ErrorBoundary";

// Deep-linkable profile URL for a guardian.
export const guardianHref = (name: string) => `/guardians/${encodeURIComponent(name)}`;

const MEDAL = ["var(--gold)", "var(--silver)", "var(--bronze)"];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
};
const podiumItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export function Wall({ bundle }: { bundle: LeaderboardBundle }) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tf, setTf] = useState<Timeframe>(() => {
    const p = searchParams.get("tf");
    return p === "week" || p === "today" ? p : "all";
  });
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  // Keep the filter in the URL (shareable as ?tf=week) without a full navigation/reload.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (tf === "all") params.delete("tf");
    else params.set("tf", tf);
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tf]);

  // Auto-refresh: when the data is real (KV), poll the active timeframe every 30s so
  // the Wall stays live without a reload. The layout animation handles any reordering.
  const [frames, setFrames] = useState(bundle.frames);
  // Surfaces honestly once refreshes keep failing, instead of silently going stale forever —
  // the data on screen is still the last good snapshot, just aging.
  const [staleConnection, setStaleConnection] = useState(false);
  const failCount = useRef(0);
  // Rank-change indicators: diff each poll's order against the previous one so a row can show
  // "moved up 2" / "moved down 1" instead of just silently re-sorting via layout animation.
  const prevRankRef = useRef<Record<string, number> | null>(null);
  const [rankDelta, setRankDelta] = useState<Record<string, number>>({});
  useEffect(() => {
    prevRankRef.current = null;
    setRankDelta({});
  }, [tf]);
  const [retrying, setRetrying] = useState(false);
  // Activity feed: a handful of human-readable events synthesized from the same poll diff that
  // already drives rankDelta — "X joined the leaderboard" / "X moved up to #N" — instead of a
  // second data source. Newest first, capped so it never grows unbounded across a long session.
  const [activity, setActivity] = useState<{ id: string; text: string }[]>([]);
  const activityId = useRef(0);

  // Plain function, redefined each render — closes over the current `tf`/setters freshly, no
  // ref indirection needed. The effect below already tears down and recreates its interval
  // whenever `tf`/`bundle.source` change, so each interval tick already calls a fresh closure;
  // the manual retry button (onClick, also re-created each render) gets the same freshness.
  async function pollLeaderboard() {
    try {
      const res = await fetch(`/api/leaderboard?timeframe=${tf}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { entries: Guardian[] };
      setFrames((prev) => ({ ...prev, [tf]: data.entries }));
      failCount.current = 0;
      setStaleConnection(false);

      const newRanks: Record<string, number> = {};
      data.entries.forEach((e, i) => { newRanks[e.displayName] = i; });
      if (prevRankRef.current) {
        const deltas: Record<string, number> = {};
        for (const name in newRanks) {
          const prev = prevRankRef.current[name];
          if (prev !== undefined && prev !== newRanks[name]) deltas[name] = prev - newRanks[name];
        }
        const events = diffActivity(prevRankRef.current, newRanks, d.activityFeed);
        if (Object.keys(deltas).length) {
          setRankDelta(deltas);
          setTimeout(() => setRankDelta({}), 6000);
        }
        if (events.length) {
          setActivity((prevList) => [
            ...events.map((text) => ({ id: `a${activityId.current++}`, text })),
            ...prevList,
          ].slice(0, 5));
        }
      }
      prevRankRef.current = newRanks;
    } catch {
      failCount.current += 1;
      if (failCount.current >= 2) setStaleConnection(true);
    }
  }

  useEffect(() => {
    if (bundle.source !== "live") return;
    const id = setInterval(() => void pollLeaderboard(), 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tf, bundle.source]);

  // "Reconnecting…" shouldn't just be a passive label — a real retry button lets a visitor
  // force an immediate attempt instead of waiting up to 30s for the next scheduled poll.
  async function retryNow() {
    setRetrying(true);
    await pollLeaderboard();
    setRetrying(false);
  }

  const d = DICTS[lang];
  const entries = frames[tf];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 10);
  const query = q.trim().toLowerCase();
  const anyMatch = query ? entries.some((e) => e.displayName.toLowerCase().includes(query)) : true;
  const leader = entries[0] ?? null;
  const empty = entries.length === 0;
  const totalBrasas = entries.reduce((sum, g) => sum + g.brasas, 0);

  // "New record" pulse: only meaningful with real live data (auto-refresh polling), so this
  // only ever fires when bundle.source === "live" and a fresh poll shows the leader's embers
  // increased. First run just establishes the baseline — it never pulses on initial mount.
  const leaderBaseline = useRef<number | null>(null);
  const [recordPulse, setRecordPulse] = useState(false);
  useEffect(() => {
    if (!leader) return;
    const prev = leaderBaseline.current;
    leaderBaseline.current = leader.brasas;
    if (prev !== null && leader.brasas > prev) {
      setRecordPulse(true);
      const t = setTimeout(() => setRecordPulse(false), 2200);
      return () => clearTimeout(t);
    }
    // Only re-run when the embers value actually changes — `leader` is a fresh object
    // reference every render, deliberately excluded to avoid firing on every poll no-op.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leader?.brasas]);

  const anim = (v: Variants) =>
    reduce ? {} : ({ variants: v, initial: "hidden", animate: "show" } as const);

  // Easter egg: 5 rapid taps on the language toggle (within 2s) sets off a burst of embers
  // across the screen. A hidden little "wink" rather than a permanent, always-visible control.
  const langClicks = useRef<number[]>([]);
  const [easterEgg, setEasterEgg] = useState(false);
  function handleLangClick() {
    setLang(lang === "en" ? "es" : "en");
    if (reduce) return;
    const now = Date.now();
    langClicks.current = [...langClicks.current.filter((t) => now - t < 2000), now];
    if (langClicks.current.length >= 5) {
      langClicks.current = [];
      setEasterEgg(true);
      setTimeout(() => setEasterEgg(false), 1500);
    }
  }

  // First-visit onboarding — 3 short steps explaining what the Wall is, that the demo is
  // playable, and where the rest of the site lives. Shown once (localStorage flag), Skip
  // always available. Reads localStorage in an effect (not useState initializer) so SSR and
  // the first client render agree — no hydration mismatch.
  const [onboardStep, setOnboardStep] = useState<number | null>(null);
  useEffect(() => {
    try {
      if (!localStorage.getItem("refugio-onboarding-seen")) setOnboardStep(0);
    } catch {
      /* localStorage unavailable — just skip onboarding rather than throw */
    }
  }, []);
  function dismissOnboarding() {
    setOnboardStep(null);
    try {
      localStorage.setItem("refugio-onboarding-seen", "1");
    } catch {
      /* best-effort persistence */
    }
  }

  // Keyboard shortcuts: "/" jumps to search (common site convention), "?" toggles the help
  // overlay that documents them, Escape closes the overlay or blurs whatever's focused. Only
  // fires when not already typing in a field, so it doesn't hijack normal text entry.
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "Escape") {
        if (isTyping) (e.target as HTMLElement).blur();
        setShowShortcuts(false);
        if (onboardStep !== null) dismissOnboarding();
        return;
      }
      // The onboarding overlay already has its own Skip/Next flow — "/" and "?" underneath it
      // would open the search box or a second modal behind/over it, so they're a no-op while
      // it's showing (caught live: both dialogs rendered stacked before this guard existed).
      if (onboardStep !== null) return;
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === "?" && !isTyping) {
        setShowShortcuts((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onboardStep]);


  const L = LOCAL[lang];
  const totalRounds = entries.reduce((sum, g) => sum + (g.gamesPlayed ?? 0), 0);
  const hasRounds = entries.some((g) => typeof g.gamesPlayed === "number");
  const fade = (delay = 0) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, ease: EASE_OUT, delay } };

  return (
    <>
      <SiteHeader
        lang={lang}
        onToggleLang={handleLangClick}
        reduce={!!reduce}
        extra={
          <button
            type="button"
            onClick={() => setShowShortcuts(true)}
            aria-label={d.shortcuts.hint}
            className="hidden min-h-11 min-w-11 items-center justify-center rounded-lg border transition-colors hover:text-[var(--text)] lg:inline-flex"
            style={{ borderColor: "var(--line)", background: "var(--ground-2)", color: "var(--text-3)" }}
          >
            <Keyboard size={16} aria-hidden />
          </button>
        }
      />
      {leader && <LeaderBar leader={leader} d={d} reduce={!!reduce} newRecord={recordPulse} />}
      <EasterEggBurst active={easterEgg} />
      <ShortcutsHelp open={showShortcuts} onClose={() => setShowShortcuts(false)} d={d} />
      <OnboardingTour step={onboardStep} onNext={() => setOnboardStep((s) => (s === null ? null : s + 1))} onDismiss={dismissOnboarding} d={d} />

      <main id="main" className="page pb-16">
        {/* ------------------------------------------------------------ Hero */}
        <section className="grid gap-10 pt-12 sm:pt-16 lg:grid-cols-12 lg:gap-12 lg:pt-24">
          <div className="min-w-0 lg:col-span-7">
            <motion.div {...fade(0)} className="flex flex-wrap items-center gap-2">
              <span className="status-pill">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: bundle.source === "live" ? "var(--ok)" : "var(--warn)" }}
                />
                {bundle.source === "live" ? L.live : L.preview}
              </span>
              <span className="status-pill">{L.platform}</span>
              {staleConnection && (
                <button
                  type="button"
                  role="status"
                  onClick={() => void retryNow()}
                  disabled={retrying}
                  className="status-pill min-h-11 underline decoration-dotted underline-offset-2 disabled:opacity-60"
                >
                  {retrying ? d.retrying : `${d.reconnecting} · ${d.retryNow}`}
                </button>
              )}
            </motion.div>

            <motion.h1
              {...fade(0.05)}
              className="font-serif-display mt-6 text-[44px] font-medium leading-[1.02] sm:text-[64px] lg:text-[76px]"
              style={{ color: "var(--text)" }}
            >
              {d.titlePre} <span style={{ color: "var(--ember)" }}>{d.titleEm}</span>
            </motion.h1>

            <motion.p {...fade(0.1)} className="mt-6 max-w-xl text-[17px] leading-relaxed sm:text-[18px]" style={{ color: "var(--text-2)" }}>
              {d.subtitle}
            </motion.p>
            <RotatingTagline items={d.taglines} reduce={!!reduce} />

            <motion.div {...fade(0.15)} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/demo" className="btn btn-primary whitespace-normal text-center" style={{ minHeight: 48, padding: "0 22px", fontSize: 16 }}>
                <Play size={16} fill="currentColor" aria-hidden />
                {d.cta.demo}
              </Link>
              <a href="#how" className="btn btn-secondary whitespace-normal text-center" style={{ minHeight: 48, padding: "0 20px", fontSize: 16 }}>
                {d.howTitle}
                <ArrowRight size={16} aria-hidden style={{ color: "var(--text-3)" }} />
              </a>
            </motion.div>
          </div>

          <motion.aside {...fade(0.12)} className="min-w-0 lg:col-span-5" aria-label={d.leading}>
            <LeaderPanel
              leader={leader}
              d={d}
              L={L}
              tfLabel={d.filters[tf]}
              guardians={entries.length}
              totalBrasas={totalBrasas}
              totalRounds={hasRounds ? totalRounds : null}
              source={bundle.source}
              reduce={!!reduce}
              newRecord={recordPulse}
            />
          </motion.aside>
        </section>

        {/* ----------------------------------------------------- Leaderboard */}
        <section id="leaderboard" className="mt-20 scroll-mt-24 sm:mt-28" aria-labelledby="lb-title">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="eyebrow">{L.lbEyebrow}</div>
              <h2 id="lb-title" className="font-serif-display mt-2 text-[32px] font-medium leading-tight sm:text-[40px]">
                {L.lbTitle}
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Filters d={d} tf={tf} setTf={setTf} reduce={!!reduce} />
              <SearchBox d={d} q={q} setQ={setQ} entries={entries} inputRef={searchInputRef} />
            </div>
          </div>

          <ErrorBoundary fallback={<LeaderboardFallback d={d} />}>
            {empty ? (
              <EmptyState d={d} />
            ) : (
              <div className="panel mt-6 overflow-hidden">
                {/* Top three — one row of three cells, rank order left to right */}
                <motion.ol key={`podium-${tf}`} className="grid sm:grid-cols-3" {...anim(container)}>
                  {top3.map((g, i) => (
                    <PodiumCell
                      key={g.displayName}
                      guardian={g}
                      rank={i}
                      d={d}
                      reduce={!!reduce}
                      match={!!query && g.displayName.toLowerCase().includes(query)}
                      dim={!!query && !g.displayName.toLowerCase().includes(query)}
                      newRecord={i === 0 && recordPulse}
                    />
                  ))}
                </motion.ol>

                {rest.length > 0 && (
                  <>
                    <div
                      className="hidden grid-cols-[56px_1fr_160px_120px_48px] items-center border-t px-4 py-3 sm:grid"
                      style={{ borderColor: "var(--line)", background: "var(--ground-2)" }}
                      aria-hidden
                    >
                      <span className="eyebrow">#</span>
                      <span className="eyebrow">{L.colGuardian}</span>
                      <span className="eyebrow">{L.colTier}</span>
                      <span className="eyebrow text-right">{L.colEmbers}</span>
                      <span />
                    </div>
                    <motion.ol layout={!reduce}>
                      <AnimatePresence mode="popLayout" initial={false}>
                        {rest.map((g) => {
                          const rank = entries.indexOf(g);
                          const match = !!query && g.displayName.toLowerCase().includes(query);
                          const isOpen = expanded === g.displayName;
                          return (
                            <motion.li
                              key={g.displayName}
                              layout={!reduce}
                              initial={reduce ? undefined : { opacity: 0 }}
                              animate={reduce ? undefined : { opacity: query && !match ? 0.4 : 1 }}
                              exit={reduce ? undefined : { opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t"
                              style={{ borderColor: "var(--line)", background: match ? "var(--ember-tint)" : "transparent" }}
                            >
                              <div className="flex items-stretch">
                                <Link
                                  href={guardianHref(g.displayName)}
                                  className="grid min-h-16 min-w-0 flex-1 grid-cols-[28px_1fr_auto] items-center gap-3 py-2.5 pl-4 pr-1 transition-colors hover:bg-[var(--surface-2)] sm:min-h-14 sm:grid-cols-[40px_1fr_160px_120px] sm:gap-0 sm:px-4 sm:py-0"
                                >
                                  <span className="flex items-center gap-1">
                                    <span className="font-mono-num text-[14px]" style={{ color: "var(--text-3)" }}>
                                      {String(rank + 1).padStart(2, "0")}
                                    </span>
                                    <RankChangeArrow delta={rankDelta[g.displayName]} />
                                  </span>
                                  <NameCell name={g.displayName} brasas={g.brasas} d={d} />
                                  <span className="hidden sm:block">
                                    <Badge brasas={g.brasas} d={d} />
                                  </span>
                                  <span className="flex justify-end">
                                    <Brasas value={g.brasas} reduce={!!reduce} />
                                  </span>
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => setExpanded((prev) => (prev === g.displayName ? null : g.displayName))}
                                  aria-expanded={isOpen}
                                  aria-label={`${d.profile.roundsPlayed} — ${g.displayName}`}
                                  className="flex w-11 shrink-0 items-center justify-center transition-colors hover:text-[var(--text)] sm:w-12"
                                  style={{ color: "var(--text-3)" }}
                                >
                                  <motion.span
                                    style={{ display: "inline-flex" }}
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2, ease: EASE_OUT }}
                                  >
                                    <ChevronDown size={16} />
                                  </motion.span>
                                </button>
                              </div>
                              <AnimatePresence initial={false}>
                                {isOpen && (
                                  <motion.div
                                    initial={reduce ? undefined : { opacity: 0, height: 0 }}
                                    animate={reduce ? undefined : { opacity: 1, height: "auto" }}
                                    exit={reduce ? undefined : { opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: EASE_OUT }}
                                    className="overflow-hidden"
                                  >
                                    <div
                                      className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:pl-[72px]"
                                      style={{ borderColor: "var(--line)", background: "var(--ground-2)" }}
                                    >
                                      <span className="flex items-center gap-3 text-[14px]" style={{ color: "var(--text-2)" }}>
                                        {typeof g.gamesPlayed === "number" ? `${g.gamesPlayed} ${d.rounds}` : d.profile.roundsPlayed}
                                      </span>
                                      <Link href={guardianHref(g.displayName)} className="link inline-flex min-h-11 items-center gap-1 text-[14px]">
                                        {d.profile.viewFull}
                                        <ArrowUpRight size={14} aria-hidden />
                                      </Link>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.li>
                          );
                        })}
                      </AnimatePresence>
                    </motion.ol>
                  </>
                )}

                {query && !anyMatch && (
                  <p className="border-t px-4 py-4 text-[14px]" style={{ borderColor: "var(--line)", color: "var(--text-3)" }}>
                    {d.noResults}
                  </p>
                )}

                <div
                  className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2"
                  style={{ borderColor: "var(--line)", background: "var(--ground-2)" }}
                >
                  <span className="text-[13px]" style={{ color: "var(--text-3)" }}>
                    {L.showing.replace("{n}", String(Math.min(entries.length, 10))).replace("{t}", String(entries.length))}
                  </span>
                  <span className="flex items-center gap-4">
                    <Link href="/stats" className="link inline-flex min-h-11 items-center text-[14px]">
                      {L.stats}
                    </Link>
                    <Link href="/guardians" className="link inline-flex min-h-11 items-center gap-1 text-[14px]">
                      {d.viewAllGuardians}
                      <ArrowRight size={14} aria-hidden />
                    </Link>
                  </span>
                </div>

                {/* Screen-reader table: the leaderboard as structured data. */}
                <table className="sr-only">
                  <caption>{`${d.titlePre} ${d.titleEm} — ${d.filters[tf]}`}</caption>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">{d.titleEm}</th>
                      <th scope="col">{d.brasas}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.map((g, i) => (
                      <tr key={g.displayName}>
                        <td>{i + 1}</td>
                        <td>{g.displayName}</td>
                        <td>{g.brasas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ErrorBoundary>

          <ActivityFeed items={activity} title={d.activityFeed.title} reduce={!!reduce} />
        </section>

        <HowItWorks d={d} L={L} reduce={!!reduce} />

        <SiteFooter
          d={d}
          L={L}
          source={bundle.source}
          guardians={entries.length}
          totalBrasas={totalBrasas}
          reduce={!!reduce}
        />
      </main>
    </>
  );
}

/* ---------------------------------------------------------------- Local copy */

// Strings only this redesigned page uses — kept beside it rather than widening the shared Dict.
const LOCAL = {
  en: {
    live: "Live data",
    preview: "Preview · sample data",
    platform: "Decentraland companion",
    lbEyebrow: "Standings",
    lbTitle: "Leaderboard",
    colGuardian: "Guardian",
    colTier: "Tier",
    colEmbers: "Embers",
    showing: "Top {n} of {t} guardians",
    stats: "Community stats",
    metricGuardians: "Guardians",
    metricEmbers: "Total embers",
    metricRounds: "Rounds played",
    viewProfile: "View profile",
    noLeader: "No guardian has lit the fire yet.",
    howLead: "Seven systems, one rule: the fire only burns while people are present.",
    tryCell: "Feel the mechanic before you visit the scene — no install, no wallet.",
    footerAbout: "A public leaderboard for Refugio, a campfire scene in Decentraland that grows with the people sitting around it.",
    explore: "Explore",
    project: "Project",
    community: "Community",
    built: "Built on Decentraland SDK7",
  },
  es: {
    live: "Datos en vivo",
    preview: "Vista previa · datos de muestra",
    platform: "Compañero de Decentraland",
    lbEyebrow: "Posiciones",
    lbTitle: "Clasificación",
    colGuardian: "Guardián",
    colTier: "Rango",
    colEmbers: "Brasas",
    showing: "Top {n} de {t} guardianes",
    stats: "Estadísticas",
    metricGuardians: "Guardianes",
    metricEmbers: "Brasas totales",
    metricRounds: "Rondas jugadas",
    viewProfile: "Ver perfil",
    noLeader: "Ningún guardián ha encendido el fuego todavía.",
    howLead: "Siete sistemas, una regla: el fuego solo arde mientras hay gente presente.",
    tryCell: "Siente la mecánica antes de visitar la escena: sin instalar nada, sin wallet.",
    footerAbout: "Clasificación pública de Refugio, una fogata en Decentraland que crece con la gente sentada alrededor.",
    explore: "Explorar",
    project: "Proyecto",
    community: "Comunidad",
    built: "Hecho con Decentraland SDK7",
  },
} as const;
type Local = (typeof LOCAL)["en"] | (typeof LOCAL)["es"];

/* ------------------------------------------------------------ Leader panel */

function LeaderPanel({
  leader,
  d,
  L,
  tfLabel,
  guardians,
  totalBrasas,
  totalRounds,
  source,
  reduce,
  newRecord,
}: {
  leader: Guardian | null;
  d: Dict;
  L: Local;
  tfLabel: string;
  guardians: number;
  totalBrasas: number;
  totalRounds: number | null;
  source: LeaderboardBundle["source"];
  reduce: boolean;
  newRecord: boolean;
}) {
  return (
    <div className="panel overflow-hidden" style={{ boxShadow: "var(--shadow-2)" }}>
      <div className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: "var(--line)" }}>
        <span className="flex items-center gap-2 text-[14px] font-medium" style={{ color: "var(--text-2)" }}>
          <span className="relative inline-flex">
            <Crown size={15} aria-hidden style={{ color: "var(--gold)" }} />
            <RecordBurst active={newRecord && !reduce} />
          </span>
          {d.leading}
        </span>
        <span className="font-mono-num text-[12px]" style={{ color: "var(--text-3)" }}>
          {tfLabel}
        </span>
      </div>

      {leader ? (
        <Link href={guardianHref(leader.displayName)} className="group block px-5 pb-6 pt-5 transition-colors hover:bg-[var(--surface-2)]">
          <div className="flex items-center gap-3">
            <GuardianDot name={leader.displayName} big />
            <div className="min-w-0">
              <div className="font-serif-display truncate text-[26px] font-medium leading-tight" style={{ color: "var(--text)" }}>
                {leader.displayName}
              </div>
              <div className="mt-1">
                <Badge brasas={leader.brasas} d={d} />
              </div>
            </div>
          </div>
          <div className="mt-6 flex items-end justify-between gap-4">
            <div>
              <div className="eyebrow">{d.brasas}</div>
              <TickerNumber
                value={leader.brasas}
                reduce={reduce}
                className="num mt-1 block text-[44px] font-semibold leading-none"
              />
            </div>
            <span className="inline-flex min-h-11 items-center gap-1 text-[14px] transition-colors group-hover:text-[var(--text)]" style={{ color: "var(--text-3)" }}>
              {L.viewProfile}
              <ArrowUpRight size={14} aria-hidden />
            </span>
          </div>
        </Link>
      ) : (
        <p className="px-5 py-8 text-[15px]" style={{ color: "var(--text-2)" }}>
          {L.noLeader}
        </p>
      )}

      <dl className="grid grid-cols-3 border-t" style={{ borderColor: "var(--line)" }}>
        <Metric label={L.metricGuardians} value={guardians} reduce={reduce} />
        <Metric label={L.metricEmbers} value={totalBrasas} reduce={reduce} border />
        {totalRounds !== null ? (
          <Metric label={L.metricRounds} value={totalRounds} reduce={reduce} border />
        ) : (
          <div className="border-l px-4 py-4" style={{ borderColor: "var(--line)" }}>
            <dt className="text-[12px]" style={{ color: "var(--text-3)" }}>{L.metricRounds}</dt>
            <dd className="num mt-1 text-[20px]" style={{ color: "var(--text-3)" }}>—</dd>
          </div>
        )}
      </dl>

      {source !== "live" && (
        <div className="flex gap-2.5 border-t px-5 py-3.5 text-[13px] leading-snug" style={{ borderColor: "var(--line)", background: "var(--ground-2)", color: "var(--text-3)" }}>
          <Info size={15} aria-hidden className="mt-px shrink-0" />
          <span>{d.footerPreview}</span>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, reduce, border = false }: { label: string; value: number; reduce: boolean; border?: boolean }) {
  return (
    <div className={`px-4 py-4 ${border ? "border-l" : ""}`} style={{ borderColor: "var(--line)" }}>
      <dt className="text-[12px] leading-tight" style={{ color: "var(--text-3)" }}>
        {label}
      </dt>
      <dd className="mt-1">
        <TickerNumber value={value} reduce={reduce} className="num text-[20px] font-semibold" />
      </dd>
    </div>
  );
}

/* --------------------------------------------------- Sticky leader + empty */

// When the hero scrolls out of view, a slim bar at the bottom keeps the current #1 in sight.
function LeaderBar({
  leader,
  d,
  reduce,
  newRecord,
}: {
  leader: Guardian;
  d: Dict;
  reduce: boolean;
  newRecord: boolean;
}) {
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setShown(v > 640));
  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: 24, opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT }}
          className="pointer-events-none fixed inset-x-0 z-30 px-4"
          style={{ bottom: "max(16px, env(safe-area-inset-bottom))" }}
        >
          <Link
            href={guardianHref(leader.displayName)}
            className="pointer-events-auto mx-auto flex min-h-12 max-w-md items-center gap-3 rounded-xl border px-4"
            style={{ borderColor: "var(--line-strong)", background: "var(--surface-2)", boxShadow: "0 12px 32px -16px rgba(0,0,0,0.9)" }}
          >
            <span className="relative inline-flex">
              <Crown size={15} aria-hidden style={{ color: "var(--gold)" }} />
              <RecordBurst active={newRecord && !reduce} />
            </span>
            <span className="text-[13px]" style={{ color: "var(--text-3)" }}>
              {d.leading}
            </span>
            <span className="min-w-0 flex-1 truncate text-[15px] font-medium" style={{ color: "var(--text)" }}>
              {leader.displayName}
            </span>
            <Brasas value={leader.brasas} reduce={reduce} accent />
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// A handful of "X just happened" lines synthesized from live-poll diffs (see pollLeaderboard).
// Naturally empty in sample mode (no polling happens), so it renders nothing there.
function ActivityFeed({ items, title, reduce }: { items: { id: string; text: string }[]; title: string; reduce: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className="panel mt-4 p-4">
      <div className="eyebrow">{title}</div>
      <ul className="mt-2.5 flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              layout={!reduce}
              initial={reduce ? undefined : { opacity: 0, x: -8 }}
              animate={reduce ? undefined : { opacity: 1, x: 0 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className="text-[14px]"
              style={{ color: "var(--text-2)" }}
            >
              {item.text}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

// Shown if the leaderboard section throws — points at the full roster instead of a blank gap.
function LeaderboardFallback({ d }: { d: Dict }) {
  return (
    <div className="panel mt-6 flex flex-col items-start gap-3 p-6" role="alert">
      <p className="text-[15px]" style={{ color: "var(--text-2)" }}>
        {d.leaderboardError}
      </p>
      <Link href="/guardians" className="btn btn-secondary">
        {d.viewAllGuardians}
        <ArrowUpRight size={14} aria-hidden />
      </Link>
    </div>
  );
}

function EmptyState({ d }: { d: Dict }) {
  return (
    <div className="panel mt-6 flex flex-col items-center px-6 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl border" style={{ borderColor: "var(--line-strong)", background: "var(--surface-2)" }}>
        <Flame size={20} aria-hidden style={{ color: "var(--ember)" }} />
      </span>
      <p className="mt-4 max-w-xs text-[15px]" style={{ color: "var(--text-2)" }}>
        {d.emptyState}
      </p>
      <Link href="/demo" className="btn btn-secondary mt-5">
        <Play size={14} aria-hidden />
        {d.cta.demo}
      </Link>
    </div>
  );
}

// Rotates through a short set of one-line taglines beneath the subtitle. Static under
// reduced-motion — purely decorative motion, not information.
function RotatingTagline({ items, reduce }: { items: string[]; reduce: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce || items.length <= 1) return;
    const id = setInterval(() => setI((p) => (p + 1) % items.length), 4200);
    return () => clearInterval(id);
  }, [items.length, reduce]);

  return (
    <div className="mt-4 flex h-6 items-center gap-2.5 overflow-hidden">
      <span aria-hidden className="h-px w-6 shrink-0" style={{ background: "var(--line-ember)" }} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={reduce ? 0 : i}
          initial={reduce ? undefined : { opacity: 0, y: 6 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: EASE_OUT }}
          className="truncate font-mono-num text-[13px]"
          style={{ color: "var(--text-3)" }}
        >
          {items[reduce ? 0 : i]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

// Concentric rings burst outward from an icon-sized parent when a new record lands.
function RecordBurst({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="absolute inset-0 rounded-full"
          style={{ border: "1.5px solid var(--gold)" }}
          initial={{ scale: 0.6, opacity: 0.85 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.1, delay: i * 0.18, ease: "easeOut" }}
        />
      ))}
    </span>
  );
}

// Hidden easter egg payoff (5 rapid taps on the language switch): a short burst of embers.
function EasterEggBurst({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {Array.from({ length: 14 }).map((_, i) => {
            const angle = (i / 14) * Math.PI * 2;
            const dist = 140 + (i % 3) * 40;
            return (
              <motion.span
                key={i}
                className="absolute rounded-full"
                style={{ width: 6, height: 6, background: i % 2 === 0 ? "var(--spark)" : "var(--ember)" }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0.3 }}
                transition={{ duration: 1.1, ease: "easeOut" }}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------- Controls */

function Filters({
  d,
  tf,
  setTf,
  reduce,
}: {
  d: Dict;
  tf: Timeframe;
  setTf: (t: Timeframe) => void;
  reduce: boolean;
}) {
  const opts: { key: Timeframe; label: string }[] = [
    { key: "all", label: d.filters.all },
    { key: "week", label: d.filters.week },
    { key: "today", label: d.filters.today },
  ];
  return (
    <div className="segmented w-full sm:w-auto" role="tablist" aria-label={d.filters.all}>
      {opts.map((o) => {
        const active = tf === o.key;
        return (
          <button
            key={o.key}
            role="tab"
            aria-selected={active}
            onClick={() => setTf(o.key)}
            className="relative flex min-h-10 flex-1 items-center justify-center whitespace-nowrap rounded-[7px] px-2 text-[14px] sm:px-3.5 font-medium transition-colors sm:flex-none"
            style={{ color: active ? "var(--text)" : "var(--text-3)", minHeight: 40 }}
          >
            {active && (
              <motion.span
                layoutId={reduce ? undefined : "filter-pill"}
                className="absolute inset-0 rounded-[7px]"
                style={{ background: "var(--surface-3)", boxShadow: "inset 0 0 0 1px var(--line-strong)" }}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SearchBox({
  d,
  q,
  setQ,
  entries,
  inputRef,
}: {
  d: Dict;
  q: string;
  setQ: (s: string) => void;
  entries: Guardian[];
  inputRef?: RefObject<HTMLInputElement>;
}) {
  const router = useRouter();
  const [focused, setFocused] = useState(false);
  const query = q.trim().toLowerCase();
  const suggestions = query ? entries.filter((e) => e.displayName.toLowerCase().includes(query)).slice(0, 5) : [];

  return (
    <div className="relative w-full sm:w-64">
      <label
        className="flex min-h-11 items-center gap-2 rounded-[10px] border px-3 transition-colors focus-within:border-[var(--line-ember)]"
        style={{ borderColor: "var(--line)", background: "var(--ground-2)" }}
      >
        <Search size={16} aria-hidden style={{ color: "var(--text-3)" }} />
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          placeholder={d.searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[var(--text-3)] sm:text-[15px]"
          style={{ color: "var(--text)" }}
          aria-label={d.searchPlaceholder}
        />
        <kbd
          aria-hidden
          className="hidden rounded border px-1.5 text-[12px] lg:inline"
          style={{ borderColor: "var(--line-strong)", color: "var(--text-3)" }}
        >
          /
        </kbd>
      </label>
      <AnimatePresence>
        {focused && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-[10px] border"
            style={{ borderColor: "var(--line-strong)", background: "var(--surface-2)", boxShadow: "var(--shadow-2)" }}
          >
            {suggestions.map((s) => (
              <li key={s.displayName}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => router.push(guardianHref(s.displayName))}
                  className="flex min-h-11 w-full items-center gap-2.5 px-3 text-left text-[14px] transition-colors hover:bg-[var(--surface-3)]"
                  style={{ color: "var(--text)" }}
                >
                  <GuardianDot name={s.displayName} />
                  <span className="truncate">{s.displayName}</span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

// A real, minimal shortcuts reference — "/", "?" and Esc are the only ones that exist.
function ShortcutsHelp({ open, onClose, d }: { open: boolean; onClose: () => void; d: Dict }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <div className="absolute inset-0" style={{ background: "rgba(5,4,3,0.72)" }} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={d.shortcuts.title}
            className="panel relative z-10 w-full max-w-xs p-5"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[16px] font-semibold" style={{ color: "var(--text)" }}>
              {d.shortcuts.title}
            </h2>
            <div className="mt-4 flex flex-col gap-2.5">
              <ShortcutRow keyLabel="/" label={d.shortcuts.search} />
              <ShortcutRow keyLabel="?" label={d.shortcuts.toggleHelp} />
              <ShortcutRow keyLabel="Esc" label={d.shortcuts.close} />
            </div>
            <button type="button" onClick={onClose} className="btn btn-secondary mt-5 w-full">
              {d.shortcuts.close}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShortcutRow({ keyLabel, label }: { keyLabel: string; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[14px]" style={{ color: "var(--text-2)" }}>
        {label}
      </span>
      <kbd
        className="rounded-md border px-2 py-1 text-[12px]"
        style={{ borderColor: "var(--line-strong)", color: "var(--text)", background: "var(--surface-2)" }}
      >
        {keyLabel}
      </kbd>
    </div>
  );
}

function OnboardingTour({
  step,
  onNext,
  onDismiss,
  d,
}: {
  step: number | null;
  onNext: () => void;
  onDismiss: () => void;
  d: Dict;
}) {
  const steps = d.onboarding.steps;
  const open = step !== null && step < steps.length;
  const current = open ? steps[step as number] : null;
  const isLast = step === steps.length - 1;

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0" style={{ background: "rgba(5,4,3,0.72)" }} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
            className="panel relative z-10 w-full max-w-sm p-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono-num text-[12px]" style={{ color: "var(--text-3)" }}>
                {String((step as number) + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")}
              </span>
              <div className="flex items-center gap-1.5">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    className="h-1 rounded-full transition-all"
                    style={{ width: i === step ? 18 : 6, background: i === step ? "var(--ember)" : "var(--line-strong)" }}
                  />
                ))}
              </div>
            </div>
            <h2 className="font-serif-display mt-4 text-[24px] font-medium" style={{ color: "var(--text)" }}>
              {current.title}
            </h2>
            <p className="mt-2 text-[15px]" style={{ color: "var(--text-2)" }}>
              {current.body}
            </p>
            <div className="mt-6 flex items-center gap-2.5">
              <button type="button" onClick={onDismiss} className="btn btn-secondary flex-1">
                {d.onboarding.skip}
              </button>
              <button type="button" onClick={isLast ? onDismiss : onNext} className="btn btn-primary flex-1">
                {isLast ? d.onboarding.done : d.onboarding.next}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ Podium */

function PodiumCell({
  guardian,
  rank,
  d,
  reduce,
  match,
  dim,
  newRecord,
}: {
  guardian: Guardian;
  rank: number;
  d: Dict;
  reduce: boolean;
  match: boolean;
  dim: boolean;
  newRecord: boolean;
}) {
  const isFirst = rank === 0;
  return (
    <motion.li
      variants={reduce ? undefined : podiumItem}
      className={`relative ${rank > 0 ? "border-t sm:border-l sm:border-t-0" : ""}`}
      style={{
        borderColor: "var(--line)",
        background: match ? "var(--ember-tint)" : isFirst ? "linear-gradient(180deg, rgba(232,118,60,0.07), transparent 70%)" : "transparent",
        opacity: dim ? 0.45 : 1,
      }}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-0.5 sm:inset-x-0 sm:bottom-auto sm:h-0.5 sm:w-auto" style={{ background: MEDAL[rank], opacity: isFirst ? 1 : 0.6 }} />
      {/* Phones: the exact row anatomy of ranks 4–10, plus the medal rule on the left. */}
      <Link
        href={guardianHref(guardian.displayName)}
        className="grid min-h-16 grid-cols-[28px_1fr_auto] items-center gap-3 py-2.5 pl-4 pr-4 transition-colors hover:bg-[var(--surface-2)] sm:hidden"
      >
        <span className="font-mono-num text-[14px]" style={{ color: MEDAL[rank] }}>
          {String(rank + 1).padStart(2, "0")}
        </span>
        <NameCell name={guardian.displayName} brasas={guardian.brasas} d={d} crown={isFirst} />
        <Brasas value={guardian.brasas} reduce={reduce} accent={isFirst} />
      </Link>
      <Link href={guardianHref(guardian.displayName)} className="group hidden h-full flex-col gap-4 p-5 transition-colors hover:bg-[var(--surface-2)] sm:flex">
        <div className="flex items-center justify-between">
          <span className="font-mono-num text-[13px]" style={{ color: MEDAL[rank] }}>
            {String(rank + 1).padStart(2, "0")}
          </span>
          {isFirst && (
            <span className="relative inline-flex">
              <Crown size={16} aria-hidden style={{ color: "var(--gold)" }} />
              <RecordBurst active={newRecord && !reduce} />
            </span>
          )}
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <GuardianDot name={guardian.displayName} />
          <span className="truncate text-[16px] font-medium" style={{ color: "var(--text)" }} title={guardian.displayName}>
            {guardian.displayName}
          </span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <Badge brasas={guardian.brasas} d={d} />
          <Brasas value={guardian.brasas} reduce={reduce} accent={isFirst} large />
        </div>
      </Link>
    </motion.li>
  );
}

// Shows briefly after a live poll reorders the list — "this row moved" instead of a silent slide.
function RankChangeArrow({ delta }: { delta?: number }) {
  if (!delta) return null;
  const up = delta > 0;
  return (
    <motion.span
      initial={{ opacity: 0, y: up ? 3 : -3 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      aria-hidden
      style={{ color: up ? "var(--ok)" : "var(--danger)" }}
    >
      {up ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
    </motion.span>
  );
}

/* ------------------------------------------------------------- How it works */

const SYSTEM_ICONS = [Flame, Armchair, Timer, Coins, Trophy, UserPlus, ServerCog];

// The 7 systems of the scene as one ruled grid (hairline cells), closed by an eighth cell that
// sends you to the demo — 4×2 on desktop, 2 columns on tablet, a single column on phones.
function HowItWorks({ d, L }: { d: Dict; L: Local; reduce?: boolean }) {
  return (
    <section id="how" className="mt-24 scroll-mt-24 sm:mt-32" aria-labelledby="how-title">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        {/* Editorial split: a sticky intro on the left, the seven systems as a ruled index on the
            right — reads like a spec sheet rather than a wall of identical cards. */}
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <div className="eyebrow">{d.howEyebrow}</div>
            <h2 id="how-title" className="font-serif-display mt-2 text-[32px] font-medium leading-tight sm:text-[40px]">
              {d.howTitle}
            </h2>
            <p className="mt-4 max-w-md text-[16px]" style={{ color: "var(--text-2)" }}>
              {L.howLead}
            </p>
            <div className="mt-8 hidden border-t pt-6 lg:block" style={{ borderColor: "var(--line)" }}>
              <p className="max-w-xs text-[15px]" style={{ color: "var(--text-3)" }}>
                {L.tryCell}
              </p>
              <Link href="/demo" className="btn btn-primary mt-4">
                <Play size={14} fill="currentColor" aria-hidden />
                {d.cta.demo}
              </Link>
            </div>
          </div>
        </div>

        <ol className="border-t lg:col-span-8" style={{ borderColor: "var(--line-strong)" }}>
          {d.systems.map((s, i) => {
            const Icon = SYSTEM_ICONS[i] ?? Flame;
            const lead = i === 0;
            return (
              <li
                key={s.name}
                className="grid grid-cols-[40px_1fr] gap-x-4 gap-y-1.5 border-b py-6 sm:grid-cols-[56px_220px_1fr] sm:gap-x-6 sm:py-7"
                style={{ borderColor: "var(--line)" }}
              >
                <span className="font-mono-num pt-0.5 text-[13px]" style={{ color: lead ? "var(--ember)" : "var(--text-3)" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="flex items-start gap-2.5 text-[17px] font-semibold leading-snug" style={{ color: "var(--text)" }}>
                  <Icon size={17} strokeWidth={1.75} aria-hidden className="mt-0.5 shrink-0" style={{ color: lead ? "var(--ember)" : "var(--text-3)" }} />
                  {s.name}
                </h3>
                <p className="col-start-2 text-[15px] leading-relaxed sm:col-start-3 sm:row-start-1" style={{ color: "var(--text-2)" }}>
                  {s.blurb}
                </p>
              </li>
            );
          })}
          <li className="flex flex-col gap-4 py-6 lg:hidden">
            <p className="text-[15px]" style={{ color: "var(--text-3)" }}>
              {L.tryCell}
            </p>
            <Link href="/demo" className="btn btn-primary self-start">
              <Play size={14} fill="currentColor" aria-hidden />
              {d.cta.demo}
            </Link>
          </li>
        </ol>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ Footer */

function SiteFooter({
  d,
  L,
  source,
  guardians,
  totalBrasas,
  reduce,
}: {
  d: Dict;
  L: Local;
  source: LeaderboardBundle["source"];
  guardians: number;
  totalBrasas: number;
  reduce: boolean;
}) {
  return (
    <footer className="mt-24 border-t pt-12 sm:mt-32" style={{ borderColor: "var(--line)" }}>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="flex items-center gap-2.5">
            <RefugioMark />
            <span className="font-serif-display text-[18px] font-semibold">Refugio</span>
          </div>
          <p className="mt-4 max-w-sm text-[15px]" style={{ color: "var(--text-2)" }}>
            {L.footerAbout}
          </p>
          <p className="mt-3 max-w-sm text-[13px]" style={{ color: "var(--text-3)" }}>
            {source === "live" ? d.footerLive : d.footerPreview}
          </p>
        </div>

        <div className="lg:col-span-3">
          <div className="eyebrow">{L.community}</div>
          <Link href="/stats" className="mt-4 flex flex-col gap-3">
            <FooterStat label={d.footerStats.guardians} value={guardians} reduce={reduce} />
            <FooterStat label={d.footerStats.totalBrasas} value={totalBrasas} reduce={reduce} />
          </Link>
        </div>

        <div className="lg:col-span-4">
          <div className="eyebrow">{L.project}</div>
          <ul className="mt-2 flex flex-col">
            <li>
              <Link href="/demo" className="link inline-flex min-h-11 items-center gap-1.5 text-[15px]">
                {d.cta.demo}
              </Link>
            </li>
            <li>
              <a href="https://github.com/ALFA117/Refugio" target="_blank" rel="noreferrer" className="link inline-flex min-h-11 items-center gap-1.5 text-[15px]">
                {d.cta.github}
                <ArrowUpRight size={14} aria-hidden style={{ color: "var(--text-3)" }} />
              </a>
            </li>
            <li>
              <WallShareButton d={d} />
            </li>
            <li>
              {/* Honest disabled state: the DCL scene is not published yet. */}
              <span className="inline-flex min-h-11 items-center gap-2 text-[15px]" style={{ color: "var(--text-3)" }}>
                <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--warn)" }} />
                {d.cta.sceneSoon}
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div
        className="mt-12 flex flex-col gap-2 border-t py-6 text-[13px] sm:flex-row sm:items-center sm:justify-between"
        style={{ borderColor: "var(--line)", color: "var(--text-3)" }}
      >
        <span>© Refugio · Wall of Guardians</span>
        <span>{L.built}</span>
      </div>
    </footer>
  );
}

/* --------------------------------------------------------------- Primitives */

// Guardian avatar: a neutral monogram tile (first letter of the handle). With no name it falls
// back to a small ember dot — used where only a bullet is needed.
export function GuardianDot({ big = false, name }: { big?: boolean; name?: string }) {
  const s = big ? 48 : 28;
  if (!name) {
    return <span aria-hidden className="inline-block h-2 w-2 shrink-0 rounded-full" style={{ background: "var(--ember)" }} />;
  }
  const initial = name.replace(/[^A-Za-z0-9À-ɏ]/g, "").charAt(0).toUpperCase() || "·";
  return (
    <span
      aria-hidden
      className="font-mono-num inline-flex shrink-0 items-center justify-center rounded-lg border"
      style={{
        width: s,
        height: s,
        fontSize: big ? 18 : 13,
        fontWeight: 500,
        borderColor: "var(--line-strong)",
        background: "var(--surface-2)",
        color: "var(--text-2)",
      }}
    >
      {initial}
    </span>
  );
}

// Monogram + handle, with the tier tucked under the name on phones (from `sm` up the tier has
// its own column). Shared by leaderboard rows, the podium on phones and the full roster, so the
// list reads as one system at every rank.
export function NameCell({
  name,
  brasas,
  d,
  crown = false,
  className = "sm:pl-4",
}: {
  name: string;
  brasas: number;
  d: Dict;
  crown?: boolean;
  className?: string;
}) {
  return (
    <span className={`flex min-w-0 items-center gap-3 ${className}`}>
      <span className="hidden min-[360px]:inline-flex">
        <GuardianDot name={name} />
      </span>
      <span className="flex min-w-0 flex-col gap-1">
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-[15px] font-medium leading-tight" style={{ color: "var(--text)" }} title={name}>
            {name}
          </span>
          {crown && <Crown size={13} aria-hidden className="shrink-0" style={{ color: "var(--gold)" }} />}
        </span>
        <span className="sm:hidden">
          <TierText brasas={brasas} d={d} />
        </span>
      </span>
    </span>
  );
}

// Compact tier label (dot + word) for tight rows, where the boxed Badge would eat the name.
export function TierText({ brasas, d }: { brasas: number; d: Dict }) {
  const b = badgeForBrasas(brasas, d);
  if (!b) return null;
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] leading-none" style={{ color: "var(--text-3)" }}>
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: b.color }} />
      {b.label}
    </span>
  );
}

export function Badge({ brasas, d }: { brasas: number; d: Dict }) {
  const b = badgeForBrasas(brasas, d);
  if (!b) return null;
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2 py-0.5 text-[12px] font-medium"
      style={{ borderColor: "var(--line)", color: "var(--text-2)", background: "var(--ground-2)" }}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: b.color }} />
      {b.label}
    </span>
  );
}

export function Brasas({
  value,
  reduce,
  accent = false,
  large = false,
}: {
  value: number;
  reduce: boolean;
  accent?: boolean;
  large?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5" style={{ color: accent ? "var(--ember)" : "var(--text)" }}>
      <Flame size={large ? 16 : 14} strokeWidth={1.8} aria-hidden style={{ color: "var(--ember)" }} />
      <TickerNumber value={value} reduce={reduce} className={`num font-semibold ${large ? "text-[18px]" : "text-[15px]"}`} />
    </span>
  );
}

function FooterStat({ label, value, reduce }: { label: string; value: number; reduce: boolean }) {
  return (
    <div className="flex items-baseline gap-2.5">
      <TickerNumber value={value} reduce={reduce} className="num text-[22px] font-semibold" />
      <span className="text-[14px]" style={{ color: "var(--text-3)" }}>
        {label}
      </span>
    </div>
  );
}

function WallShareButton({ d }: { d: Dict }) {
  const [copied, setCopied] = useState(false);
  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = `${d.titlePre} ${d.titleEm}`;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <motion.button
      type="button"
      onClick={share}
      whileTap={TAP_PRESS}
      transition={SNAPPY}
      className="link inline-flex min-h-11 items-center gap-1.5 text-[15px]"
    >
      {copied ? d.cta.copied : d.cta.share}
      {copied ? (
        <Check size={14} aria-hidden style={{ color: "var(--ok)" }} />
      ) : (
        <Share2 size={14} aria-hidden style={{ color: "var(--text-3)" }} />
      )}
    </motion.button>
  );
}

// Former page-wide ember canvas. The redesign drops the animated backdrop for a quieter, static
// light (see body background in globals.css); kept as a no-op so other pages' imports still work.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AmbientEmbers(props: { reduce: boolean }) {
  return null;
}
