import type { Metadata } from "next";
import { getLeaderboardBundle } from "@/lib/leaderboard";
import { StatsPage } from "@/components/StatsPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Fire Stats · Wall of Guardians",
  description: "Aggregate stats for the Refugio community — total guardians, embers earned, rounds played.",
  alternates: { canonical: "/stats" },
  openGraph: { title: "Fire Stats · Wall of Guardians", type: "website" },
  twitter: { card: "summary", title: "Fire Stats · Wall of Guardians" },
};

export default async function StatsRoute() {
  const bundle = await getLeaderboardBundle();
  return <StatsPage entries={bundle.frames.all} />;
}
