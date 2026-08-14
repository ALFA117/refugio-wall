"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionValueEvent,
  animate,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import Link from "next/link";
import { Flame, Crown, ArrowUpRight, Search, Languages } from "lucide-react";
import type { LeaderboardBundle, Guardian, Timeframe } from "@/lib/leaderboard";
import { DICTS, type Dict } from "@/lib/i18n";
import { useLang } from "./useLang";

// Deep-linkable profile URL for a guardian.
export const guardianHref = (name: string) => `/guardians/${encodeURIComponent(name)}`;

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const MEDAL = ["var(--gold)", "var(--silver)", "var(--bronze)"];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.06 } },
};
const rowItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
};
const podiumItem: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.9 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export function Wall({ bundle }: { bundle: LeaderboardBundle }) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const [tf, setTf] = useState<Timeframe>("all");
  const [q, setQ] = useState("");

  // Auto-refresh: when the data is real (KV), poll the active timeframe every 30s so
  // the Wall stays live without a reload. The layout animation handles any reordering.
  const [frames, setFrames] = useState(bundle.frames);
  useEffect(() => {
    if (bundle.source !== "live") return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/leaderboard?timeframe=${tf}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { entries: Guardian[] };
        setFrames((prev) => ({ ...prev, [tf]: data.entries }));
      } catch {
        /* keep last good data */
      }
    }, 30000);
    return () => clearInterval(id);
  }, [tf, bundle.source]);

  const d = DICTS[lang];
  const entries = frames[tf];
  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3, 10);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean) as Guardian[];
  const query = q.trim().toLowerCase();
  const anyMatch = query ? entries.some((e) => e.displayName.toLowerCase().includes(query)) : true;
  const leader = entries[0] ?? null;
  const empty = entries.length === 0;

  const anim = (v: Variants) =>
    reduce ? {} : ({ variants: v, initial: "hidden", animate: "show" } as const);

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-3xl px-5 pb-24 pt-14 sm:pt-20">
      <AmbientEmbers reduce={!!reduce} />
      {leader && <LeaderBar leader={leader} d={d} reduce={!!reduce} />}

      {/* Language toggle */}
      <div className="relative z-10 flex justify-end">
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono-num text-[12px] tracking-wide transition-colors hover:text-[var(--warm-white)]"
          style={{ borderColor: "var(--line-violet)", color: "var(--ash)" }}
          aria-label="Switch language"
        >
          <Languages size={13} style={{ color: "var(--violet)" }} />
          {d.langLabel}
        </button>
      </div>

      {/* Header */}
      <motion.header
        className="relative text-center"
        initial={reduce ? undefined : { opacity: 0, y: 18 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
      >
        <div className="eyebrow">{bundle.source === "live" ? d.eyebrowLive : d.eyebrowPreview}</div>
        <h1
          className="font-serif-display mx-auto mt-4 max-w-[16ch] text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl"
          style={{ textWrap: "balance" }}
        >
          {d.titlePre}{" "}
          <span style={{ color: "var(--ember)", fontStyle: "italic" }}>{d.titleEm}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px]" style={{ color: "var(--ash)" }}>
          {d.subtitle}
        </p>
      </motion.header>

      {/* Controls: filters + search */}
      <div className="relative z-10 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Filters d={d} tf={tf} setTf={setTf} reduce={!!reduce} />
        <SearchBox d={d} q={q} setQ={setQ} />
      </div>

      {empty ? (
        <EmptyState d={d} />
      ) : (
        <>
      {/* Podium */}
      <motion.section
        key={`podium-${tf}`}
        className="relative mt-8 grid grid-cols-3 items-end gap-3 sm:gap-4"
        {...anim(container)}
      >
        {podiumOrder.map((g) => {
          const rank = entries.indexOf(g);
          return (
            <PodiumCard
              key={g.displayName}
              guardian={g}
              rank={rank}
              reduce={!!reduce}
              d={d}
              match={!!query && g.displayName.toLowerCase().includes(query)}
            />
          );
        })}
      </motion.section>

      {/* The rest — reorders with layout animation on filter change */}
      <motion.ol className="relative z-10 mt-3 flex flex-col gap-2.5" layout={!reduce}>
        <AnimatePresence mode="popLayout" initial={false}>
          {rest.map((g) => {
            const rank = entries.indexOf(g);
            const match = !!query && g.displayName.toLowerCase().includes(query);
            return (
              <motion.li
                key={g.displayName}
                layout={!reduce}
                variants={reduce ? undefined : rowItem}
                initial={reduce ? undefined : { opacity: 0, y: 14 }}
                animate={reduce ? undefined : { opacity: query && !match ? 0.4 : 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                whileHover={reduce ? undefined : { y: -3 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className="rounded-xl border"
                style={{
                  borderColor: match ? "var(--line-violet)" : "var(--line)",
                  background: match
                    ? "linear-gradient(180deg, rgba(162,129,255,0.10), var(--ground-2))"
                    : "linear-gradient(180deg, var(--surface), var(--ground-2))",
                }}
              >
                <Link
                  href={guardianHref(g.displayName)}
                  className="flex items-center gap-4 px-4 py-3.5"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  <span className="font-mono-num w-7 shrink-0 text-center text-sm" style={{ color: "var(--ash-dim)" }}>
                    {rank + 1}
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
            );
          })}
        </AnimatePresence>
      </motion.ol>

      {query && !anyMatch && (
        <p className="relative z-10 mt-4 text-center text-[14px]" style={{ color: "var(--ash-dim)" }}>
          {d.noResults}
        </p>
      )}

      {/* Screen-reader table: the leaderboard as structured data (visuals alone aren't
          screen-reader friendly — WCAG). Hidden visually, announced to assistive tech. */}
      <table className="sr-only">
        <caption>{`${d.titlePre} ${d.titleEm} — ${d.filters[tf]}`}</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">{d.titleEm}</th>
            <th scope="col">{d.brasas}</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((g, i) => (
            <tr key={g.displayName}>
              <td>{i + 1}</td>
              <td>{g.displayName}</td>
              <td>{g.brasas}</td>
            </tr>
          ))}
        </tbody>
      </table>
        </>
      )}

      <HowItWorks d={d} reduce={!!reduce} />

      {/* Footer */}
      <motion.footer
        className="relative z-10 mt-16 flex flex-col items-center gap-5 text-center"
        initial={reduce ? undefined : { opacity: 0 }}
        whileInView={reduce ? undefined : { opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <p className="max-w-sm text-[13px]" style={{ color: "var(--ash-dim)" }}>
          {bundle.source === "live" ? d.footerLive : d.footerPreview}
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          <FooterLink href="#" label={d.cta.scene} />
          <FooterLink href="#" label={d.cta.demo} />
          <FooterLink href="https://github.com/ALFA117/Refugio" label={d.cta.github} external />
        </div>
        <div className="mt-2 font-mono-num text-[11px] tracking-widest" style={{ color: "var(--ash-dim)" }}>
          REFUGIO · 🔥 · BUILT ON DECENTRALAND
        </div>
      </motion.footer>
    </main>
  );
}

/* --------------------------------------------------- Sticky leader + empty */

// When the podium scrolls out of view, a slim bar keeps the current #1 in sight.
function LeaderBar({ leader, d, reduce }: { leader: Guardian; d: Dict; reduce: boolean }) {
  const { scrollY } = useScroll();
  const [shown, setShown] = useState(false);
  useMotionValueEvent(scrollY, "change", (v) => setShown(v > 360));
  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { y: -60, opacity: 0 }}
          animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: -60, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="fixed inset-x-0 top-0 z-40"
        >
          <div className="mx-auto max-w-3xl px-5 pt-3">
            <Link
              href={guardianHref(leader.displayName)}
              className="flex items-center gap-3 rounded-full border px-4 py-2.5 backdrop-blur"
              style={{
                borderColor: "var(--line-violet)",
                background: "linear-gradient(90deg, rgba(25,17,40,0.92), rgba(20,14,32,0.92))",
                color: "inherit",
                textDecoration: "none",
                boxShadow: "0 12px 40px -20px rgba(0,0,0,0.8)",
              }}
            >
              <Crown size={16} strokeWidth={1.7} style={{ color: "var(--gold)" }} />
              <span className="font-mono-num text-[11px] uppercase tracking-widest" style={{ color: "var(--violet)" }}>
                {d.leading}
              </span>
              <span className="min-w-0 flex-1 truncate text-[14px]" style={{ color: "var(--warm-white)" }}>
                {leader.displayName}
              </span>
              <span className="flex items-center gap-1.5" style={{ color: "var(--spark)" }}>
                <Flame size={14} strokeWidth={1.8} />
                <span className="font-mono-num text-[13px] font-medium">{leader.brasas.toLocaleString()}</span>
              </span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Shown when there are no guardians yet (e.g. KV is live but the scene hasn't pushed a round).
function EmptyState({ d }: { d: Dict }) {
  return (
    <div className="relative z-10 mt-20 flex flex-col items-center text-center">
      <div
        className="rounded-full"
        style={{
          width: 56,
          height: 56,
          background: "radial-gradient(circle at 35% 30%, rgba(255,214,107,0.5), rgba(255,122,45,0.22) 72%)",
          border: "1px solid var(--line)",
        }}
      />
      <p className="mt-5 max-w-xs text-[15px]" style={{ color: "var(--ash)" }}>
        {d.emptyState}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Controls */

function Filters({
  d,
  tf,
  setTf,
  reduce,
}: {
  d: Dict;
  tf: Timeframe;
  setTf: (t: Timeframe) => void;
  reduce: boolean;
}) {
  const opts: { key: Timeframe; label: string }[] = [
    { key: "all", label: d.filters.all },
    { key: "week", label: d.filters.week },
    { key: "today", label: d.filters.today },
  ];
  return (
    <div
      className="inline-flex rounded-full border p-1"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
      role="tablist"
    >
      {opts.map((o) => {
        const active = tf === o.key;
        return (
          <button
            key={o.key}
            role="tab"
            aria-selected={active}
            onClick={() => setTf(o.key)}
            className="relative rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors"
            style={{ color: active ? "#1a0d04" : "var(--ash)" }}
          >
            {active && (
              <motion.span
                layoutId={reduce ? undefined : "filter-pill"}
                className="absolute inset-0 rounded-full"
                style={{ background: "linear-gradient(90deg, var(--ember), var(--amber))" }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function SearchBox({ d, q, setQ }: { d: Dict; q: string; setQ: (s: string) => void }) {
  return (
    <label
      className="inline-flex items-center gap-2 rounded-full border px-3.5 py-2"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <Search size={15} style={{ color: "var(--ash-dim)" }} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={d.searchPlaceholder}
        className="w-40 bg-transparent text-[14px] outline-none placeholder:text-[var(--ash-dim)]"
        style={{ color: "var(--warm-white)" }}
        aria-label={d.searchPlaceholder}
      />
    </label>
  );
}

/* ------------------------------------------------------------------ Podium */

function PodiumCard({
  guardian,
  rank,
  reduce,
  d,
  match,
}: {
  guardian: Guardian;
  rank: number;
  reduce: boolean;
  d: Dict;
  match: boolean;
}) {
  const isFirst = rank === 0;
  return (
    <motion.div
      variants={reduce ? undefined : podiumItem}
      whileHover={reduce ? undefined : { y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      className="flex flex-col items-center rounded-2xl border px-2 pb-4"
      style={{
        borderColor: match ? "var(--line-violet)" : isFirst ? "var(--line-strong)" : "var(--line)",
        background: isFirst
          ? "linear-gradient(180deg, rgba(255,122,45,0.12), var(--surface))"
          : "linear-gradient(180deg, var(--surface), var(--ground-2))",
        paddingTop: isFirst ? 20 : 34,
        marginBottom: isFirst ? 10 : 0,
        boxShadow: isFirst ? "0 26px 60px -32px rgba(255,122,45,0.75)" : "none",
      }}
    >
      <Link
        href={guardianHref(guardian.displayName)}
        className="flex w-full flex-col items-center"
        style={{ color: "inherit", textDecoration: "none" }}
      >
      {isFirst && (
        <motion.div
          animate={reduce ? undefined : { y: [0, -3, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-1.5"
        >
          <Crown size={20} strokeWidth={1.6} style={{ color: "var(--gold)" }} />
        </motion.div>
      )}
      <div className="relative">
        <GuardianDot big={isFirst} />
        <span
          className="font-mono-num absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[11px]"
          style={{ background: "var(--ground)", color: MEDAL[rank], border: `1px solid ${MEDAL[rank]}` }}
        >
          {rank + 1}
        </span>
      </div>
      <span
        className="mt-3 max-w-full truncate px-1 text-center text-[13px] sm:text-[14px]"
        style={{ color: "var(--warm-white)" }}
        title={guardian.displayName}
      >
        {guardian.displayName}
      </span>
      <div className="mt-1.5">
        <Brasas value={guardian.brasas} reduce={reduce} accent={isFirst} />
      </div>
      <div className="mt-2">
        <Badge brasas={guardian.brasas} d={d} />
      </div>
      </Link>
    </motion.div>
  );
}

/* ------------------------------------------------------------- How it works */

function HowItWorks({ d, reduce }: { d: Dict; reduce: boolean }) {
  return (
    <section className="relative z-10 mt-20">
      <div className="mb-6 text-center">
        <div className="eyebrow">{d.howEyebrow}</div>
        <h2 className="font-serif-display mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          {d.howTitle}
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {d.systems.map((s, i) => (
          <motion.div
            key={s.name}
            className="card flex items-start gap-3 p-4"
            initial={reduce ? undefined : { opacity: 0, y: 16 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, ease: EASE_OUT, delay: Math.min(i * 0.05, 0.3) }}
          >
            <span className="font-mono-num mt-0.5 text-[13px]" style={{ color: "var(--ember)" }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-[15px] font-semibold" style={{ color: "var(--warm-white)" }}>
                {s.name}
              </h3>
              <p className="mt-1 text-[13.5px]" style={{ color: "var(--ash)" }}>
                {s.blurb}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Primitives */

function GuardianDot({ big = false }: { big?: boolean }) {
  const s = big ? 40 : 22;
  return (
    <span
      aria-hidden
      className="inline-block shrink-0 rounded-full"
      style={{
        width: s,
        height: s,
        background: "radial-gradient(circle at 35% 30%, var(--spark), var(--ember) 72%)",
        boxShadow: "0 0 14px rgba(255,150,60,0.5)",
      }}
    />
  );
}

function Badge({ brasas, d }: { brasas: number; d: Dict }) {
  const b =
    brasas >= 1000
      ? { label: d.badges.firekeeper, color: "var(--gold)" }
      : brasas >= 500
      ? { label: d.badges.ember, color: "var(--ember)" }
      : brasas >= 100
      ? { label: d.badges.kindling, color: "var(--violet)" }
      : null;
  if (!b) return null;
  return (
    <span
      className="font-mono-num shrink-0 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider"
      style={{ color: b.color, border: `1px solid ${b.color}`, opacity: 0.85 }}
    >
      {b.label}
    </span>
  );
}

function Brasas({ value, reduce, accent = false }: { value: number; reduce: boolean; accent?: boolean }) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      return;
    }
    const controls = animate(mv, value, {
      duration: 1.1,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduce, mv]);
  return (
    <span className="flex items-center gap-1.5" style={{ color: accent ? "var(--spark)" : "var(--amber)" }}>
      <Flame size={accent ? 16 : 14} strokeWidth={1.8} />
      <span className="font-mono-num text-[14px] font-medium">{display.toLocaleString()}</span>
    </span>
  );
}

function FooterLink({ href, label, external = false }: { href: string; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="group inline-flex items-center gap-1.5 rounded-lg border px-4 py-2.5 font-mono-num text-[13px] transition-colors hover:border-[var(--amber)]"
      style={{ borderColor: "var(--line-strong)", color: "var(--warm-white)" }}
    >
      {label}
      <ArrowUpRight
        size={14}
        className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        style={{ color: "var(--amber)" }}
      />
    </a>
  );
}

/* ---------------------------------------------------- Ambient ember canvas */

function AmbientEmbers({ reduce }: { reduce: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 140]);

  useEffect(() => {
    if (reduce) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    const parts: { x: number; y: number; vy: number; life: number; size: number; hue: number; ph: number }[] = [];

    const size = () => {
      canvas.width = window.innerWidth * DPR;
      canvas.height = window.innerHeight * DPR;
    };
    size();
    window.addEventListener("resize", size);

    const frame = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      if (Math.random() < 0.5)
        parts.push({ x: Math.random() * w, y: h + 10, vy: -(0.25 + Math.random() * 0.7), life: 1, size: 0.6 + Math.random() * 1.7, hue: 20 + Math.random() * 26, ph: Math.random() * 6.28 });
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.y += p.vy * DPR;
        p.x += Math.sin(p.y * 0.01 + p.ph) * 0.5;
        p.life -= 0.0035;
        if (p.life <= 0 || p.y < -20) { parts.splice(i, 1); continue; }
        ctx.globalAlpha = Math.max(0, p.life * 0.5);
        ctx.fillStyle = `hsl(${p.hue},100%,62%)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * DPR, 0, 6.28);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (parts.length > 180) parts.splice(0, parts.length - 180);
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [reduce]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ y: reduce ? 0 : y }}
    >
      <canvas ref={canvasRef} className="h-full w-full opacity-70" />
    </motion.div>
  );
}
