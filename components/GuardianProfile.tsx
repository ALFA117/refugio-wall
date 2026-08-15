"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, ArrowLeft, Share2, Crown, Check, Swords } from "lucide-react";
import type { Guardian, Source } from "@/lib/leaderboard";
import { DICTS } from "@/lib/i18n";
import { badgeForBrasas } from "@/lib/badges";
import { EASE_OUT, TAP_PRESS, SNAPPY } from "@/lib/motion";
import { useLang } from "./useLang";
import { TickerNumber } from "./TickerNumber";
import { LangToggle } from "./LangToggle";
import { Sparkline } from "./Sparkline";

export function GuardianProfile({
  guardian,
  name,
  rank,
  total,
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
  const isFirst = rank === 0;
  // "Ahead of X%" — only meaningful once there's more than one guardian to compare against.
  const percentile = guardian && rank >= 0 && total > 1 ? Math.round(((total - rank - 1) / (total - 1)) * 100) : null;

  return (
    <main className="relative mx-auto flex min-h-dvh w-full max-w-lg flex-col px-5 py-8">
      {guardian && (
        // Full-bleed glow behind the header — breaks out of the max-w-lg column so the profile
        // has a real light source instead of the avatar floating on flat black, same idea as
        // the Wall's hero card but as an edge-to-edge band rather than a bordered surface.
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-screen -translate-x-1/2"
          style={{
            background: "radial-gradient(60% 55% at 50% 0%, rgba(255,150,60,0.16), rgba(255,150,60,0) 70%)",
          }}
        />
      )}
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
        <LangToggle lang={lang} onClick={() => setLang(lang === "en" ? "es" : "en")} reduce={!!reduce} />
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
          {percentile !== null && percentile > 0 && (
            <div className="mt-1 text-[12.5px]" style={{ color: "var(--ash-dim)" }}>
              {d.profile.aheadOfPct.replace("{pct}", String(percentile))}
            </div>
          )}

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
            <Badge label={badgeForBrasas(guardian.brasas, d)} />
            {typeof guardian.gamesPlayed === "number" && (
              <span className="font-mono-num text-[13px]" style={{ color: "var(--ash)" }}>
                {guardian.gamesPlayed} {d.profile.roundsPlayed}
              </span>
            )}
          </div>

          {trend && trend.length >= 2 && (
            <div className="mt-5 flex flex-col items-center gap-1.5">
              <Sparkline values={trend} />
              <span className="text-[11px]" style={{ color: "var(--ash-dim)" }}>
                {d.profile.trend}
              </span>
            </div>
          )}

          <div className="mt-10 flex items-center gap-3">
            <ShareButton d={d} />
            <Link
              href={`/compare?a=${encodeURIComponent(guardian.displayName)}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-5 text-[14px] font-medium transition-colors hover:border-[var(--amber)]"
              style={{ borderColor: "var(--line-strong)", color: "var(--warm-white)" }}
            >
              <Swords size={15} style={{ color: "var(--amber)" }} />
              {d.comparePage.compare}
            </Link>
          </div>
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
          {suggestion && (
            <p className="mt-4 text-[14px]" style={{ color: "var(--ash-dim)" }}>
              {d.profile.didYouMean}{" "}
              <Link href={`/guardians/${encodeURIComponent(suggestion)}`} className="font-medium transition-colors hover:text-[var(--spark)]" style={{ color: "var(--amber)" }}>
                {suggestion}
              </Link>
              ?
            </p>
          )}
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
    <motion.button
      onClick={share}
      whileTap={TAP_PRESS}
      transition={SNAPPY}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-5 text-[14px] font-medium transition-colors hover:border-[var(--amber)]"
      style={{ borderColor: "var(--line-strong)", color: "var(--warm-white)" }}
    >
      {copied ? <Check size={15} style={{ color: "var(--gold)" }} /> : <Share2 size={15} style={{ color: "var(--amber)" }} />}
      {copied ? d.profile.copied : d.profile.share}
    </motion.button>
  );
}

function Badge({ label }: { label: { label: string; color: string } | null }) {
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
