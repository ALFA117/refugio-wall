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
    ...guardians,
  ];
}
