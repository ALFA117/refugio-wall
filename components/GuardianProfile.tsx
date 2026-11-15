"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Share2, Crown, Check, Swords, ChevronRight } from "lucide-react";
import type { Guardian, Source } from "@/lib/leaderboard";
import { DICTS } from "@/lib/i18n";
import { badgeForBrasas } from "@/lib/badges";
import { EASE_OUT, TAP_PRESS, SNAPPY } from "@/lib/motion";
import { useLang } from "./useLang";
import { TickerNumber } from "./TickerNumber";
import { SiteHeader, DataSourcePill } from "./SiteHeader";
import { Sparkline } from "./Sparkline";
import { guardianHref } from "./Wall";

const LOCAL = {
  en: { guardians: "Guardians", leading: "Leading the Wall", tier: "Tier", rounds: "Rounds played", rank: "Rank", allGuardians: "See all guardians" },
  es: { guardians: "Guardianes", leading: "A la cabeza del Muro", tier: "Rango", rounds: "Rondas jugadas", rank: "Posición", allGuardians: "Ver todos los guardianes" },
} as const;

export function GuardianProfile({
  guardian,
  name,
  rank,
  total,
  source,
  suggestion,
  trend,
}: {
  guardian: Guardian | null;
  name: string;
  rank: number; // 0-based, -1 if not found
  total: number;
  source: Source;
  suggestion?: string | null;
  trend?: number[];
}) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const d = DICTS[lang];
  const L = LOCAL[lang];
  const isFirst = rank === 0;
  // "Ahead of X%" — only meaningful below #1 and with more than one guardian. The leader gets
  // "Leading the Wall" instead of the awkward "Ahead of 100%".
  const percentile = guardian && rank > 0 && total > 1 ? Math.round(((total - rank - 1) / (total - 1)) * 100) : null;
  const badge = guardian ? badgeForBrasas(guardian.brasas, d) : null;

  return (
    <>
      <SiteHeader lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} reduce={!!reduce} />
      <main id="main" className="page pb-24 pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[14px]" style={{ color: "var(--text-3)" }}>
          <Link href="/guardians" className="link inline-flex min-h-11 items-center" style={{ color: "var(--text-2)" }}>
            {L.guardians}
          </Link>
          <ChevronRight size={14} aria-hidden className="shrink-0" />
          <span className="truncate" aria-current="page">
            {name}
          </span>
        </nav>

        {guardian ? (
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 12 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
          >
            <header className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <div
                  aria-hidden
                  className="font-serif-display flex shrink-0 items-center justify-center rounded-2xl border text-[30px] font-medium sm:text-[36px]"
                  style={{ width: 72, height: 72, borderColor: isFirst ? "var(--gold)" : "var(--line-strong)", background: "var(--surface-2)", color: "var(--text)" }}
                >
                  {guardian.displayName.replace(/[^A-Za-z0-9]/g, "").charAt(0).toUpperCase() || "·"}
                </div>
                <div className="min-w-0">
                  <DataSourcePill source={source} lang={lang} />
                  <h1
                    className="font-serif-display mt-2 truncate text-[28px] font-medium leading-tight sm:text-[48px]"
                    style={{ color: "var(--text)" }}
                    title={guardian.displayName}
                  >
                    {guardian.displayName}
                  </h1>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[15px]" style={{ color: "var(--text-2)" }}>
                    {isFirst && <Crown size={15} aria-hidden style={{ color: "var(--gold)" }} />}
                    <span>{isFirst ? L.leading : percentile !== null && percentile > 0 ? d.profile.aheadOfPct.replace("{pct}", String(percentile)) : `${d.profile.rank} #${rank + 1}`}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <ShareButton d={d} />
                <Link href={`/compare?a=${encodeURIComponent(guardian.displayName)}`} className="btn btn-secondary">
                  <Swords size={15} aria-hidden style={{ color: "var(--text-3)" }} />
                  {d.comparePage.compare}
                </Link>
              </div>
            </header>

            <section className="panel mt-8 grid overflow-hidden lg:grid-cols-12" aria-label={d.brasas}>
              <div className="border-b p-6 sm:p-8 lg:col-span-5 lg:border-b-0 lg:border-r" style={{ borderColor: "var(--line)" }}>
                <div className="text-[14px] capitalize" style={{ color: "var(--text-3)" }}>
                  {d.brasas}
                </div>
                <TickerNumber value={guardian.brasas} reduce={!!reduce} className="num mt-3 block text-[52px] font-semibold leading-none sm:text-[64px]" />
                {trend && trend.length >= 2 ? (
                  <div className="mt-5 flex items-center gap-3">
                    <Sparkline values={trend} />
                    <span className="text-[13px]" style={{ color: "var(--text-3)" }}>
                      {d.profile.trend}
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 h-1 w-16 rounded-full" style={{ background: "var(--ember)" }} aria-hidden />
                )}
              </div>
              <dl className="grid grid-cols-2 sm:grid-cols-3 lg:col-span-7">
                <Fact label={L.rank}>
                  <span className="num">#{rank + 1}</span>
                  <span className="ml-1.5 text-[14px] font-normal" style={{ color: "var(--text-3)" }}>
                    {d.profile.of} {total}
                  </span>
                </Fact>
                <Fact label={L.rounds} border>
                  <span className="num">{typeof guardian.gamesPlayed === "number" ? guardian.gamesPlayed : "—"}</span>
                </Fact>
                <Fact label={L.tier} className="col-span-2 border-t sm:col-span-1 sm:border-l sm:border-t-0">
                  {badge ? (
                    <span className="inline-flex items-center gap-2 text-[18px] sm:text-[22px]">
                      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: badge.color }} />
                      {badge.label}
                    </span>
                  ) : (
                    "—"
                  )}
                </Fact>
              </dl>
            </section>

            <div className="mt-6">
              <Link href="/guardians" className="link inline-flex min-h-11 items-center text-[15px]">
                {L.allGuardians}
              </Link>
            </div>
          </motion.div>
        ) : (
          <section className="panel mt-6 max-w-xl p-6 sm:p-8">
            <h1 className="font-serif-display text-[30px] font-medium leading-tight" style={{ color: "var(--text)" }}>
              {d.profile.notFound}
            </h1>
            <p className="mt-2 text-[16px]" style={{ color: "var(--text-2)" }}>
              “{name}” — {d.profile.notFoundBody}
            </p>
            {suggestion && (
              <p className="mt-4 text-[15px]" style={{ color: "var(--text-3)" }}>
                {d.profile.didYouMean}{" "}
                <Link href={guardianHref(suggestion)} className="link font-medium">
                  {suggestion}
                </Link>
                ?
              </p>
            )}
            <Link href="/guardians" className="btn btn-secondary mt-6">
              {L.allGuardians}
            </Link>
          </section>
        )}
      </main>
    </>
  );
}

function Fact({ label, children, border = false, className = "" }: { label: string; children: React.ReactNode; border?: boolean; className?: string }) {
  return (
    <div className={`flex min-w-0 flex-col justify-between gap-3 p-4 sm:p-6 ${border ? "border-l" : ""} ${className}`} style={{ borderColor: "var(--line)" }}>
      <dt className="text-[13px] leading-snug sm:text-[14px]" style={{ color: "var(--text-3)" }}>
        {label}
      </dt>
      <dd className="text-[24px] font-semibold leading-none sm:text-[30px]" style={{ color: "var(--text)" }}>
        {children}
      </dd>
    </div>
  );
}

function ShareButton({ d }: { d: (typeof DICTS)["en"] }) {
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
    <motion.button onClick={share} whileTap={TAP_PRESS} transition={SNAPPY} className="btn btn-primary">
      {copied ? <Check size={15} aria-hidden /> : <Share2 size={15} aria-hidden />}
      {copied ? d.profile.copied : d.profile.share}
    </motion.button>
  );
}
