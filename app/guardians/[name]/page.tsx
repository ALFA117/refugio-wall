import type { Metadata } from "next";
import { getLeaderboardBundle } from "@/lib/leaderboard";
import { GuardianProfile } from "@/components/GuardianProfile";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const name = decodeURIComponent(params.name);
  const title = `${name} · Wall of Guardians`;
  const description = `${name} on the Refugio Wall of Guardians — embers earned keeping the fire alive.`;
  return {
    title,
    description,
    alternates: { canonical: `/guardians/${encodeURIComponent(name)}` },
    // Explicit per-page openGraph/twitter — otherwise Next inherits the root layout's whole
    // object (generic "Wall of Guardians" title) even though the dedicated OG *image* for
    // this route (opengraph-image.tsx) is correctly auto-detected and personalized.
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function GuardianPage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const bundle = await getLeaderboardBundle();
  const entries = bundle.frames.all;
  const idx = entries.findIndex((e) => e.displayName.toLowerCase() === name.toLowerCase());
  const guardian = idx >= 0 ? entries[idx] : null;

  // Generic WebPage schema — deliberately not Person/ProfilePage, since this represents a
  // game handle's stats, not a verified real-world identity.
  const jsonLd = guardian
    ? {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: `${name} · Wall of Guardians`,
        description: `${name} has earned ${guardian.brasas} embers on the Refugio Wall of Guardians, ranked #${idx + 1} of ${entries.length}.`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <GuardianProfile
        guardian={guardian}
        name={name}
        rank={idx}
        total={entries.length}
        source={bundle.source}
      />
    </>
  );
}
