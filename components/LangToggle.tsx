"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import type { Lang } from "@/lib/i18n";

// A real animated switch (sliding highlight between EN/ES) instead of a single button that
// just prints whichever language isn't active. Shared across Wall, GuardianProfile, and Demo —
// those three had the same lang-toggle button hand-copied with the same styling.
export function LangToggle({ lang, onClick, reduce }: { lang: Lang; onClick: () => void; reduce?: boolean }) {
  return (
    <button
      onClick={onClick}
      aria-label="Switch language"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border pl-3 pr-1.5"
      style={{ borderColor: "var(--line-violet)" }}
    >
      <Languages size={13} style={{ color: "var(--violet)" }} />
      <span className="relative inline-flex overflow-hidden rounded-full" style={{ width: 52, height: 26, background: "var(--surface-2)" }}>
        <motion.span
          className="absolute top-0.5 rounded-full"
          style={{ width: 24, height: 20, background: "var(--violet)" }}
          animate={{ left: lang === "en" ? 2 : 26 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32 }}
        />
        <span
          className="font-mono-num relative z-10 flex w-1/2 items-center justify-center text-[10px] tracking-wide transition-colors"
          style={{ color: lang === "en" ? "#fff" : "var(--ash-dim)" }}
        >
          EN
        </span>
        <span
          className="font-mono-num relative z-10 flex w-1/2 items-center justify-center text-[10px] tracking-wide transition-colors"
          style={{ color: lang === "es" ? "#fff" : "var(--ash-dim)" }}
        >
          ES
        </span>
      </span>
    </button>
  );
}
