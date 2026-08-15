import type { Metadata } from "next";
import { getLeaderboardBundle } from "@/lib/leaderboard";
import { GuardiansList } from "@/components/GuardiansList";

export const dynamic = "force-dynamic";

// Specifying `openGraph` at all (even partially) replaces inheritance of the root layout's
// whole object, field by field — this route has no sibling opengraph-image.tsx of its own, so
// without an explicit `images` entry it silently ends up with zero og:image (caught by the
// e2e/og-metadata.spec.ts test). Points at the root's generated image instead of leaving it
// unset.
export const metadata: Metadata = {
  title: "All Guardians · Wall of Guardians",
  description: "Every guardian who has kept the Refugio fire alive, ranked by embers earned.",
  alternates: { canonical: "/guardians" },
  openGraph: { title: "All Guardians · Wall of Guardians", type: "website", images: ["/opengraph-image"] },
  twitter: { card: "summary_large_image", title: "All Guardians · Wall of Guardians", images: ["/opengraph-image"] },
};

export default async function GuardiansIndexPage() {
  const bundle = await getLeaderboardBundle();
  return <GuardiansList entries={bundle.frames.all} source={bundle.source} />;
}
