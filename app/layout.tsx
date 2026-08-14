import type { Metadata } from "next";
import { Fraunces } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://refugio-azure.vercel.app"),
  title: "Wall of Guardians · Refugio",
  description:
    "The public leaderboard for Refugio — a Decentraland campfire that only burns when people show up. Embers earned keeping the fire alive.",
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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fraunces.variable}>
      <body>{children}</body>
    </html>
  );
}
