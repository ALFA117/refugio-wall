"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, ArrowLeft, Share2, Crown, Languages, Check } from "lucide-react";
import type { Guardian, Source } from "@/lib/leaderboard";
import { DICTS } from "@/lib/i18n";
import { useLang } from "./useLang";
import { TickerNumber } from "./TickerNumber";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export function GuardianProfile({
  guardian,
  name,
  rank,
  total,
}: {
  guardian: Guardian | null;
  name: string;
  rank: number; // 0-based, -1 if not found
  total: number;
  source: Source;
}) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const d = DICTS[lang];
  const isFirst = rank === 0;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1.5 text-[13px] transition-colors hover:text-[var(--warm-white)]"
          style={{ color: "var(--ash)" }}
        >
          <ArrowLeft size={15} style={{ color: "var(--violet)" }} />
          {d.profile.back}
        </Link>
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 font-mono-num text-[12px] tracking-wide transition-colors hover:text-[var(--warm-white)]"
          style={{ borderColor: "var(--line-violet)", color: "var(--ash)" }}
          aria-label="Switch language"
        >
          <Languages size={13} style={{ color: "var(--violet)" }} />
          {d.langLabel}
        </button>
      </div>

      {guardian ? (
        <motion.section
          className="relative z-10 mt-16 flex flex-col items-center text-center"
          initial={reduce ? undefined : { opacity: 0, y: 20 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT }}
        >
          {isFirst && (
            <motion.div
              animate={reduce ? undefined : { y: [0, -4, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="mb-2"
            >
              <Crown size={26} strokeWidth={1.6} style={{ color: "var(--gold)" }} />
            </motion.div>
          )}
          <motion.div
            initial={reduce ? undefined : { scale: 0.7 }}
            animate={reduce ? undefined : { scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.05 }}
            className="rounded-full"
            style={{
              width: 84,
              height: 84,
              background: "radial-gradient(circle at 35% 30%, var(--spark), var(--ember) 72%)",
              boxShadow: "0 0 40px rgba(255,150,60,0.6)",
            }}
          />
          <h1
            className="font-serif-display mt-5 max-w-full truncate px-2 text-3xl font-semibold tracking-tight sm:text-4xl"
            style={{ color: "var(--warm-white)" }}
            title={guardian.displayName}
          >
            {guardian.displayName}
          </h1>

          <div className="mt-2 font-mono-num text-[13px] tracking-wide" style={{ color: "var(--violet)" }}>
            {d.profile.rank} #{rank + 1} {d.profile.of} {total}
          </div>

          <div className="mt-8 flex items-end gap-2" style={{ color: "var(--spark)" }}>
            <Flame size={30} strokeWidth={1.8} className="mb-1.5" />
            <TickerNumber
              value={guardian.brasas}
              reduce={!!reduce}
              className="font-mono-num text-5xl font-semibold leading-none sm:text-6xl"
            />
            <span className="mb-2 text-[15px]" style={{ color: "var(--ash)" }}>
              {d.brasas}
            </span>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Badge brasas={guardian.brasas} label={badgeLabel(guardian.brasas, d)} />
            {typeof guardian.gamesPlayed === "number" && (
              <span className="font-mono-num text-[13px]" style={{ color: "var(--ash)" }}>
                {guardian.gamesPlayed} {d.profile.roundsPlayed}
              </span>
            )}
          </div>

          <ShareButton d={d} />
        </motion.section>
      ) : (
        <section className="relative z-10 mt-24 flex flex-col items-center text-center">
          <div
            className="rounded-full"
            style={{ width: 64, height: 64, background: "var(--surface-2)", border: "1px solid var(--line)" }}
          />
          <h1 className="font-serif-display mt-6 text-2xl font-semibold" style={{ color: "var(--warm-white)" }}>
            {d.profile.notFound}
          </h1>
          <p className="mt-2 max-w-xs text-[14px]" style={{ color: "var(--ash)" }}>
            “{name}” — {d.profile.notFoundBody}
          </p>
        </section>
      )}

      <div className="relative z-10 mt-auto pt-16 text-center font-mono-num text-[11px] tracking-widest" style={{ color: "var(--ash-dim)" }}>
        REFUGIO · 🔥 · BUILT ON DECENTRALAND
      </div>
    </main>
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
    <button
      onClick={share}
      className="mt-10 inline-flex min-h-11 items-center gap-2 rounded-lg border px-5 text-[14px] font-medium transition-colors hover:border-[var(--amber)]"
      style={{ borderColor: "var(--line-strong)", color: "var(--warm-white)" }}
    >
      {copied ? <Check size={15} style={{ color: "var(--gold)" }} /> : <Share2 size={15} style={{ color: "var(--amber)" }} />}
      {copied ? d.profile.copied : d.profile.share}
    </button>
  );
}

function badgeLabel(brasas: number, d: (typeof DICTS)["en"]): { label: string; color: string } | null {
  if (brasas >= 1000) return { label: d.badges.firekeeper, color: "var(--gold)" };
  if (brasas >= 500) return { label: d.badges.ember, color: "var(--ember)" };
  if (brasas >= 100) return { label: d.badges.kindling, color: "var(--violet)" };
  return null;
}

function Badge({ label }: { brasas: number; label: { label: string; color: string } | null }) {
  if (!label) return null;
  return (
    <span
      className="font-mono-num rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wider"
      style={{ color: label.color, border: `1px solid ${label.color}`, opacity: 0.9 }}
    >
      {label.label}
    </span>
  );
}
