"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { Guardian, Source } from "@/lib/leaderboard";
import { DICTS } from "@/lib/i18n";
import { TAP_PRESS, SNAPPY } from "@/lib/motion";
import { useLang } from "./useLang";
import { LangToggle } from "./LangToggle";
import { AmbientEmbers, GuardianDot, Badge, Brasas, guardianHref } from "./Wall";

const PAGE_SIZE = 20;

// Wall.tsx only ever renders the top 10 (podium + rest slice) — anyone ranked below that was
// invisible on the site even though the data existed. This page is the full roster, with a
// "load more" step instead of dumping a potentially long list all at once.
export function GuardiansList({ entries, source }: { entries: Guardian[]; source: Source }) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const d = DICTS[lang];
  const [visible, setVisible] = useState(PAGE_SIZE);
  const shown = entries.slice(0, visible);
  const remaining = entries.length - visible;

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
          {d.guardiansPage.back}
        </Link>
        <LangToggle lang={lang} onClick={() => setLang(lang === "en" ? "es" : "en")} reduce={!!reduce} />
      </div>

      <header className="relative z-10 mt-8 text-center">
        <div className="eyebrow">{d.guardiansPage.eyebrow}</div>
        <h1 className="font-serif-display mx-auto mt-3 max-w-[16ch] text-3xl font-semibold tracking-tight sm:text-4xl">
          {d.guardiansPage.title}
        </h1>
        <p className="mt-2 text-[14px]" style={{ color: "var(--ash-dim)" }}>
          {d.guardiansPage.subtitle.replace("{n}", String(entries.length))}
          {source === "sample" ? ` · ${d.footerPreview}` : ""}
        </p>
      </header>

      <ol className="relative z-10 mt-8 flex flex-col gap-2">
        {shown.map((g, i) => (
          <motion.li
            key={g.displayName}
            initial={reduce ? undefined : { opacity: 0, y: 10 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut", delay: Math.min(i * 0.015, 0.3) }}
          >
            <Link
              href={guardianHref(g.displayName)}
              className="flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors hover:border-[var(--line-violet)]"
              style={{
                borderColor: "var(--line)",
                background: "linear-gradient(180deg, var(--surface), var(--ground-2))",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <span className="font-mono-num w-8 shrink-0 text-center text-sm" style={{ color: "var(--ash-dim)" }}>
                {i + 1}
              </span>
              <GuardianDot />
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="truncate text-[15px]" style={{ color: "var(--warm-white)" }}>
                  {g.displayName}
                </span>
                <Badge brasas={g.brasas} d={d} />
              </span>
              <Brasas value={g.brasas} reduce={!!reduce} />
            </Link>
          </motion.li>
        ))}
      </ol>

      {remaining > 0 && (
        <div className="relative z-10 mt-6 flex justify-center">
          <motion.button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            whileTap={TAP_PRESS}
            transition={SNAPPY}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border px-6 text-[13px] font-medium transition-colors hover:border-[var(--amber)]"
            style={{ borderColor: "var(--line-strong)", color: "var(--warm-white)" }}
          >
            {d.guardiansPage.loadMore} · {remaining}
          </motion.button>
        </div>
      )}
    </main>
  );
}
