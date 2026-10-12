"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

/**
 * Fondo ambiental (receta 1 de /diseno: figuras CSS 3D + constelación), adaptado
 * a Refugio, una fogata en Decentraland que solo arde cuando llega gente:
 *  · cielo nocturno violeta con estrellas que se enlazan despacio en constelaciones
 *    (la capa lejana);
 *  · chispas que suben desde abajo, como de la fogata, y se apagan al subir
 *    (la capa media, en el mismo canvas);
 *  · figuras CSS 3D del tema (la capa cercana): leños (prismas), brasas (cubos)
 *    y un anillo de guardianes alrededor del fuego (giroscopio).
 * Completo en el Wall y la demo; tranquilo en perfiles y estadísticas. Pausa con
 * la pestaña oculta, mitad de elementos en celular, DPR ≤ 2 y escena quieta con
 * movimiento reducido.
 */

type Shape = { kind: "log" | "ember" | "ring"; x: string; y: string; size: number; depth: number; spin: number; tone: string; mobile?: boolean };

const SHAPES: Shape[] = [
  { kind: "ring", x: "74%", y: "6%", size: 230, depth: 0.85, spin: 46, tone: "var(--violet)", mobile: true },
  { kind: "ember", x: "6%", y: "24%", size: 70, depth: 0.7, spin: 22, tone: "var(--ember)", mobile: true },
  { kind: "log", x: "84%", y: "62%", size: 120, depth: 0.55, spin: 34, tone: "var(--amber)", mobile: true },
  { kind: "ember", x: "18%", y: "72%", size: 46, depth: 0.4, spin: 18, tone: "var(--spark)" },
  { kind: "log", x: "4%", y: "86%", size: 90, depth: 0.3, spin: 30, tone: "var(--ember)" },
  { kind: "ember", x: "58%", y: "88%", size: 34, depth: 0.22, spin: 14, tone: "var(--amber)" },
];

function faces(kind: Shape["kind"], size: number) {
  if (kind === "ember") {
    const h = size / 2;
    return ["rotateY(0deg)", "rotateY(90deg)", "rotateY(180deg)", "rotateY(-90deg)", "rotateX(90deg)", "rotateX(-90deg)"].map((r) => ({
      t: `${r} translateZ(${h}px)`, w: size, h: size, l: 0,
    }));
  }
  if (kind === "log") {
    // Leño: prisma hexagonal acostado (6 caras largas alrededor del eje X).
    const d = size * 0.32, len = size, side = d * Math.tan(Math.PI / 6) * 2;
    return Array.from({ length: 6 }, (_, i) => ({
      t: `rotateX(${i * 60}deg) translateZ(${d / 2}px)`, w: len, h: side, l: 0,
    }));
  }
  return [];
}

function Float({ s, i, px, py, scroll, reduce }: { s: Shape; i: number; px: MotionValue<number>; py: MotionValue<number>; scroll: MotionValue<number>; reduce: boolean }) {
  const range = 36 * s.depth;
  const x = useTransform(px, (v) => v * range);
  const yp = useTransform(py, (v) => v * range);
  const ys = useTransform(scroll, (v) => -Math.min(v * 0.2, 400) * s.depth);
  const y = useTransform([yp, ys] as MotionValue<number>[], ([a, b]: number[]) => a + b);
  return (
    <motion.div
      className="rf-float"
      style={{ left: s.x, top: s.y, width: s.size, height: s.size, x: reduce ? 0 : x, y: reduce ? 0 : y, scale: 0.7 + s.depth * 0.5, opacity: 0.25 + s.depth * 0.45, color: s.tone }}
    >
      <div className={`rf-spin ${reduce ? "" : "rf-animate"}`} style={{ width: s.size, height: s.size, animationDuration: `${s.spin}s`, animationDelay: `${-i * 4}s`, ["--tilt" as string]: `${(i % 3) * 18 - 18}deg` }}>
        {s.kind === "ring"
          ? ["rotateY(0deg)", "rotateY(60deg)", "rotateY(120deg)", "rotateX(90deg)"].map((t, k) => (
              <span key={t} className="rf-ring" style={{ transform: t, opacity: 1 - k * 0.15 }}>
                {/* Guardianes: puntos sobre el anillo */}
                {k === 3 && Array.from({ length: 8 }, (_, n) => (
                  <i key={n} className="rf-guardian" style={{ transform: `rotate(${n * 45}deg) translateY(-${s.size / 2}px)` }} />
                ))}
              </span>
            ))
          : faces(s.kind, s.size).map((f, k) => (
              <span key={k} className="rf-face" style={{ width: f.w, height: f.h, left: (s.size - f.w) / 2, top: (s.size - f.h) / 2, transform: f.t }} />
            ))}
      </div>
    </motion.div>
  );
}

