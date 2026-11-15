"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Crown, Search, X, ArrowRight, Swords } from "lucide-react";
import type { Guardian, Source } from "@/lib/leaderboard";
import { DICTS } from "@/lib/i18n";
import { badgeForBrasas } from "@/lib/badges";
import { EASE_OUT } from "@/lib/motion";
import { useLang } from "./useLang";
import { SiteHeader, DataSourcePill } from "./SiteHeader";
import { GuardianDot, Badge, guardianHref } from "./Wall";
import { TickerNumber } from "./TickerNumber";

const LOCAL = {
  en: {
    lead: "Put two guardians side by side: embers, rank, rounds and tier.",
    sideA: "Guardian A",
    sideB: "Guardian B",
    quickTitle: "Not sure where to start?",
    quickBody: "Compare the two guardians at the top of the Wall, or pick one from the top five.",
    quickTop: "Compare #1 and #2",
    pickOpponent: "Pick an opponent",
    rank: "Rank",
    rounds: "Rounds",
    tier: "Tier",
    embers: "Embers",
    metric: "Metric",
  },
  es: {
    lead: "Pon a dos guardianes lado a lado: brasas, posición, rondas y rango.",
    sideA: "Guardián A",
    sideB: "Guardián B",
    quickTitle: "¿No sabes por dónde empezar?",
    quickBody: "Compara a los dos primeros del Muro o elige a uno de los cinco primeros.",
    quickTop: "Comparar #1 y #2",
    pickOpponent: "Elige un rival",
    rank: "Posición",
    rounds: "Rondas",
    tier: "Rango",
    embers: "Brasas",
    metric: "Dato",
  },
} as const;

const hrefFor = (a?: string, b?: string) => {
  const p = new URLSearchParams();
  if (a) p.set("a", a);
  if (b) p.set("b", b);
  const qs = p.toString();
  return qs ? `/compare?${qs}` : "/compare";
};

