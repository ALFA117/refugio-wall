"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, animate } from "framer-motion";
import { EASE_OUT } from "@/lib/motion";

// Animated number: eases up from 0 on first mount (a classic counter), then — once settled —
// any later change to `value` (e.g. from the 30s live poll picking up a new round) flips only
// the digits that actually changed, odometer-style, instead of re-running the whole count-up.
export function TickerNumber({
  value,
  reduce,
  className,
}: {
  value: number;
  reduce: boolean;
  className?: string;
}) {
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState(0);
  const [settled, setSettled] = useState(false);
  const prevValue = useRef(value);

  // Mount-only count-up. Later prop changes are handled by the effect below instead.
  useEffect(() => {
    if (reduce) {
      setDisplay(value);
      setSettled(true);
      return;
    }
    const controls = animate(mv, value, {
      duration: 1.1,
      ease: EASE_OUT,
      onUpdate: (v) => setDisplay(Math.round(v)),
      onComplete: () => setSettled(true),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!settled || value === prevValue.current) return;
    prevValue.current = value;
    setDisplay(value); // snap the value; the per-digit exit/enter below supplies the motion
  }, [value, settled]);

  const str = display.toLocaleString();

  // During the mount count-up, plain text already reads as smooth (it updates ~60x/s);
  // the per-digit flip is reserved for the rarer, discrete updates after settling.
  if (!settled) return <span className={className}>{str}</span>;

  return (
    <span className={className} style={{ display: "inline-flex", lineHeight: 1 }}>
      {str.split("").map((ch, i) => (
        <span key={i} style={{ position: "relative", display: "inline-block", overflow: "hidden", height: "1em" }}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={ch}
              initial={{ y: "0.55em", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "-0.55em", opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              style={{ display: "inline-block" }}
            >
              {ch}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
