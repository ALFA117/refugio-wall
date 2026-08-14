import { getLeaderboardBundle } from "@/lib/leaderboard";
import { Wall } from "@/components/Wall";

export const dynamic = "force-dynamic";

export default async function Page() {
  const bundle = await getLeaderboardBundle();
  return <Wall bundle={bundle} />;
}
