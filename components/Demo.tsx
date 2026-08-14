"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, Flame, Languages } from "lucide-react";
import { DICTS } from "@/lib/i18n";
import { useLang } from "./useLang";
import { AmbientEmbers } from "./Wall";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const WOOD_TTL_MS = 2200;
const FEED_GAIN = 12;
const MISS_PENALTY = 8;
const DECAY_PER_TICK = 1; // health points lost per 2s tick, halved per guardian present

type Wood = { id: number; slot: number; bornAt: number };

// A pure-web, no-install taste of the real mechanic: the fire grows with "guardians" you add,
// and a lightweight feed-the-fire loop mirrors the in-scene mini-game closely enough to give
// a client the feel of it in under a minute. Not the real multiplayer game — says so, honestly.
export function Demo() {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const d = DICTS[lang].demo;

  const [guardians, setGuardians] = useState(1);
  const [health, setHealth] = useState(70);
  const [wood, setWood] = useState<Wood | null>(null);
  const [toast, setToast] = useState<{ text: string; good: boolean } | null>(null);
  const nextId = useRef(1);
  const woodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Holds the latest resolveWood so the timeout scheduled inside the interval below never
  // closes over a stale one (e.g. a missed-wood toast rendering in a language the user
  // already switched away from).
  const resolveWoodRef = useRef<(id: number, fed: boolean) => void>(() => {});

  const intensity = Math.min(1.5, 0.3 + guardians * 0.08);

  // Spawn wood on an interval that gets a little friendlier with more guardians present —
  // mirrors the real game's "more people, easier to keep alive" dynamic.
  useEffect(() => {
    const spawn = () => {
      setWood((current) => {
        if (current) return current; // one at a time
        const slot = Math.floor(Math.random() * 5);
        const id = nextId.current++;
        woodTimer.current = setTimeout(() => resolveWoodRef.current(id, false), WOOD_TTL_MS);
        return { id, slot, bornAt: Date.now() };
      });
    };
    const delay = Math.max(1400, 2600 - guardians * 120);
    const id = setInterval(spawn, delay);
    return () => clearInterval(id);
  }, [guardians]);

  // Gentle passive decay — softer the more guardians are around.
  useEffect(() => {
    const id = setInterval(() => {
      setHealth((h) => Math.max(0, Math.min(100, h - DECAY_PER_TICK / Math.max(1, guardians * 0.5))));
    }, 2000);
    return () => clearInterval(id);
  }, [guardians]);

  function resolveWood(id: number, fed: boolean) {
    setWood((current) => (current && current.id === id ? null : current));
    if (woodTimer.current) clearTimeout(woodTimer.current);
    setHealth((h) => Math.max(0, Math.min(100, h + (fed ? FEED_GAIN : -MISS_PENALTY))));
    setToast({ text: fed ? d.fedToast : d.missedToast, good: fed });
    setTimeout(() => setToast(null), 900);
  }
  resolveWoodRef.current = resolveWood;

  const healthColor = health >= 60 ? "#4fbf6a" : health >= 30 ? "var(--amber)" : "#e8483f";

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-lg px-5 pb-20 pt-8">
      <AmbientEmbers reduce={!!reduce} />

      <div className="relative z-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-1.5 text-[13px] transition-colors hover:text-[var(--warm-white)]"
          style={{ color: "var(--ash)" }}
        >
          <ArrowLeft size={15} style={{ color: "var(--violet)" }} />
          {d.backToWall}
        </Link>
        <button
          onClick={() => setLang(lang === "en" ? "es" : "en")}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3.5 font-mono-num text-[12px] tracking-wide transition-colors hover:text-[var(--warm-white)]"
          style={{ borderColor: "var(--line-violet)", color: "var(--ash)" }}
          aria-label="Switch language"
        >
          <Languages size={13} style={{ color: "var(--violet)" }} />
          {DICTS[lang].langLabel}
        </button>
      </div>

      <motion.div
        className="relative z-10 mt-6 text-center"
        initial={reduce ? undefined : { opacity: 0, y: 16 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <div className="eyebrow">{d.eyebrow}</div>
        <h1 className="font-serif-display mx-auto mt-3 max-w-[16ch] text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl">
          {d.title} <span style={{ color: "var(--ember)", fontStyle: "italic" }}>{d.titleEm}</span>
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-[14.5px]" style={{ color: "var(--ash)" }}>
          {d.subtitle}
        </p>
      </motion.div>

      {/* The interactive card */}
      <div
        className="relative z-10 mt-7 overflow-hidden rounded-2xl border"
        style={{
          borderColor: "var(--line-strong)",
          background: "linear-gradient(180deg, var(--ground-2), #060410)",
          boxShadow: "0 30px 80px -40px rgba(255,122,45,0.35)",
        }}
      >
        {/* Canvas + its overlays share this box, so bottom/top offsets below measure against
            the canvas itself — not the whole card (which also holds the controls further down). */}
        <div className="relative">
        <FireCanvas guardians={guardians} health={health} reduce={!!reduce} />

        {/* Wood feed zone, overlaid on the lower part of the fire canvas */}
        <div className="pointer-events-none absolute inset-x-0 bottom-[54px] flex justify-center gap-6 sm:bottom-[64px] sm:gap-10">
          {Array.from({ length: 5 }).map((_, slot) => (
            <div key={slot} className="pointer-events-auto flex h-12 w-12 items-center justify-center">
              <AnimatePresence>
                {wood?.slot === slot && (
                  <motion.button
                    type="button"
                    onClick={() => resolveWood(wood.id, true)}
                    aria-label={d.feedPrompt}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 22 }}
                    className="relative flex h-11 w-11 items-center justify-center rounded-full"
                    style={{
                      background: "radial-gradient(circle at 35% 30%, #d9a066, #6b3f1e 75%)",
                      boxShadow: "0 0 18px rgba(255,150,60,0.55)",
                    }}
                  >
                    {!reduce && (
                      <motion.span
                        className="absolute inset-[-3px] rounded-full"
                        style={{ border: "2px solid var(--spark)" }}
                        initial={{ opacity: 0.9, scale: 1 }}
                        animate={{ opacity: 0, scale: 1.35 }}
                        transition={{ duration: WOOD_TTL_MS / 1000, ease: "linear" }}
                      />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Toast */}
        <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
          <AnimatePresence>
            {toast && (
              <motion.span
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="font-mono-num rounded-full px-3 py-1 text-[12px]"
                style={{
                  color: toast.good ? "var(--spark)" : "#ff9a8a",
                  background: "rgba(10,7,16,0.7)",
                  border: `1px solid ${toast.good ? "var(--line-strong)" : "rgba(255,100,80,0.4)"}`,
                }}
              >
                {toast.text}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        </div>

        {/* Controls + readouts */}
        <div className="relative z-10 border-t px-5 py-4" style={{ borderColor: "var(--line)" }}>
          <div className="flex items-center justify-between">
            <span className="font-mono-num text-[11px] uppercase tracking-widest" style={{ color: "var(--violet)" }}>
              {d.intensityLabel}
            </span>
            <span className="font-mono-num text-[13px]" style={{ color: "var(--amber)" }}>
              {intensity.toFixed(2)}×
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono-num text-[11px] uppercase tracking-widest" style={{ color: "var(--violet)" }}>
              {d.fireHealth}
            </span>
            <span className="font-mono-num text-[13px]" style={{ color: healthColor }}>
              {Math.round(health)}%
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: healthColor }}
              animate={{ width: `${health}%` }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            />
          </div>

          <div className="mt-4 flex items-center gap-1.5">
            {Array.from({ length: guardians }).map((_, i) => (
              <motion.span
                key={i}
                initial={reduce ? undefined : { scale: 0, opacity: 0 }}
                animate={reduce ? undefined : { scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 22 }}
                className="inline-block h-4 w-4 rounded-full"
                style={{
                  background: "radial-gradient(circle at 35% 30%, var(--spark), var(--ember) 72%)",
                  boxShadow: "0 0 8px rgba(255,140,40,0.55)",
                }}
              />
            ))}
          </div>

          <div className="mt-4 flex gap-2.5">
            <button
              type="button"
              onClick={() => setGuardians((g) => Math.min(12, g + 1))}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg font-medium transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(90deg, var(--ember), var(--amber))", color: "#1a0d04" }}
            >
              <Flame size={15} />
              {d.addGuardian}
            </button>
            <button
              type="button"
              onClick={() => setGuardians(1)}
              className="min-h-11 rounded-lg border px-4 text-[13px] transition-colors hover:text-[var(--warm-white)]"
              style={{ borderColor: "var(--line-strong)", color: "var(--ash)" }}
            >
              {d.emptyCircle}
            </button>
          </div>
          <p className="mt-3 text-center text-[12px]" style={{ color: "var(--ash-dim)" }}>
            {d.feedHint}
          </p>
        </div>
      </div>

      <p className="relative z-10 mx-auto mt-6 max-w-sm text-center text-[12.5px]" style={{ color: "var(--ash-dim)" }}>
        {d.tryLive}
      </p>
    </main>
  );
}

// Canvas flame: base glow + core flame react to `guardians`; a flicker/wobble driven by a
// continuous animation clock; color shifts from `health` (green→amber→red) like the in-scene
// fire. Falls back to a static gradient under reduced-motion.
function FireCanvas({ guardians, health, reduce }: { guardians: number; health: number; reduce: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ guardians, health });
  stateRef.current = { guardians, health };

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => {
      const r = canvas.getBoundingClientRect();
      canvas.width = r.width * DPR;
      canvas.height = r.height * DPR;
    };
    size();
    window.addEventListener("resize", size);

    if (reduce) {
      const { guardians: g } = stateRef.current;
      const i = Math.min(1.5, 0.3 + g * 0.08);
      const w = canvas.width, h = canvas.height;
      const gr = ctx.createRadialGradient(w / 2, h - 40 * DPR, 0, w / 2, h - 40 * DPR, (80 + i * 120) * DPR);
      gr.addColorStop(0, "rgba(255,150,50,0.5)");
      gr.addColorStop(1, "rgba(255,60,0,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, w, h);
      return () => window.removeEventListener("resize", size);
    }

    let raf = 0;
    let t = 0;
    const particles: { x: number; y: number; vy: number; life: number; size: number; hue: number }[] = [];

    const frame = () => {
      t += 0.1;
      const { guardians: g, health: hp } = stateRef.current;
      const i = Math.min(1.5, 0.3 + g * 0.08);
      const w = canvas.width, hgt = canvas.height, baseY = hgt - 40 * DPR;
      const wobble = 1 + Math.sin(t) * 0.05 + Math.sin(t * 2.3) * 0.03;
      const healthT = Math.max(0, Math.min(1, hp / 100));

      ctx.clearRect(0, 0, w, hgt);

      const gr = ctx.createRadialGradient(w / 2, baseY, 0, w / 2, baseY, (80 + i * 120) * DPR);
      gr.addColorStop(0, `rgba(255,150,50,${0.2 + i * 0.28})`);
      gr.addColorStop(0.4, `rgba(255,90,20,${0.1 + i * 0.14})`);
      gr.addColorStop(1, "rgba(255,60,0,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, w, hgt);

      const fh = (50 + i * 80) * (0.55 + healthT * 0.6) * wobble * DPR;
      const fw = (22 + i * 26) * wobble * DPR;
      const sway = Math.sin(t * 0.9) * 5 * DPR;
      const r = Math.round(255);
      const gCol = Math.round(90 + healthT * 110);
      const flame = ctx.createLinearGradient(0, baseY, 0, baseY - fh);
      flame.addColorStop(0, `rgba(${r},${gCol + 30},80,0.92)`);
      flame.addColorStop(0.5, `rgba(${r},${gCol},30,0.72)`);
      flame.addColorStop(1, "rgba(255,60,0,0)");
      ctx.fillStyle = flame;
      ctx.beginPath();
      ctx.moveTo(w / 2 - fw, baseY);
      ctx.quadraticCurveTo(w / 2 - fw * 0.3, baseY - fh * 0.6, w / 2 + sway, baseY - fh);
      ctx.quadraticCurveTo(w / 2 + fw * 0.3, baseY - fh * 0.6, w / 2 + fw, baseY);
      ctx.closePath();
      ctx.fill();

      const rate = 0.3 + i * 1.3;
      for (let s = 0; s < rate; s++) {
        if (Math.random() < 0.8) {
          particles.push({
            x: w / 2 + (Math.random() - 0.5) * 40 * i,
            y: baseY,
            vy: -(0.5 + Math.random() * 1) * (0.7 + i * 0.3),
            life: 1,
            size: 1 + Math.random() * 2.2 * i,
            hue: 18 + Math.random() * 26,
          });
        }
      }
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.y += pt.vy * DPR;
        pt.x += (Math.random() - 0.5) * 0.4;
        pt.life -= 0.009;
        if (pt.life <= 0) { particles.splice(p, 1); continue; }
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.fillStyle = `hsl(${pt.hue},100%,${55 + pt.life * 15}%)`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * DPR, 0, 6.28);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (particles.length > 260) particles.splice(0, particles.length - 260);

      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [reduce]);

  return <canvas ref={ref} className="block h-[220px] w-full sm:h-[260px]" aria-hidden />;
}
