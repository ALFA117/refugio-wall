"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Crown, Swords, Zap } from "lucide-react";
import type { Guardian, Source } from "@/lib/leaderboard";
import { DICTS } from "@/lib/i18n";
import { BADGE_TIERS } from "@/lib/badges";
import { EASE_OUT } from "@/lib/motion";
import { useLang } from "./useLang";
import { SiteHeader, DataSourcePill } from "./SiteHeader";
import { GuardianDot, guardianHref } from "./Wall";
import { TickerNumber } from "./TickerNumber";

const LOCAL = {
  en: { highlights: "Highlights", leader: "Leading the Wall", share: "Share", guardians: "guardians", none: "No rounds recorded yet." },
  es: { highlights: "Destacados", leader: "A la cabeza del Muro", share: "Parte", guardians: "guardianes", none: "Todavía no hay rondas registradas." },
} as const;

export function StatsPage({
  entries,
  source,
  gainer,
}: {
  entries: Guardian[];
  source: Source;
  gainer?: { name: string; delta: number } | null;
}) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const d = DICTS[lang];
  const L = LOCAL[lang];

  const totalGuardians = entries.length;
  const totalBrasas = entries.reduce((sum, g) => sum + g.brasas, 0);
  const totalRounds = entries.reduce((sum, g) => sum + (g.gamesPlayed ?? 0), 0);
  const avgBrasas = totalGuardians > 0 ? Math.round(totalBrasas / totalGuardians) : 0;
  const leader = entries[0] ?? null;
  const mostActive = entries.reduce<Guardian | null>((best, g) => {
    if (typeof g.gamesPlayed !== "number") return best;
    if (!best || (best.gamesPlayed ?? 0) < g.gamesPlayed) return g;
    return best;
  }, null);

  const tierCounts = BADGE_TIERS.map((tier) => ({
    tier,
    count: entries.filter((g) => g.brasas >= tier.min && g.brasas < (tierBelow(tier.min) ?? Infinity)).length,
  }));
  const maxCount = Math.max(1, ...tierCounts.map((t) => t.count));

  const rise = (delay: number) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, ease: EASE_OUT, delay } };

  return (
    <>
      <SiteHeader lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} reduce={!!reduce} />
      <main id="main" className="page pb-24 pt-10 sm:pt-14">
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">{d.statsPage.eyebrow}</span>
            <DataSourcePill source={source} lang={lang} />
          </div>
          <h1 className="font-serif-display mt-3 text-[36px] font-medium leading-tight sm:text-[48px]">{d.statsPage.title}</h1>
          <p className="mt-3 max-w-xl text-[16px]" style={{ color: "var(--text-2)" }}>
            {d.statsPage.subtitle}
          </p>
        </header>

        {/* One ruled band instead of four identical KPI cards: the headline figure leads, the
            supporting three sit beside it at a smaller size. */}
        <motion.section {...rise(0)} className="panel mt-10 grid overflow-hidden lg:grid-cols-12" aria-label={d.statsPage.title}>
          <div className="border-b p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--line)" }}>
            <div className="text-[14px]" style={{ color: "var(--text-3)" }}>
              {d.statsPage.totalBrasas}
            </div>
            <TickerNumber value={totalBrasas} reduce={!!reduce} className="num mt-3 block text-[52px] font-semibold leading-none sm:text-[64px]" />
            <div className="mt-4 h-1 w-16 rounded-full" style={{ background: "var(--ember)" }} aria-hidden />
          </div>
          <dl className="grid grid-cols-3 lg:col-span-7">
            <Kpi label={d.statsPage.totalGuardians} value={totalGuardians} reduce={!!reduce} />
            <Kpi label={d.statsPage.totalRounds} value={totalRounds} reduce={!!reduce} border />
            <Kpi label={d.statsPage.avgBrasas} value={avgBrasas} reduce={!!reduce} border />
          </dl>
        </motion.section>

        <div className="mt-4 grid gap-4 lg:grid-cols-12">
          <motion.section {...rise(0.08)} className="panel overflow-hidden lg:col-span-7" aria-labelledby="dist-title">
            <h2 id="dist-title" className="border-b px-5 py-4 text-[15px] font-semibold" style={{ borderColor: "var(--line)" }}>
              {d.statsPage.badgeDistribution}
            </h2>
            <ul>
              {tierCounts.map(({ tier, count }) => {
                const pct = totalGuardians > 0 ? Math.round((count / totalGuardians) * 100) : 0;
                return (
                  <li
                    key={tier.key}
                    className="grid grid-cols-[minmax(0,112px)_1fr_64px] items-center gap-4 border-b px-5 py-3.5 last:border-b-0 sm:grid-cols-[140px_1fr_88px]"
                    style={{ borderColor: "var(--line)" }}
                  >
                    <span className="flex min-w-0 items-center gap-2 text-[14px]" style={{ color: "var(--text-2)" }}>
                      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: tier.color }} />
                      <span className="truncate">{d.badges[tier.key as keyof typeof d.badges]}</span>
                    </span>
                    <span className="h-1.5 overflow-hidden rounded-full" style={{ background: "var(--surface-3)" }}>
                      <motion.span
                        className="block h-full rounded-full"
                        style={{ background: count > 0 ? "var(--text-2)" : "transparent" }}
                        initial={reduce ? { width: `${(count / maxCount) * 100}%` } : { width: 0 }}
                        animate={{ width: `${(count / maxCount) * 100}%` }}
                        transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.2 }}
                      />
                    </span>
                    <span className="num text-right text-[14px]" style={{ color: "var(--text)" }}>
                      {count}
                      <span className="ml-1.5 hidden text-[13px] sm:inline" style={{ color: "var(--text-3)" }}>
                        {pct}%
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.section>

          <motion.section {...rise(0.12)} className="panel overflow-hidden lg:col-span-5" aria-labelledby="hl-title">
            <h2 id="hl-title" className="border-b px-5 py-4 text-[15px] font-semibold" style={{ borderColor: "var(--line)" }}>
              {L.highlights}
            </h2>
            <ul>
              {leader && (
                <Highlight
                  icon={<Crown size={15} aria-hidden style={{ color: "var(--gold)" }} />}
                  label={L.leader}
                  name={leader.displayName}
                  value={`${leader.brasas.toLocaleString()} ${d.brasas}`}
                />
              )}
              {mostActive ? (
                <Highlight
                  icon={<Swords size={15} aria-hidden style={{ color: "var(--text-3)" }} />}
                  label={d.statsPage.mostActive}
                  name={mostActive.displayName}
                  value={`${mostActive.gamesPlayed} ${d.rounds}`}
                />
              ) : (
                <li className="px-5 py-4 text-[14px]" style={{ color: "var(--text-3)" }}>
                  {L.none}
                </li>
              )}
              {gainer && (
                <Highlight
                  icon={<Zap size={15} aria-hidden style={{ color: "var(--ok)" }} />}
                  label={d.statsPage.topGainer}
                  name={gainer.name}
                  value={`+${gainer.delta} ${d.brasas}`}
                  positive
                />
              )}
            </ul>
          </motion.section>
        </div>
      </main>
    </>
  );
}

