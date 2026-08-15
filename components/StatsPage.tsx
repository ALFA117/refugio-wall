"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Users, Flame, Swords, TrendingUp, Crown } from "lucide-react";
import type { Guardian } from "@/lib/leaderboard";
import { DICTS } from "@/lib/i18n";
import { BADGE_TIERS } from "@/lib/badges";
import { EASE_OUT } from "@/lib/motion";
import { useLang } from "./useLang";
import { LangToggle } from "./LangToggle";
import { AmbientEmbers, guardianHref } from "./Wall";
import { TickerNumber } from "./TickerNumber";

export function StatsPage({ entries }: { entries: Guardian[] }) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const d = DICTS[lang];

  const totalGuardians = entries.length;
  const totalBrasas = entries.reduce((sum, g) => sum + g.brasas, 0);
  const totalRounds = entries.reduce((sum, g) => sum + (g.gamesPlayed ?? 0), 0);
  const avgBrasas = totalGuardians > 0 ? Math.round(totalBrasas / totalGuardians) : 0;
  const mostActive = entries.reduce<Guardian | null>((best, g) => {
    if (typeof g.gamesPlayed !== "number") return best;
    if (!best || (best.gamesPlayed ?? 0) < g.gamesPlayed) return g;
    return best;
  }, null);

  const tierCounts = BADGE_TIERS.map((tier) => ({
    tier,
    count: entries.filter((g) => g.brasas >= tier.min && g.brasas < (tierBelow(tier.min) ?? Infinity)).length,
  }));

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-2xl px-5 pb-24 pt-14 sm:pt-20">
      <AmbientEmbers reduce={!!reduce} />

      <div className="relative z-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1.5 text-[13px] transition-colors hover:text-[var(--warm-white)]"
          style={{ color: "var(--ash)" }}
        >
          <ArrowLeft size={15} style={{ color: "var(--violet)" }} />
          {d.statsPage.back}
        </Link>
        <LangToggle lang={lang} onClick={() => setLang(lang === "en" ? "es" : "en")} reduce={!!reduce} />
      </div>

      <header className="relative z-10 mt-8 text-center">
        <div className="eyebrow">{d.statsPage.eyebrow}</div>
        <h1 className="font-serif-display mx-auto mt-3 max-w-[16ch] text-3xl font-semibold tracking-tight sm:text-4xl">
          {d.statsPage.title}
        </h1>
        <p className="mt-2 text-[14px]" style={{ color: "var(--ash-dim)" }}>
          {d.statsPage.subtitle}
        </p>
      </header>

      <div className="relative z-10 mt-9 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Users size={18} />} label={d.statsPage.totalGuardians} value={totalGuardians} reduce={!!reduce} delay={0} />
        <StatCard icon={<Flame size={18} />} label={d.statsPage.totalBrasas} value={totalBrasas} reduce={!!reduce} delay={0.05} />
        <StatCard icon={<Swords size={18} />} label={d.statsPage.totalRounds} value={totalRounds} reduce={!!reduce} delay={0.1} />
        <StatCard icon={<TrendingUp size={18} />} label={d.statsPage.avgBrasas} value={avgBrasas} reduce={!!reduce} delay={0.15} />
      </div>

      {mostActive && (
        <motion.div
          className="card relative z-10 mt-4 flex items-center gap-3 p-4"
          initial={reduce ? undefined : { opacity: 0, y: 12 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.2 }}
        >
          <Crown size={18} style={{ color: "var(--gold)" }} />
          <span className="text-[13px]" style={{ color: "var(--ash)" }}>
            {d.statsPage.mostActive}
          </span>
          <Link
            href={guardianHref(mostActive.displayName)}
            className="ml-auto text-[14px] font-medium transition-colors hover:text-[var(--spark)]"
            style={{ color: "var(--warm-white)" }}
          >
            {mostActive.displayName} · {mostActive.gamesPlayed}
          </Link>
        </motion.div>
      )}

      <motion.div
        className="card relative z-10 mt-4 p-4"
        initial={reduce ? undefined : { opacity: 0, y: 12 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT, delay: 0.25 }}
      >
        <div className="text-[13px]" style={{ color: "var(--ash)" }}>
          {d.statsPage.badgeDistribution}
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {tierCounts.map(({ tier, count }) => (
            <div key={tier.key} className="flex items-center gap-3">
              <span
                className="font-mono-num w-20 shrink-0 rounded-full px-2 py-0.5 text-center text-[10px] uppercase tracking-wider"
                style={{ color: tier.color, border: `1px solid ${tier.color}` }}
              >
                {d.badges[tier.key as keyof typeof d.badges]}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: tier.color }}
                  initial={reduce ? undefined : { width: 0 }}
                  animate={reduce ? undefined : { width: `${totalGuardians > 0 ? (count / totalGuardians) * 100 : 0}%` }}
                  transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.3 }}
                />
              </div>
              <span className="font-mono-num w-6 text-right text-[12px]" style={{ color: "var(--ash-dim)" }}>
                {count}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </main>
  );
}

// The next-higher threshold (so we can bucket guardians strictly between two tiers, not just
// "at least X" which would double-count everyone above into every lower tier too).
function tierBelow(min: number): number | undefined {
  const idx = BADGE_TIERS.findIndex((t) => t.min === min);
  return idx > 0 ? BADGE_TIERS[idx - 1].min : undefined;
}

function StatCard({ icon, label, value, reduce, delay }: { icon: ReactNode; label: string; value: number; reduce: boolean; delay: number }) {
  return (
    <motion.div
      className="card flex flex-col items-center gap-1.5 p-4 text-center"
      initial={reduce ? undefined : { opacity: 0, y: 14 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT, delay }}
    >
      <span style={{ color: "var(--ember)" }}>{icon}</span>
      <TickerNumber value={value} reduce={reduce} className="font-mono-num text-xl font-semibold" />
      <span className="text-[11px]" style={{ color: "var(--ash-dim)" }}>
        {label}
      </span>
    </motion.div>
  );
}
