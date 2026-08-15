import type { Metadata } from "next";
import { getLeaderboardBundle } from "@/lib/leaderboard";
import { GuardiansList } from "@/components/GuardiansList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "All Guardians · Wall of Guardians",
  description: "Every guardian who has kept the Refugio fire alive, ranked by embers earned.",
  alternates: { canonical: "/guardians" },
  openGraph: { title: "All Guardians · Wall of Guardians", type: "website" },
  twitter: { card: "summary", title: "All Guardians · Wall of Guardians" },
};

export default async function GuardiansIndexPage() {
  const bundle = await getLeaderboardBundle();
  return <GuardiansList entries={bundle.frames.all} source={bundle.source} />;
}
