import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Wall of Guardians · Refugio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Share card — dark twilight world with ember glow, shown when the site is shared.
export default function OpengraphImage() {
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
        <div
          style={{
            fontSize: 22,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: "#a281ff",
            display: "flex",
          }}
        >
          Refugio · Decentraland
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 24 }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              background: "radial-gradient(circle at 35% 30%, #ffd66b, #ff7a2d 72%)",
              boxShadow: "0 0 40px #ff7a2d",
            }}
          />
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -2 }}>
            Wall of <span style={{ color: "#ff7a2d", fontStyle: "italic" }}>Guardians</span>
          </div>
        </div>
        <div style={{ fontSize: 30, color: "#b6aecb", marginTop: 26, maxWidth: 820, textAlign: "center", display: "flex" }}>
          Embers earned keeping the fire alive — a campfire that only burns when people show up.
        </div>
      </div>
    ),
    { ...size }
  );
}
