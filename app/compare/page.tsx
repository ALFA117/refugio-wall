import type { Metadata } from "next";
import { getLeaderboardBundle } from "@/lib/leaderboard";
import { CompareView } from "@/components/CompareView";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Compare Guardians · Wall of Guardians",
  description: "Put two Refugio guardians side by side and see who's ahead.",
  alternates: { canonical: "/compare" },
};

export default async function ComparePage({ searchParams }: { searchParams: { a?: string; b?: string } }) {
  const bundle = await getLeaderboardBundle();
  const entries = bundle.frames.all;
  const find = (name?: string) => (name ? entries.find((e) => e.displayName.toLowerCase() === name.toLowerCase()) ?? null : null);
  const rankOf = (name?: string) => (name ? entries.findIndex((e) => e.displayName.toLowerCase() === name.toLowerCase()) : -1);

  return (
    <CompareView
      entries={entries}
      a={find(searchParams.a)}
      b={find(searchParams.b)}
      rankA={rankOf(searchParams.a)}
      rankB={rankOf(searchParams.b)}
    />
  );
}
