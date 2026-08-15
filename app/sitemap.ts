import type { MetadataRoute } from "next";
import { getLeaderboardBundle } from "@/lib/leaderboard";

const BASE = "https://wall-of-guardians.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const bundle = await getLeaderboardBundle();
  const guardians = bundle.frames.all.map((g) => ({
    url: `${BASE}/guardians/${encodeURIComponent(g.displayName)}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/demo`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/guardians`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.7 },
    { url: `${BASE}/stats`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.6 },
    ...guardians,
  ];
}
