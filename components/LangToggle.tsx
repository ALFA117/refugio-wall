"use client";

import { motion } from "framer-motion";
import { Languages } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { TAP_PRESS, SNAPPY } from "@/lib/motion";

// A real animated switch (sliding highlight between EN/ES) instead of a single button that
// just prints whichever language isn't active. Shared across Wall, GuardianProfile, and Demo —
// those three had the same lang-toggle button hand-copied with the same styling.
export function LangToggle({ lang, onClick, reduce }: { lang: Lang; onClick: () => void; reduce?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={lang === "en" ? "Cambiar a español" : "Switch to English"}
      whileTap={reduce ? undefined : TAP_PRESS}
      transition={SNAPPY}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-2 transition-colors hover:border-[var(--line-strong)]"
      style={{ borderColor: "var(--line)", background: "var(--ground-2)" }}
    >
      <Languages size={14} aria-hidden style={{ color: "var(--text-3)" }} />
      <span className="relative inline-flex overflow-hidden rounded-md" style={{ width: 56, height: 28, background: "var(--surface)" }}>
        <motion.span
          className="absolute top-0.5 rounded-[5px]"
          style={{ width: 26, height: 24, background: "var(--surface-3)", boxShadow: "inset 0 0 0 1px var(--line-strong)" }}
          animate={{ left: lang === "en" ? 2 : 28 }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 34 }}
        />
        <span
          className="font-mono-num relative z-10 flex w-1/2 items-center justify-center text-[12px] font-medium"
          style={{ color: lang === "en" ? "var(--text)" : "var(--text-3)" }}
        >
          EN
        </span>
        <span
          className="font-mono-num relative z-10 flex w-1/2 items-center justify-center text-[12px] font-medium"
          style={{ color: lang === "es" ? "var(--text)" : "var(--text-3)" }}
        >
          ES
        </span>
      </span>
    </motion.button>
  );
}
