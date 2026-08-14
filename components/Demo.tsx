"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, Flame, Languages, Play, Trophy, RotateCcw } from "lucide-react";
import { DICTS, type Dict } from "@/lib/i18n";
import { useLang } from "./useLang";
import { AmbientEmbers } from "./Wall";

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const FEED_GAIN = 12;

type Difficulty = "easy" | "normal" | "hard";
type Wood = { id: number; slot: number };
type Phase = "start" | "playing" | "gameover";

const DIFFICULTY: Record<Difficulty, { ttl: number; spawnBase: number; decay: number; miss: number }> = {
  easy: { ttl: 2600, spawnBase: 3000, decay: 0.7, miss: 6 },
  normal: { ttl: 2000, spawnBase: 2400, decay: 1, miss: 9 },
  hard: { ttl: 1350, spawnBase: 1700, decay: 1.6, miss: 13 },
};

// A pure-web, no-install taste of the real mechanic, built as an actual small game (start
// screen → play) rather than a passive readout — closer to what the real feed-the-fire loop
// feels like, in under a minute, with nothing to install. Not the real multiplayer game; the
// page says so.
export function Demo() {
  const reduce = useReducedMotion();
  const [lang, setLang] = useLang();
  const d = DICTS[lang].demo;

  const [phase, setPhase] = useState<Phase>("start");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [guardians, setGuardians] = useState(1);
  const [health, setHealth] = useState(70);
  const [wood, setWood] = useState<Wood | null>(null);
  const [toast, setToast] = useState<{ text: string; good: boolean } | null>(null);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  const nextId = useRef(1);
  const woodTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveWoodRef = useRef<(id: number, fed: boolean) => void>(() => {});

  const cfg = DIFFICULTY[difficulty];
  const intensity = Math.min(1.5, 0.3 + guardians * 0.08);

  useEffect(() => {
    if (phase !== "playing") return;
    const spawn = () => {
      setWood((current) => {
        if (current) return current;
        const slot = Math.floor(Math.random() * 5);
        const id = nextId.current++;
        woodTimer.current = setTimeout(() => resolveWoodRef.current(id, false), cfg.ttl);
        return { id, slot };
      });
    };
    const delay = Math.max(900, cfg.spawnBase - guardians * 110);
    const id = setInterval(spawn, delay);
    return () => clearInterval(id);
  }, [phase, guardians, cfg.ttl, cfg.spawnBase]);

  useEffect(() => {
    if (phase !== "playing") return;
    const id = setInterval(() => {
      setHealth((h) => Math.max(0, Math.min(100, h - cfg.decay / Math.max(1, guardians * 0.5))));
    }, 2000);
    return () => clearInterval(id);
  }, [phase, guardians, cfg.decay]);

  // The fire went out — a clear end to the loop instead of an open-ended sandbox.
  useEffect(() => {
    if (phase === "playing" && health <= 0) {
      if (woodTimer.current) clearTimeout(woodTimer.current);
      setWood(null);
      setPhase("gameover");
    }
  }, [phase, health]);

  const [milestone, setMilestone] = useState(0); // bumps to retrigger the celebration burst

  function resolveWood(id: number, fed: boolean) {
    setWood((current) => (current && current.id === id ? null : current));
    if (woodTimer.current) clearTimeout(woodTimer.current);
    setHealth((h) => Math.max(0, Math.min(100, h + (fed ? FEED_GAIN : -cfg.miss))));
    setToast({ text: fed ? d.fedToast : d.missedToast, good: fed });
    setTimeout(() => setToast(null), 900);
    setStreak((s) => {
      const next = fed ? s + 1 : 0;
      setBest((b) => Math.max(b, next));
      if (next > 0 && next % 5 === 0) setMilestone((m) => m + 1);
      return next;
    });
  }
  resolveWoodRef.current = resolveWood;

  function startGame() {
    setGuardians(1);
    setHealth(70);
    setWood(null);
    setStreak(0);
    setPhase("playing");
  }

  const healthColor = health >= 60 ? "#4fbf6a" : health >= 30 ? "var(--amber)" : "#ff5a4a";
  const lowHealth = phase === "playing" && health > 0 && health < 25;

  return (
    <main className="relative mx-auto min-h-dvh w-full max-w-lg px-5 pb-16 pt-8">
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

      {/* mode="sync" (the default) — deliberately NOT "wait": gating the new phase's mount on
          the old one's exit animation finishing means a tab that loses focus/visibility right
          at the transition (rAF pauses in hidden tabs) could get stuck showing stale content
          indefinitely. Enter and exit run independently instead. */}
      <AnimatePresence>
        {phase === "start" && (
          <StartScreen
            key="start"
            d={d}
            reduce={!!reduce}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onPlay={startGame}
          />
        )}
        {phase === "gameover" && (
          <GameOverScreen key="gameover" d={d} reduce={!!reduce} best={best} onPlay={startGame} />
        )}
        {phase === "playing" && (
          <motion.div
            key="playing"
            initial={reduce ? undefined : { opacity: 0, scale: 0.97 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            {/* HUD chips */}
            <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-2">
              <Chip icon={<Flame size={13} />} label={d.intensityLabel} value={`${intensity.toFixed(2)}×`} color="var(--amber)" />
              <Chip icon={<Trophy size={13} />} label={d.streak} value={`${streak}`} color="var(--violet)" />
              <Chip icon={<Trophy size={13} />} label={d.best} value={`${best}`} color="var(--spark)" />
            </div>

            {/* The fire card — border pulses red when health is critically low */}
            <motion.div
              className="relative z-10 mt-4 overflow-hidden rounded-2xl border"
              animate={
                lowHealth && !reduce
                  ? { borderColor: ["#ff5a4a", "var(--line-strong)", "#ff5a4a"] }
                  : { borderColor: "var(--line-strong)" }
              }
              transition={lowHealth ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
              style={{
                background: "radial-gradient(120% 90% at 50% 100%, #1a0f10, #060410 70%)",
                boxShadow: lowHealth
                  ? "0 0 60px -10px rgba(255,80,60,0.45)"
                  : "0 30px 90px -40px rgba(255,122,45,0.4)",
              }}
            >
              <MilestoneBurst trigger={milestone} reduce={!!reduce} />
              <div className="relative">
                <FireCanvas guardians={guardians} health={health} reduce={!!reduce} />

                <div className="pointer-events-none absolute inset-x-0 bottom-[50px] flex justify-center gap-6 sm:bottom-[60px] sm:gap-9">
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
                            transition={{ type: "spring", stiffness: 460, damping: 22 }}
                            whileTap={reduce ? undefined : { scale: 0.85 }}
                            className="relative flex h-11 w-11 items-center justify-center rounded-full"
                            style={{
                              background: "radial-gradient(circle at 32% 28%, #e2a96e, #6b3f1e 78%)",
                              boxShadow: "0 0 20px rgba(255,150,60,0.6)",
                            }}
                          >
                            {!reduce && (
                              <motion.span
                                className="absolute inset-[-3px] rounded-full"
                                style={{ border: "2px solid var(--spark)" }}
                                initial={{ opacity: 0.95, scale: 1 }}
                                animate={{ opacity: 0, scale: 1.4 }}
                                transition={{ duration: cfg.ttl / 1000, ease: "linear" }}
                              />
                            )}
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
                  <AnimatePresence>
                    {toast && (
                      <motion.span
                        initial={{ opacity: 0, y: -8, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ type: "spring", stiffness: 400, damping: 24 }}
                        className="font-mono-num rounded-full px-3.5 py-1.5 text-[12px] font-medium"
                        style={{
                          color: toast.good ? "var(--spark)" : "#ffb0a2",
                          background: "rgba(10,7,16,0.78)",
                          border: `1px solid ${toast.good ? "var(--line-strong)" : "rgba(255,100,80,0.45)"}`,
                        }}
                      >
                        {toast.text}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="relative z-10 border-t px-5 py-4" style={{ borderColor: "var(--line)" }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono-num text-[11px] uppercase tracking-widest" style={{ color: "var(--violet)" }}>
                    {d.fireHealth}
                  </span>
                  <span className="font-mono-num text-[13px]" style={{ color: healthColor }}>
                    {Math.round(health)}%
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full" style={{ background: "var(--surface-2)" }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: healthColor, boxShadow: `0 0 10px ${healthColor}` }}
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
                  <motion.button
                    type="button"
                    whileTap={reduce ? undefined : { scale: 0.96 }}
                    onClick={() => setGuardians((g) => Math.min(12, g + 1))}
                    className="inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg font-medium transition-transform hover:-translate-y-0.5"
                    style={{ background: "linear-gradient(90deg, var(--ember), var(--amber))", color: "#1a0d04" }}
                  >
                    <Flame size={15} />
                    {d.addGuardian}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => setPhase("start")}
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border px-4 text-[13px] transition-colors hover:text-[var(--warm-white)]"
                    style={{ borderColor: "var(--line-strong)", color: "var(--ash)" }}
                  >
                    <RotateCcw size={14} />
                    {d.emptyCircle}
                  </button>
                </div>
                <p className="mt-3 text-center text-[12px]" style={{ color: "var(--ash-dim)" }}>
                  {d.feedHint}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="relative z-10 mx-auto mt-6 max-w-sm text-center text-[12.5px]" style={{ color: "var(--ash-dim)" }}>
        {d.tryLive}
      </p>
    </main>
  );
}

/* ---------------------------------------------------------------- Start screen */

function StartScreen({
  d,
  reduce,
  difficulty,
  setDifficulty,
  onPlay,
}: {
  d: Dict["demo"];
  reduce: boolean;
  difficulty: Difficulty;
  setDifficulty: (v: Difficulty) => void;
  onPlay: () => void;
}) {
  const anim = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, ease: EASE_OUT, delay },
        };

  const modes: { key: Difficulty; label: string }[] = [
    { key: "easy", label: d.modes.easy },
    { key: "normal", label: d.modes.normal },
    { key: "hard", label: d.modes.hard },
  ];

  return (
    <motion.div
      key="start"
      exit={reduce ? undefined : { opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="relative z-10 mt-6 flex flex-col items-center text-center"
    >
      <motion.div {...anim(0)} className="eyebrow">
        {d.eyebrow}
      </motion.div>
      <motion.h1
        {...anim(0.06)}
        className="font-serif-display mx-auto mt-3 max-w-[16ch] text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl"
      >
        {d.title} <span style={{ color: "var(--ember)", fontStyle: "italic" }}>{d.titleEm}</span>
      </motion.h1>
      <motion.p {...anim(0.12)} className="mx-auto mt-3 max-w-sm text-[14.5px]" style={{ color: "var(--ash)" }}>
        {d.subtitle}
      </motion.p>

      {/* Idle preview flame */}
      <motion.div
        {...anim(0.16)}
        className="relative mt-7 w-full overflow-hidden rounded-2xl border"
        style={{
          borderColor: "var(--line-strong)",
          background: "radial-gradient(120% 90% at 50% 100%, #1a0f10, #060410 70%)",
          boxShadow: "0 30px 90px -40px rgba(255,122,45,0.4)",
        }}
      >
        <FireCanvas guardians={3} health={70} reduce={reduce} idle />
      </motion.div>

      <motion.div {...anim(0.22)} className="mt-6 w-full">
        <div className="mb-2 text-[11px] font-medium uppercase tracking-widest" style={{ color: "var(--violet)" }}>
          {d.difficulty}
        </div>
        <div
          className="inline-flex w-full rounded-full border p-1"
          style={{ borderColor: "var(--line)", background: "var(--surface)" }}
          role="tablist"
        >
          {modes.map((m) => {
            const active = difficulty === m.key;
            return (
              <button
                key={m.key}
                role="tab"
                aria-selected={active}
                onClick={() => setDifficulty(m.key)}
                className="relative flex min-h-11 flex-1 items-center justify-center rounded-full text-[13px] font-medium transition-colors"
                style={{ color: active ? "#1a0d04" : "var(--ash)" }}
              >
                {active && (
                  <motion.span
                    layoutId={reduce ? undefined : "mode-pill"}
                    className="absolute inset-0 rounded-full"
                    style={{ background: "linear-gradient(90deg, var(--ember), var(--amber))" }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{m.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      <motion.button
        {...anim(0.28)}
        type="button"
        onClick={onPlay}
        whileHover={reduce ? undefined : { scale: 1.03 }}
        whileTap={reduce ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="mt-7 inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold"
        style={{
          background: "linear-gradient(90deg, var(--ember), var(--spark))",
          color: "#1a0d04",
          boxShadow: "0 16px 40px -14px rgba(255,150,60,0.8)",
        }}
      >
        <Play size={18} fill="#1a0d04" />
        {d.play}
      </motion.button>
    </motion.div>
  );
}

/* -------------------------------------------------------------- Game over */

// The fire went out — gives the loop a clear end and a reason to try again, instead of
// leaving health sitting at 0 forever with no feedback.
function GameOverScreen({
  d,
  reduce,
  best,
  onPlay,
}: {
  d: Dict["demo"];
  reduce: boolean;
  best: number;
  onPlay: () => void;
}) {
  return (
    <motion.div
      key="gameover"
      initial={reduce ? undefined : { opacity: 0, y: 16 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      exit={reduce ? undefined : { opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="relative z-10 mt-10 flex flex-col items-center text-center"
    >
      <motion.div
        initial={reduce ? undefined : { scale: 0.6, opacity: 0 }}
        animate={reduce ? undefined : { scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
        className="h-14 w-14 rounded-full"
        style={{ background: "radial-gradient(circle at 35% 30%, #6b3f1e, #1a0f10 75%)", border: "1px solid var(--line)" }}
      />
      <h1 className="font-serif-display mt-5 max-w-[16ch] text-2xl font-semibold tracking-tight sm:text-3xl">
        {d.gameOverTitle}
      </h1>
      <p className="mt-2 text-[14px]" style={{ color: "var(--ash)" }}>
        {d.gameOverBody}
      </p>
      <div className="mt-5 flex items-center gap-2 rounded-full border px-4 py-2" style={{ borderColor: "var(--line)", background: "var(--surface)" }}>
        <Trophy size={14} style={{ color: "var(--spark)" }} />
        <span className="font-mono-num text-[13px]" style={{ color: "var(--ash-dim)" }}>
          {d.best}
        </span>
        <span className="font-mono-num text-[15px] font-semibold" style={{ color: "var(--spark)" }}>
          {best}
        </span>
      </div>
      <motion.button
        type="button"
        onClick={onPlay}
        whileHover={reduce ? undefined : { scale: 1.03 }}
        whileTap={reduce ? undefined : { scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="mt-7 inline-flex min-h-14 w-full max-w-xs items-center justify-center gap-2 rounded-full text-[16px] font-semibold"
        style={{
          background: "linear-gradient(90deg, var(--ember), var(--spark))",
          color: "#1a0d04",
          boxShadow: "0 16px 40px -14px rgba(255,150,60,0.8)",
        }}
      >
        <RotateCcw size={17} />
        {d.playAgain}
      </motion.button>
    </motion.div>
  );
}

/* ---------------------------------------------------------- Milestone burst */

// Every 5th consecutive feed triggers a small celebration — spark burst from the card center.
// `trigger` is a counter that increments on each milestone; keying the burst on it re-fires it.
function MilestoneBurst({ trigger, reduce }: { trigger: number; reduce: boolean }) {
  if (trigger === 0) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
      <AnimatePresence>
        <motion.div key={trigger} className="absolute inset-0 flex items-center justify-center" exit={{ opacity: 0 }}>
          {!reduce &&
            Array.from({ length: 12 }).map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const dist = 70 + (i % 3) * 24;
              return (
                <motion.span
                  key={i}
                  className="absolute rounded-full"
                  style={{ width: 6, height: 6, background: "var(--spark)", boxShadow: "0 0 10px rgba(255,214,107,0.9)" }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, opacity: 0, scale: 0.3 }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              );
            })}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------- Chip */

function Chip({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5"
      style={{ borderColor: "var(--line)", background: "var(--surface)" }}
    >
      <span style={{ color }}>{icon}</span>
      <span className="font-mono-num text-[11px] uppercase tracking-wider" style={{ color: "var(--ash-dim)" }}>
        {label}
      </span>
      <span className="font-mono-num text-[13px] font-semibold" style={{ color }}>
        {value}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ Fire canvas */

// A layered flame: base embers on a log pile, an inner white-hot core, a mid orange body, and
// outer flicker tongues with independent phase offsets — reacts to `guardians` (size) and
// `health` (color, from a cool ember to a roaring blaze). `idle` runs a gentle ambient loop
// for the start-screen preview, ignoring the click-to-feed game state.
function FireCanvas({
  guardians,
  health,
  reduce,
  idle = false,
}: {
  guardians: number;
  health: number;
  reduce: boolean;
  idle?: boolean;
}) {
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

    const drawLogs = (w: number, baseY: number) => {
      ctx.fillStyle = "#2a1810";
      for (const [dx, rot] of [[-1, -0.28], [1, 0.3], [0, 0]] as [number, number][]) {
        ctx.save();
        ctx.translate(w / 2 + dx * 34 * DPR, baseY + 6 * DPR);
        ctx.rotate(rot);
        ctx.beginPath();
        ctx.roundRect(-30 * DPR, -6 * DPR, 60 * DPR, 12 * DPR, 6 * DPR);
        ctx.fill();
        ctx.restore();
      }
    };

    if (reduce) {
      const { guardians: g } = stateRef.current;
      const i = Math.min(1.5, 0.3 + g * 0.08);
      const w = canvas.width, h = canvas.height;
      const gr = ctx.createRadialGradient(w / 2, h - 46 * DPR, 0, w / 2, h - 46 * DPR, (90 + i * 130) * DPR);
      gr.addColorStop(0, "rgba(255,160,60,0.55)");
      gr.addColorStop(1, "rgba(255,60,0,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, w, h);
      drawLogs(w, h - 46 * DPR);
      return () => window.removeEventListener("resize", size);
    }

    let raf = 0;
    let t = 0;
    const particles: { x: number; y: number; vy: number; vx: number; life: number; size: number; hue: number }[] = [];

    const tongue = (baseY: number, w: number, cx: number, height: number, width: number, phase: number, colorIn: string, colorOut: string) => {
      const sway = Math.sin(t * 1.6 + phase) * width * 0.18 + Math.sin(t * 3.1 + phase * 2) * width * 0.06;
      const lean = Math.sin(t * 0.7 + phase) * height * 0.05;
      const grad = ctx.createLinearGradient(0, baseY, 0, baseY - height);
      grad.addColorStop(0, colorIn);
      grad.addColorStop(1, colorOut);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(cx - width, baseY);
      ctx.quadraticCurveTo(cx - width * 0.35 + sway * 0.4, baseY - height * 0.55, cx + sway + lean, baseY - height);
      ctx.quadraticCurveTo(cx + width * 0.35 + sway * 0.4, baseY - height * 0.55, cx + width, baseY);
      ctx.closePath();
      ctx.fill();
    };

    const frame = () => {
      t += 0.07 + (idle ? 0 : 0.02);
      const { guardians: g, health: hp } = stateRef.current;
      const i = Math.min(1.5, 0.3 + g * 0.08);
      const w = canvas.width, hgt = canvas.height, baseY = hgt - 44 * DPR;
      const healthT = Math.max(0, Math.min(1, hp / 100));
      const flicker = 0.9 + Math.sin(t * 4.2) * 0.06 + Math.sin(t * 9.7) * 0.03;

      ctx.clearRect(0, 0, w, hgt);

      // ambient glow
      const glowR = (100 + i * 150) * flicker * DPR;
      const gr = ctx.createRadialGradient(w / 2, baseY, 0, w / 2, baseY, glowR);
      gr.addColorStop(0, `rgba(255,150,50,${0.22 + i * 0.3})`);
      gr.addColorStop(0.45, `rgba(255,90,20,${0.1 + i * 0.15})`);
      gr.addColorStop(1, "rgba(255,60,0,0)");
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, w, hgt);

      // ground ember bed
      const bedGrad = ctx.createRadialGradient(w / 2, baseY + 4 * DPR, 0, w / 2, baseY + 4 * DPR, 70 * DPR * (0.6 + i * 0.5));
      const bedHue = 10 + healthT * 30;
      bedGrad.addColorStop(0, `hsla(${bedHue},100%,55%,0.8)`);
      bedGrad.addColorStop(1, "hsla(20,100%,40%,0)");
      ctx.fillStyle = bedGrad;
      ctx.beginPath();
      ctx.ellipse(w / 2, baseY + 4 * DPR, 55 * DPR * (0.6 + i * 0.5), 10 * DPR, 0, 0, 6.29);
      ctx.fill();

      drawLogs(w, baseY);

      const baseH = (56 + i * 78) * (0.5 + healthT * 0.65) * flicker * DPR;
      const baseW = (20 + i * 22) * DPR;
      const gCol = Math.round(70 + healthT * 130);

      // outer flicker tongues (cooler, wider, behind)
      tongue(baseY, w, w / 2 - baseW * 0.5, baseH * 0.85, baseW * 0.7, 0.6, `rgba(255,${gCol - 10},20,0.55)`, "rgba(255,60,0,0)");
      tongue(baseY, w, w / 2 + baseW * 0.55, baseH * 0.78, baseW * 0.65, 2.1, `rgba(255,${gCol - 10},20,0.55)`, "rgba(255,60,0,0)");
      // mid body
      tongue(baseY, w, w / 2, baseH, baseW, 1.1, `rgba(255,${gCol},40,0.85)`, "rgba(255,70,10,0.05)");
      // inner hot core (brighter, narrower, taller)
      tongue(baseY, w, w / 2, baseH * 0.7, baseW * 0.5, 3.4, `rgba(255,${Math.min(255, gCol + 60)},${120 + healthT * 100},0.95)`, "rgba(255,140,40,0.1)");

      // embers
      const rate = 0.25 + i * 1.1;
      for (let s = 0; s < rate; s++) {
        if (Math.random() < 0.85) {
          particles.push({
            x: w / 2 + (Math.random() - 0.5) * 44 * i,
            y: baseY,
            vy: -(0.45 + Math.random() * 0.95) * (0.7 + i * 0.3),
            vx: (Math.random() - 0.5) * 0.5,
            life: 1,
            size: 0.8 + Math.random() * 2.1 * i,
            hue: 14 + healthT * 26 + Math.random() * 14,
          });
        }
      }
      for (let p = particles.length - 1; p >= 0; p--) {
        const pt = particles[p];
        pt.y += pt.vy * DPR;
        pt.x += pt.vx + Math.sin(pt.y * 0.02) * 0.3;
        pt.life -= 0.0085;
        if (pt.life <= 0) { particles.splice(p, 1); continue; }
        ctx.globalAlpha = Math.max(0, pt.life);
        ctx.fillStyle = `hsl(${pt.hue},100%,${55 + pt.life * 18}%)`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * DPR, 0, 6.28);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (particles.length > 300) particles.splice(0, particles.length - 300);

      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
    };
  }, [reduce, idle]);

  return <canvas ref={ref} className="block h-[220px] w-full sm:h-[280px]" aria-hidden />;
}
