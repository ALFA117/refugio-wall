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
    icons: [
      { src: "/pwa-icon-192", sizes: "192x192", type: "image/png" },
      { src: "/pwa-icon-512", sizes: "512x512", type: "image/png" },
    ],
  };
}
