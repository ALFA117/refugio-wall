// Pure diff-to-events logic for the Wall's activity feed, kept separate from the polling
// effect in Wall.tsx so it's unit-testable with plain rank-map fixtures.
export function diffActivity(
  prevRanks: Record<string, number> | null,
  newRanks: Record<string, number>,
  labels: { joined: string; movedUp: string }
): string[] {
  if (!prevRanks) return [];
  const events: string[] = [];
  for (const name in newRanks) {
    const prev = prevRanks[name];
    if (prev === undefined) {
      events.push(labels.joined.replace("{name}", name));
    } else if (newRanks[name] < prev) {
      events.push(labels.movedUp.replace("{name}", name).replace("{rank}", String(newRanks[name] + 1)));
    }
  }
  return events;
}
