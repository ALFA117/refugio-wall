import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Self-hosted at build time (no runtime request to Google's CDN, no CLS, no CSP risk).
// Fraunces: a soft, slightly dramatic serif with deep optical sizing — carries the
// "firelight and old stories" mood better than a generic system serif fallback.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

// Canonical host — this project also answers on refugio-azure.vercel.app and a few other
// claimed aliases (all via `vercel domains add`, so they follow every deploy); this one is
// the clearest/most memorable and is what metadata, canonical links and the sitemap point to.
const CANONICAL_URL = "https://wall-of-guardians.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_URL),
  title: "Wall of Guardians · Refugio",
  description:
    "The public leaderboard for Refugio — a Decentraland campfire that only burns when people show up. Embers earned keeping the fire alive.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Wall of Guardians · Refugio",
    description:
      "Embers earned keeping the fire alive, in a Decentraland campfire that grows with the people present.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wall of Guardians · Refugio",
    description: "A Decentraland campfire that only burns when people show up.",
  },
};

// Site-wide structured data. Deliberately a generic WebSite (not Person/Game schema, which
// wouldn't honestly describe a leaderboard page) — safe, accurate SEO, nothing overclaimed.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Wall of Guardians",
  url: CANONICAL_URL,
  description:
    "The public leaderboard for Refugio — a Decentraland campfire that only burns when people show up.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
