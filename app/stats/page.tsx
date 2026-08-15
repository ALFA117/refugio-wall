import type { Metadata } from "next";
import { getLeaderboardBundle, getHistory } from "@/lib/leaderboard";
import { topGainer } from "@/lib/history";
import { StatsPage } from "@/components/StatsPage";

export const dynamic = "force-dynamic";

// See app/guardians/page.tsx for why `images` is set explicitly here.
export const metadata: Metadata = {
  title: "Fire Stats · Wall of Guardians",
  description: "Aggregate stats for the Refugio community — total guardians, embers earned, rounds played.",
  alternates: { canonical: "/stats" },
  openGraph: { title: "Fire Stats · Wall of Guardians", type: "website", images: ["/opengraph-image"] },
  twitter: { card: "summary_large_image", title: "Fire Stats · Wall of Guardians", images: ["/opengraph-image"] },
};

export default async function StatsRoute() {
  const bundle = await getLeaderboardBundle();
  const gainer = topGainer(await getHistory());
  return <StatsPage entries={bundle.frames.all} gainer={gainer} />;
}
