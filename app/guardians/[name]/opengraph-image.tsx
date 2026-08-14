import { ImageResponse } from "next/og";
import { getLeaderboardBundle } from "@/lib/leaderboard";

export const runtime = "edge";
export const alt = "Guardian profile · Wall of Guardians";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Personalized share card: this guardian's name, rank, embers and badge — so sharing a
// profile looks like an achievement, not a bare link. Falls back to a generic card if the
// name isn't found (e.g. someone shares before their first round).
function badgeFor(brasas: number): { label: string; color: string } | null {
  if (brasas >= 1000) return { label: "FIREKEEPER", color: "#ffd66b" };
  if (brasas >= 500) return { label: "EMBER", color: "#ff7a2d" };
  if (brasas >= 100) return { label: "KINDLING", color: "#a281ff" };
  return null;
}

export default async function GuardianOpengraphImage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const bundle = await getLeaderboardBundle();
  const entries = bundle.frames.all;
  const idx = entries.findIndex((e) => e.displayName.toLowerCase() === name.toLowerCase());
  const guardian = idx >= 0 ? entries[idx] : null;
  const badge = guardian ? badgeFor(guardian.brasas) : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e0a16",
          backgroundImage:
            "radial-gradient(60% 50% at 50% 118%, rgba(255,122,45,0.35), transparent 60%), radial-gradient(50% 40% at 50% -10%, rgba(162,129,255,0.22), transparent 60%)",
          color: "#f5eee6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 20, letterSpacing: 8, textTransform: "uppercase", color: "#a281ff", display: "flex" }}>
          Wall of Guardians
        </div>

        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            marginTop: 32,
            background: "radial-gradient(circle at 35% 30%, #ffd66b, #ff7a2d 72%)",
            boxShadow: "0 0 60px rgba(255,150,60,0.7)",
          }}
        />

        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1.5, marginTop: 28, display: "flex" }}>
          {guardian ? name : "Unknown guardian"}
        </div>

        {guardian ? (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 20 }}>
              <div style={{ fontSize: 22, color: "#a281ff", display: "flex" }}>
                Rank #{idx + 1} of {entries.length}
              </div>
              {badge && (
                <div
                  style={{
                    fontSize: 16,
                    letterSpacing: 2,
                    color: badge.color,
                    border: `2px solid ${badge.color}`,
                    borderRadius: 999,
                    padding: "6px 16px",
                    display: "flex",
                  }}
                >
                  {badge.label}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: 30 }}>
              <div style={{ fontSize: 84, fontWeight: 700, color: "#ffd66b", display: "flex" }}>
                {guardian.brasas.toLocaleString()}
              </div>
              <div style={{ fontSize: 28, color: "#b6aecb", display: "flex" }}>embers</div>
            </div>
          </>
        ) : (
          <div style={{ fontSize: 26, color: "#b6aecb", marginTop: 20, maxWidth: 700, textAlign: "center", display: "flex" }}>
            Not on the Wall yet — a campfire that only burns when people show up.
          </div>
        )}
      </div>
    ),
    { ...size }
  );
}