// The next-higher threshold (so we can bucket guardians strictly between two tiers, not just
// "at least X" which would double-count everyone above into every lower tier too).
function tierBelow(min: number): number | undefined {
  const idx = BADGE_TIERS.findIndex((t) => t.min === min);
  return idx > 0 ? BADGE_TIERS[idx - 1].min : undefined;
}

function Kpi({ label, value, reduce, border = false }: { label: string; value: number; reduce: boolean; border?: boolean }) {
  return (
    <div className={`flex flex-col justify-between gap-3 p-4 sm:p-6 ${border ? "border-l" : ""}`} style={{ borderColor: "var(--line)" }}>
      <dt className="text-[13px] leading-snug sm:text-[14px]" style={{ color: "var(--text-3)" }}>
        {label}
      </dt>
      <dd>
        <TickerNumber value={value} reduce={reduce} className="num text-[26px] font-semibold leading-none sm:text-[32px]" />
      </dd>
    </div>
  );
}

function Highlight({
  icon,
  label,
  name,
  value,
  positive = false,
}: {
  icon: React.ReactNode;
  label: string;
  name: string;
  value: string;
  positive?: boolean;
}) {
  return (
    <li className="border-b last:border-b-0" style={{ borderColor: "var(--line)" }}>
      <Link href={guardianHref(name)} className="group flex min-h-16 items-center gap-3 px-5 py-3 transition-colors hover:bg-[var(--surface-2)]">
        <GuardianDot name={name} />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex items-center gap-1.5 text-[13px]" style={{ color: "var(--text-3)" }}>
            {icon}
            {label}
          </span>
          <span className="truncate text-[15px] font-medium" style={{ color: "var(--text)" }}>
            {name}
          </span>
        </span>
        <span className="num shrink-0 text-[14px] font-medium" style={{ color: positive ? "var(--ok)" : "var(--text-2)" }}>
          {value}
        </span>
        <ArrowUpRight size={14} aria-hidden className="hidden shrink-0 sm:block" style={{ color: "var(--text-3)" }} />
      </Link>
    </li>
  );
}