export function CompareView({
  entries,
  source,
  a,
  b,
  rankA,
  rankB,
}: {
  entries: Guardian[];
  source: Source;
  a: Guardian | null;
  b: Guardian | null;
  rankA: number;
  rankB: number;
}) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const d = DICTS[lang];
  const L = LOCAL[lang];
  const router = useRouter();

  function setSide(side: "a" | "b", name: string) {
    router.push(side === "a" ? hrefFor(name || undefined, b?.displayName) : hrefFor(a?.displayName, name || undefined));
  }

  const picked = a ?? b;
  const top5 = entries.slice(0, 5).filter((g) => g.displayName !== picked?.displayName);

  return (
    <>
      <SiteHeader lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} reduce={!!reduce} />
      <main id="main" className="page pb-24 pt-10 sm:pt-14">
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <span className="eyebrow">{d.comparePage.eyebrow}</span>
            <DataSourcePill source={source} lang={lang} />
          </div>
          <h1 className="font-serif-display mt-3 text-[36px] font-medium leading-tight sm:text-[48px]">{d.comparePage.title}</h1>
          <p className="mt-3 max-w-xl text-[16px]" style={{ color: "var(--text-2)" }}>
            {L.lead}
          </p>
        </header>

        <div className="mt-10 max-w-4xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Slot side={L.sideA} guardian={a} rank={rankA} exclude={b?.displayName} entries={entries} onPick={(n) => setSide("a", n)} d={d} reduce={!!reduce} />
            <Slot side={L.sideB} guardian={b} rank={rankB} exclude={a?.displayName} entries={entries} onPick={(n) => setSide("b", n)} d={d} reduce={!!reduce} />
          </div>

          {/* Guided empty / half-empty state, so the page never ends in a blank. */}
          {!(a && b) && entries.length >= 2 && (
            <section className="panel mt-4 p-5 sm:p-6" aria-labelledby="quick-title">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="max-w-md">
                  <h2 id="quick-title" className="text-[16px] font-semibold" style={{ color: "var(--text)" }}>
                    {picked ? L.pickOpponent : L.quickTitle}
                  </h2>
                  {!picked && (
                    <p className="mt-1.5 text-[15px]" style={{ color: "var(--text-2)" }}>
                      {L.quickBody}
                    </p>
                  )}
                </div>
                {!picked && (
                  <Link href={hrefFor(entries[0].displayName, entries[1].displayName)} className="btn btn-primary shrink-0">
                    <Swords size={15} aria-hidden />
                    {L.quickTop}
                  </Link>
                )}
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {top5.map((g) => {
                  const href = a ? hrefFor(a.displayName, g.displayName) : b ? hrefFor(g.displayName, b.displayName) : hrefFor(g.displayName);
                  return (
                    <li key={g.displayName}>
                      <Link
                        href={href}
                        className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border px-3 text-[14px] transition-colors hover:border-[var(--line-ember)] hover:bg-[var(--surface-2)]"
                        style={{ borderColor: "var(--line-strong)", color: "var(--text)" }}
                      >
                        <span className="font-mono-num text-[12px]" style={{ color: "var(--text-3)" }}>
                          #{entries.indexOf(g) + 1}
                        </span>
                        {g.displayName}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {a && b && <HeadToHead a={a} b={b} rankA={rankA} rankB={rankB} d={d} L={L} reduce={!!reduce} />}
        </div>
      </main>
    </>
  );
}

function HeadToHead({
  a,
  b,
  rankA,
  rankB,
  d,
  L,
  reduce,
}: {
  a: Guardian;
  b: Guardian;
  rankA: number;
  rankB: number;
  d: (typeof DICTS)["en"];
  L: (typeof LOCAL)["en"] | (typeof LOCAL)["es"];
  reduce: boolean;
}) {
  const rows: { label: string; va: string; vb: string; win: "a" | "b" | null }[] = [
    {
      label: L.embers,
      va: a.brasas.toLocaleString(),
      vb: b.brasas.toLocaleString(),
      win: a.brasas === b.brasas ? null : a.brasas > b.brasas ? "a" : "b",
    },
    {
      label: L.rank,
      va: rankA >= 0 ? `#${rankA + 1}` : "—",
      vb: rankB >= 0 ? `#${rankB + 1}` : "—",
      win: rankA === rankB || rankA < 0 || rankB < 0 ? null : rankA < rankB ? "a" : "b",
    },
    {
      label: L.rounds,
      va: typeof a.gamesPlayed === "number" ? String(a.gamesPlayed) : "—",
      vb: typeof b.gamesPlayed === "number" ? String(b.gamesPlayed) : "—",
      win:
        typeof a.gamesPlayed !== "number" || typeof b.gamesPlayed !== "number" || a.gamesPlayed === b.gamesPlayed
          ? null
          : a.gamesPlayed > b.gamesPlayed
            ? "a"
            : "b",
    },
    {
      label: L.tier,
      va: badgeForBrasas(a.brasas, d)?.label ?? "—",
      vb: badgeForBrasas(b.brasas, d)?.label ?? "—",
      win: null,
    },
  ];
  const verdict =
    a.brasas === b.brasas
      ? d.comparePage.tied
      : d.comparePage.ahead
          .replace("{name}", a.brasas > b.brasas ? a.displayName : b.displayName)
          .replace("{n}", String(Math.abs(a.brasas - b.brasas)));

  return (
    <motion.section
      className="panel mt-4 overflow-hidden"
      initial={reduce ? undefined : { opacity: 0, y: 10 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      aria-label={d.comparePage.title}
    >
      <table className="w-full table-fixed text-left">
        <thead>
          <tr style={{ background: "var(--ground-2)" }}>
            <th scope="col" className="eyebrow w-[30%] px-4 py-3 font-normal sm:px-5">{L.metric}</th>
            <th scope="col" className="truncate px-4 py-3 text-right text-[13px] font-medium sm:px-5" style={{ color: "var(--text-2)" }}>{a.displayName}</th>
            <th scope="col" className="truncate px-4 py-3 text-right text-[13px] font-medium sm:px-5" style={{ color: "var(--text-2)" }}>{b.displayName}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.label} className="border-t" style={{ borderColor: "var(--line)" }}>
              <th scope="row" className="px-4 py-3.5 text-[14px] font-normal sm:px-5" style={{ color: "var(--text-3)" }}>
                {r.label}
              </th>
              <Cell value={r.va} win={r.win === "a"} />
              <Cell value={r.vb} win={r.win === "b"} />
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t px-4 py-3.5 text-[15px] sm:px-5" style={{ borderColor: "var(--line)", background: "var(--ground-2)", color: "var(--text)" }}>
        {verdict}
      </p>
    </motion.section>
  );
}

function Cell({ value, win }: { value: string; win: boolean }) {
  return (
    <td className="num px-4 py-3.5 text-right text-[15px] font-medium sm:px-5" style={{ color: win ? "var(--ember)" : "var(--text)" }}>
      {value}
    </td>
  );
}

function Slot({
  side,
  guardian,
  rank,
  exclude,
  entries,
  onPick,
  d,
  reduce,
}: {
  side: string;
  guardian: Guardian | null;
  rank: number;
  exclude?: string;
  entries: Guardian[];
  onPick: (name: string) => void;
  d: (typeof DICTS)["en"];
  reduce: boolean;
}) {
  const [query, setQuery] = useState("");
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return entries.filter((e) => e.displayName.toLowerCase() !== exclude?.toLowerCase() && e.displayName.toLowerCase().includes(q)).slice(0, 6);
  }, [query, entries, exclude]);

  if (guardian) {
    return (
      <motion.div
        className="panel relative flex flex-col p-5 sm:p-6"
        initial={reduce ? undefined : { opacity: 0, y: 6 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT }}
      >
        <div className="flex items-center justify-between">
          <span className="eyebrow">{side}</span>
          <button
            type="button"
            onClick={() => onPick("")}
            aria-label={`${d.comparePage.clear} — ${guardian.displayName}`}
            className="-mr-3 -mt-3 inline-flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:text-[var(--text)]"
            style={{ color: "var(--text-3)" }}
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-2 flex min-w-0 items-center gap-3">
          <GuardianDot big name={guardian.displayName} />
          <div className="min-w-0">
            <Link
              href={guardianHref(guardian.displayName)}
              className="font-serif-display flex items-center gap-2 text-[22px] font-medium leading-tight transition-colors hover:text-[var(--ember)]"
              style={{ color: "var(--text)" }}
            >
              <span className="truncate">{guardian.displayName}</span>
              {rank === 0 && <Crown size={16} aria-hidden className="shrink-0" style={{ color: "var(--gold)" }} />}
            </Link>
            <div className="mt-1 flex items-center gap-2">
              {rank >= 0 && (
                <span className="font-mono-num text-[13px]" style={{ color: "var(--text-3)" }}>
                  #{rank + 1}
                </span>
              )}
              <Badge brasas={guardian.brasas} d={d} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-baseline gap-2 border-t pt-4" style={{ borderColor: "var(--line)" }}>
          <TickerNumber value={guardian.brasas} reduce={reduce} className="num text-[32px] font-semibold leading-none" />
          <span className="text-[14px]" style={{ color: "var(--text-3)" }}>
            {d.brasas}
          </span>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="panel relative flex flex-col gap-3 p-5 sm:p-6" style={{ borderStyle: "dashed", borderColor: "var(--line-strong)" }}>
      <span className="eyebrow">{side}</span>
      <label
        className="flex min-h-11 items-center gap-2 rounded-[10px] border px-3 transition-colors focus-within:border-[var(--line-ember)]"
        style={{ borderColor: "var(--line)", background: "var(--ground-2)" }}
      >
        <Search size={16} aria-hidden style={{ color: "var(--text-3)" }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={d.comparePage.pickPlaceholder}
          aria-label={`${side}: ${d.comparePage.pickPlaceholder}`}
          className="min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-[var(--text-3)]"
          style={{ color: "var(--text)" }}
        />
      </label>
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col">
            {suggestions.map((g) => (
              <li key={g.displayName}>
                <button
                  type="button"
                  onClick={() => onPick(g.displayName)}
                  className="flex min-h-11 w-full items-center gap-2.5 rounded-lg px-2 text-left text-[15px] transition-colors hover:bg-[var(--surface-2)]"
                  style={{ color: "var(--text)" }}
                >
                  <GuardianDot name={g.displayName} />
                  <span className="min-w-0 flex-1 truncate">{g.displayName}</span>
                  <ArrowRight size={14} aria-hidden style={{ color: "var(--text-3)" }} />
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
