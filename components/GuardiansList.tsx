"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Guardian, Source } from "@/lib/leaderboard";
import { DICTS } from "@/lib/i18n";
import { TAP_PRESS, SNAPPY } from "@/lib/motion";
import { useLang } from "./useLang";
import { SiteHeader, DataSourcePill } from "./SiteHeader";
import { Badge, Brasas, NameCell, guardianHref } from "./Wall";

const PAGE_SIZE = 20;
const MEDAL = ["var(--gold)", "var(--silver)", "var(--bronze)"];

const COLS = {
  en: { guardian: "Guardian", tier: "Tier", rounds: "Rounds", embers: "Embers", showing: "Showing {n} of {t}" },
  es: { guardian: "Guardián", tier: "Rango", rounds: "Rondas", embers: "Brasas", showing: "Mostrando {n} de {t}" },
} as const;

// Wall.tsx only ever renders the top 10 — anyone ranked below that was invisible on the site
// even though the data existed. This page is the full roster as one ruled table (same row
// anatomy as the leaderboard), with a "load more" step instead of dumping a long list at once.
export function GuardiansList({ entries, source }: { entries: Guardian[]; source: Source }) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const d = DICTS[lang];
  const c = COLS[lang];
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = entries.slice(0, visible);
  const remaining = entries.length - visible;

  return (
    <>
      <SiteHeader lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} reduce={!!reduce} />
      <main id="main" className="page pb-24 pt-10 sm:pt-14">
        <header className="grid gap-4 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="eyebrow">{d.guardiansPage.eyebrow}</span>
              <DataSourcePill source={source} lang={lang} />
            </div>
            <h1 className="font-serif-display mt-3 text-[36px] font-medium leading-tight sm:text-[48px]">
              {d.guardiansPage.title}
            </h1>
            <p className="mt-3 max-w-xl text-[16px]" style={{ color: "var(--text-2)" }}>
              {d.guardiansPage.subtitle.replace("{n}", String(entries.length))}
            </p>
          </div>
        </header>

        <div className="panel mt-8 overflow-hidden">
          <div
            className="hidden grid-cols-[40px_1fr_160px_100px_120px] items-center border-b px-4 py-3 sm:grid"
            style={{ borderColor: "var(--line)", background: "var(--ground-2)" }}
            aria-hidden
          >
            <span className="eyebrow">#</span>
            <span className="eyebrow pl-4">{c.guardian}</span>
            <span className="eyebrow">{c.tier}</span>
            <span className="eyebrow text-right">{c.rounds}</span>
            <span className="eyebrow text-right">{c.embers}</span>
          </div>

          <ol>
            {shown.map((g, i) => (
              <motion.li
                key={g.displayName}
                className="relative border-b last:border-b-0"
                style={{ borderColor: "var(--line)" }}
                initial={reduce ? undefined : { opacity: 0 }}
                animate={reduce ? undefined : { opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: Math.min(i * 0.012, 0.25) }}
              >
                {i < 3 && <span aria-hidden className="absolute inset-y-0 left-0 w-0.5" style={{ background: MEDAL[i], opacity: i === 0 ? 1 : 0.6 }} />}
                <Link
                  href={guardianHref(g.displayName)}
                  className="grid min-h-16 grid-cols-[28px_1fr_auto] items-center gap-3 px-4 py-2.5 transition-colors hover:bg-[var(--surface-2)] sm:min-h-14 sm:grid-cols-[40px_1fr_160px_100px_120px] sm:gap-0 sm:py-0"
                >
                  <span className="font-mono-num text-[14px]" style={{ color: i < 3 ? MEDAL[i] : "var(--text-3)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <NameCell name={g.displayName} brasas={g.brasas} d={d} crown={i === 0} />
                  <span className="hidden sm:block">
                    <Badge brasas={g.brasas} d={d} />
                  </span>
                  <span className="num hidden text-right text-[15px] sm:block" style={{ color: "var(--text-2)" }}>
                    {typeof g.gamesPlayed === "number" ? g.gamesPlayed : "—"}
                  </span>
                  <span className="flex justify-end">
                    <Brasas value={g.brasas} reduce={!!reduce} accent={i === 0} />
                  </span>
                </Link>
              </motion.li>
            ))}
          </ol>

          <div
            className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-2"
            style={{ borderColor: "var(--line)", background: "var(--ground-2)" }}
          >
            <span className="text-[13px]" style={{ color: "var(--text-3)" }}>
              {c.showing.replace("{n}", String(shown.length)).replace("{t}", String(entries.length))}
            </span>
            {remaining > 0 && (
              <motion.button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                whileTap={TAP_PRESS}
                transition={SNAPPY}
                className="link inline-flex min-h-11 items-center gap-1.5 text-[14px]"
              >
                {d.guardiansPage.loadMore} · {Math.min(remaining, PAGE_SIZE)}
                <ChevronDown size={14} aria-hidden />
              </motion.button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
