import type { MetadataRoute } from "next";

// Makes the Wall installable ("Add to Home Screen") — a nice touch for a page meant to be
// revisited (checking the leaderboard, trying the demo again).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wall of Guardians · Refugio",
    short_name: "Refugio",
    description: "A Decentraland campfire that only burns when people show up — public leaderboard and browser demo.",
    start_url: "/",
    display: "standalone",
    background_color: "#0e0a16",
    theme_color: "#0e0a16",
    // `purpose: "any maskable"` on both: Android adaptive icons crop to the inner 80% safe
    // zone when maskable, and the artwork already fits well inside that (a centered circle at
    // 62.5% of canvas diameter, full-bleed dark background behind it) — no separate maskable-
    // only asset needed, just declaring it so Android stops falling back to a generic frame.
    icons: [
      { src: "/pwa-icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-192", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/pwa-icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
