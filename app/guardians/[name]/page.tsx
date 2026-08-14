import type { Metadata } from "next";
import { getLeaderboardBundle } from "@/lib/leaderboard";
import { GuardianProfile } from "@/components/GuardianProfile";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { name: string } }): Promise<Metadata> {
  const name = decodeURIComponent(params.name);
  return {
    title: `${name} · Wall of Guardians`,
    description: `${name} on the Refugio Wall of Guardians — embers earned keeping the fire alive.`,
    alternates: { canonical: `/guardians/${encodeURIComponent(name)}` },
  };
}

export default async function GuardianPage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const bundle = await getLeaderboardBundle();
  const entries = bundle.frames.all;
  const idx = entries.findIndex((e) => e.displayName.toLowerCase() === name.toLowerCase());
  const guardian = idx >= 0 ? entries[idx] : null;

  return (
    <GuardianProfile
      guardian={guardian}
      name={name}
      rank={idx}
      total={entries.length}
      source={bundle.source}
    />
  );
}