function Sky({ reduce, mobile, px }: { reduce: boolean; mobile: boolean; px: MotionValue<number> }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = el.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0;
    const STARS = mobile ? 70 : 140, SPARKS = mobile ? 26 : 55;
    type Star = { x: number; y: number; r: number; tw: number };
    type Spark = { x: number; y: number; vy: number; life: number; r: number };
    let stars: Star[] = [];
    const sparks: Spark[] = [];
    const css = getComputedStyle(document.documentElement);
    const violet = css.getPropertyValue("--violet").trim() || "#a281ff";
    const ember = css.getPropertyValue("--ember").trim() || "#ff7a2d";
    const spark = css.getPropertyValue("--spark").trim() || "#ffd66b";
    const newSpark = (): Spark => ({ x: w * (0.3 + Math.random() * 0.4), y: h + 10, vy: 0.4 + Math.random() * 0.9, life: 1, r: 0.8 + Math.random() * 1.8 });
    const resize = () => {
      w = el.clientWidth; h = el.clientHeight;
      el.width = w * dpr; el.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = Array.from({ length: STARS }, () => ({ x: Math.random() * w, y: Math.random() * h * 0.75, r: 0.4 + Math.random() * 1.2, tw: Math.random() * 6 }));
      if (reduce) draw(0);
    };
    function draw(t: number) {
      ctx!.clearRect(0, 0, w, h);
      const shift = px.get() * 12;
      // Estrellas y constelaciones (lejos: se mueven poco)
      const pts: { x: number; y: number }[] = [];
      for (const s of stars) {
        const a = 0.35 + 0.35 * Math.sin(t * 0.8 + s.tw);
        const x = s.x + shift, y = s.y;
        ctx!.globalAlpha = a;
        ctx!.fillStyle = "#f5eee6";
        ctx!.beginPath(); ctx!.arc(x, y, s.r, 0, Math.PI * 2); ctx!.fill();
        if (s.r > 1) pts.push({ x, y });
      }
      ctx!.lineWidth = 0.6;
      ctx!.strokeStyle = violet;
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 120) { ctx!.globalAlpha = (1 - d / 120) * 0.22; ctx!.beginPath(); ctx!.moveTo(pts[i].x, pts[i].y); ctx!.lineTo(pts[j].x, pts[j].y); ctx!.stroke(); }
      }
      // Chispas de la fogata (cerca: suben y se apagan)
      if (!reduce) {
        while (sparks.length < SPARKS) sparks.push(newSpark());
        for (const p of sparks) {
          p.y -= p.vy; p.x += Math.sin((p.y + t * 40) * 0.02) * 0.4 + shift * 0.002; p.life -= 0.0025;
          if (p.life <= 0 || p.y < h * 0.15) Object.assign(p, newSpark());
          ctx!.globalAlpha = Math.max(0, p.life) * 0.8;
          ctx!.fillStyle = p.life > 0.6 ? spark : ember;
          ctx!.beginPath(); ctx!.arc(p.x + shift * 2, p.y, p.r, 0, Math.PI * 2); ctx!.fill();
        }
      }
      ctx!.globalAlpha = 1;
    }
    resize();
    window.addEventListener("resize", resize);
    if (reduce) return () => window.removeEventListener("resize", resize);
    const loop = (ms: number) => { draw(ms / 1000); raf = requestAnimationFrame(loop); };
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", vis);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", vis); };
  }, [reduce, mobile, px]);
  return <canvas ref={ref} className="rf-sky" />;
}

export function AmbientBackground() {
  const pathname = usePathname() ?? "/";
  const full = pathname === "/" || pathname.startsWith("/demo");
  const reduce = useReducedMotion() ?? false;
  const [mobile, setMobile] = useState(true);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const u = () => setMobile(mq.matches);
    u(); mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const px = useSpring(rx, { stiffness: 40, damping: 18 });
  const py = useSpring(ry, { stiffness: 40, damping: 18 });
  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const on = (e: PointerEvent) => { rx.set((e.clientX / innerWidth - 0.5) * 2); ry.set((e.clientY / innerHeight - 0.5) * 2); };
    addEventListener("pointermove", on, { passive: true });
    return () => removeEventListener("pointermove", on);
  }, [reduce, rx, ry]);
  const { scrollY } = useScroll();
  const scroll = useSpring(scrollY, { stiffness: 60, damping: 20 });
  const shapes = SHAPES.filter((s) => !mobile || s.mobile);

  return (
    <div aria-hidden="true" className={`rf-amb ${full ? "" : "rf-calm"}`}>
      <Sky reduce={reduce} mobile={mobile} px={px} />
      <div className="rf-stage">
        {shapes.map((s, i) => <Float key={i} s={s} i={i} px={px} py={py} scroll={scroll} reduce={reduce} />)}
      </div>
      <div className="rf-vignette" />
    </div>
  );
}
