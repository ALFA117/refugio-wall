"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { Guardian, Source } from "@/lib/leaderboard";
import { DICTS } from "@/lib/i18n";
import { TAP_PRESS, SNAPPY } from "@/lib/motion";
import { useLang } from "./useLang";
import { SiteHeader } from "./SiteHeader";
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
    <>
    <SiteHeader lang={lang} onToggleLang={() => setLang(lang === "en" ? "es" : "en")} reduce={!!reduce} />
    <main id="main" className="relative mx-auto w-full max-w-3xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <AmbientEmbers reduce={!!reduce} />

      <header className="relative z-10">
        <div className="eyebrow">{d.guardiansPage.eyebrow}</div>
        <h1 className="font-serif-display mt-3 text-[36px] font-medium leading-tight sm:text-[44px]">
          {d.guardiansPage.title}
        </h1>
        <p className="mt-3 max-w-xl text-[16px]" style={{ color: "var(--text-2)" }}>
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
              className="flex items-center gap-4 rounded-xl border px-4 py-3 transition-colors hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]"
              style={{
                borderColor: "var(--line)",
                background: "var(--surface)",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <span className="font-mono-num w-8 shrink-0 text-center text-sm" style={{ color: "var(--ash-dim)" }}>
                {i + 1}
              </span>
              <GuardianDot name={g.displayName} />
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
    </>
  );
}
