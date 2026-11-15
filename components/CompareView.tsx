"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Flame, Crown, Search, X } from "lucide-react";
import type { Guardian } from "@/lib/leaderboard";
import { DICTS } from "@/lib/i18n";
import { badgeForBrasas } from "@/lib/badges";
import { EASE_OUT, TAP_PRESS, SNAPPY } from "@/lib/motion";
import { useLang } from "./useLang";
import { SiteHeader } from "./SiteHeader";
import { AmbientEmbers, GuardianDot, Badge, guardianHref } from "./Wall";
import { TickerNumber } from "./TickerNumber";

export function CompareView({
  entries,
  a,
  b,
  rankA,
  rankB,
}: {
  entries: Guardian[];
  a: Guardian | null;
  b: Guardian | null;
  rankA: number;
  rankB: number;
}) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const d = DICTS[lang];
  const router = useRouter();

  function setSide(side: "a" | "b", name: string) {
    const params = new URLSearchParams();
    if (side === "a") {
      params.set("a", name);
      if (b) params.set("b", b.displayName);
    } else {
      if (a) params.set("a", a.displayName);
      params.set("b", name);
    }
    router.push(`/compare?${params.toString()}`);
  }

  return (
    <>
    <SiteHeader lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} reduce={!!reduce} />
    <main id="main" className="relative mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <AmbientEmbers reduce={!!reduce} />

      <header className="relative z-10">
        <div className="eyebrow">{d.comparePage.eyebrow}</div>
        <h1 className="font-serif-display mt-3 text-[36px] font-medium leading-tight sm:text-[44px]">
          {d.comparePage.title}
        </h1>
      </header>

      <div className="relative z-10 mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Slot guardian={a} rank={rankA} exclude={b?.displayName} entries={entries} onPick={(n) => setSide("a", n)} d={d} reduce={!!reduce} />
        <Slot guardian={b} rank={rankB} exclude={a?.displayName} entries={entries} onPick={(n) => setSide("b", n)} d={d} reduce={!!reduce} />
      </div>

      {a && b && (
        <motion.div
          className="relative z-10 mt-6 text-center"
          initial={reduce ? undefined : { opacity: 0, y: 10 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <p className="text-[14px]" style={{ color: "var(--ash-dim)" }}>
            {a.brasas === b.brasas
              ? d.comparePage.tied
              : d.comparePage.ahead
                  .replace("{name}", a.brasas > b.brasas ? a.displayName : b.displayName)
                  .replace("{n}", String(Math.abs(a.brasas - b.brasas)))}
          </p>
        </motion.div>
      )}
    </main>
    </>
  );
}

function Slot({
  guardian,
  rank,
  exclude,
  entries,
  onPick,
  d,
  reduce,
}: {
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
    const badge = badgeForBrasas(guardian.brasas, d);
    return (
      <motion.div
        className="card relative flex flex-col items-center p-5 text-center"
        initial={reduce ? undefined : { opacity: 0, scale: 0.96 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      >
        <button
          type="button"
          onClick={() => onPick("")}
          aria-label={d.comparePage.clear}
          className="absolute right-1 top-1 inline-flex h-11 w-11 items-center justify-center rounded-full transition-colors hover:text-[var(--warm-white)]"
          style={{ color: "var(--ash-dim)" }}
        >
          <X size={14} />
        </button>
        {rank === 0 && <Crown size={18} style={{ color: "var(--gold)" }} className="mb-1" />}
        <GuardianDot big name={guardian.displayName} />
        <Link
          href={guardianHref(guardian.displayName)}
          className="font-serif-display mt-3 max-w-full truncate px-2 text-[22px] font-medium transition-colors hover:text-[var(--spark)]"
          style={{ color: "var(--warm-white)" }}
        >
          {guardian.displayName}
        </Link>
        {rank >= 0 && (
          <div className="mt-1 font-mono-num text-[13px]" style={{ color: "var(--text-3)" }}>
            #{rank + 1}
          </div>
        )}
        <div className="mt-3 flex items-center gap-1.5" style={{ color: "var(--text)" }}>
          <Flame size={16} />
          <TickerNumber value={guardian.brasas} reduce={reduce} className="font-mono-num text-[28px] font-medium" />
        </div>
        {badge && (
          <span className="mt-2">
            <Badge brasas={guardian.brasas} d={d} />
          </span>
        )}
        {typeof guardian.gamesPlayed === "number" && (
          <div className="mt-2 text-[12px]" style={{ color: "var(--ash-dim)" }}>
            {guardian.gamesPlayed} {d.rounds}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <div className="card relative flex flex-col items-center gap-2 p-5">
      <Search size={16} style={{ color: "var(--ash-dim)" }} />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={d.comparePage.pickPlaceholder}
        className="min-h-11 w-full rounded-[10px] border bg-transparent px-3 text-center text-[16px] outline-none focus:border-[var(--line-ember)]"
        style={{ borderColor: "var(--line)", color: "var(--warm-white)" }}
      />
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-1 flex w-full flex-col gap-1"
          >
            {suggestions.map((g) => (
              <motion.li key={g.displayName} whileTap={TAP_PRESS} transition={SNAPPY}>
                <button
                  type="button"
                  onClick={() => onPick(g.displayName)}
                  className="min-h-11 w-full truncate rounded-lg px-3 py-2 text-left text-[15px] transition-colors hover:bg-[var(--surface-2)]"
                  style={{ color: "var(--warm-white)" }}
                >
                  {g.displayName}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
