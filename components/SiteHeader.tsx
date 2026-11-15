"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Play } from "lucide-react";
import type { Lang } from "@/lib/i18n";
import { LangToggle } from "./LangToggle";

// Navigation labels live here (not in the main dictionary) because only the header uses them.
const NAV: Record<Lang, { home: string; guardians: string; stats: string; compare: string; play: string; sub: string }> = {
  en: { home: "Leaderboard", guardians: "Guardians", stats: "Stats", compare: "Compare", play: "Play demo", sub: "Wall of Guardians" },
  es: { home: "Clasificación", guardians: "Guardianes", stats: "Estadísticas", compare: "Comparar", play: "Jugar demo", sub: "Muro de Guardianes" },
};

// The brand mark: a single-stroke flame inside a rounded square — drawn, not an emoji.
export function RefugioMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden fill="none">
      <rect x="0.5" y="0.5" width="27" height="27" rx="7.5" fill="var(--surface-2)" stroke="var(--line-strong)" />
      <path
        d="M14 6.5c.6 2.4 3.9 4.3 3.9 8.2a3.9 3.9 0 0 1-7.8 0c0-1.6.8-2.7 1.6-3.5.2 1.2.9 2 1.7 2.2-.3-2.3.1-4.6.6-6.9Z"
        fill="var(--ember)"
      />
      <path d="M8.5 21.5h11" stroke="var(--text-3)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Honest data-source label for every page that shows figures: amber dot + "sample data" until
// the scene is pushing real rounds, green dot + "live" afterwards.
const SOURCE_LABEL: Record<Lang, { live: string; sample: string }> = {
  en: { live: "Live data", sample: "Preview · sample data" },
  es: { live: "Datos en vivo", sample: "Vista previa · datos de muestra" },
};
export function DataSourcePill({ source, lang }: { source: "live" | "sample"; lang: Lang }) {
  return (
    <span className="status-pill">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: source === "live" ? "var(--ok)" : "var(--warn)" }} />
      {source === "live" ? SOURCE_LABEL[lang].live : SOURCE_LABEL[lang].sample}
    </span>
  );
}

export function SiteHeader({
  lang,
  onToggleLang,
  reduce,
  extra,
}: {
  lang: Lang;
  onToggleLang: () => void;
  reduce?: boolean;
  /** Optional control rendered before the language switch (e.g. the shortcuts button). */
  extra?: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const t = NAV[lang];
  const links = [
    { href: "/", label: t.home, active: pathname === "/" },
    { href: "/guardians", label: t.guardians, active: pathname.startsWith("/guardians") },
    { href: "/stats", label: t.stats, active: pathname.startsWith("/stats") },
    { href: "/compare", label: t.compare, active: pathname.startsWith("/compare") },
  ];
  const onDemo = pathname.startsWith("/demo");

  return (
    <header
      className="sticky top-0 z-40 border-b"
      style={{ borderColor: "var(--line)", background: "rgba(13, 12, 11, 0.94)" }}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex min-h-11 shrink-0 items-center gap-2.5" aria-label="Refugio — Wall of Guardians">
          <RefugioMark />
          <span className="flex flex-col leading-none">
            <span className="font-serif-display text-[17px] font-semibold" style={{ color: "var(--text)" }}>
              Refugio
            </span>
            <span className="mt-1 hidden text-[12px] sm:block" style={{ color: "var(--text-3)" }}>
              {t.sub}
            </span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={l.active ? "page" : undefined}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-[14px] font-medium transition-colors hover:text-[var(--text)]"
              style={{ color: l.active ? "var(--text)" : "var(--text-3)", background: l.active ? "var(--surface)" : "transparent" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {extra}
          <LangToggle lang={lang} onClick={onToggleLang} reduce={reduce} />
          {!onDemo && (
            <Link href="/demo" className="btn btn-primary hidden sm:inline-flex" style={{ minHeight: 40, padding: "0 14px", fontSize: 14 }}>
              <Play size={14} fill="currentColor" aria-hidden />
              {t.play}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile: the same four destinations as an even row — no hamburger, one tap away. */}
      <nav aria-label="Main" className="grid grid-cols-4 border-t md:hidden" style={{ borderColor: "var(--line)" }}>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={l.active ? "page" : undefined}
            className="relative flex min-h-11 items-center justify-center truncate px-1 text-[13px] font-medium"
            style={{ color: l.active ? "var(--text)" : "var(--text-3)" }}
          >
            {l.label}
            {l.active && <span aria-hidden className="absolute inset-x-3 bottom-0 h-0.5 rounded-full" style={{ background: "var(--ember)" }} />}
          </Link>
        ))}
      </nav>
    </header>
  );
}
