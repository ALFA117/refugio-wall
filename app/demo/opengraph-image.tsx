import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Try Refugio in your browser";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function DemoOpengraphImage() {
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
            "radial-gradient(60% 50% at 50% 118%, rgba(255,122,45,0.4), transparent 60%), radial-gradient(50% 40% at 50% -10%, rgba(162,129,255,0.22), transparent 60%)",
          color: "#f5eee6",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 20, letterSpacing: 8, textTransform: "uppercase", color: "#a281ff", display: "flex" }}>
          Refugio · No install
        </div>
        <div
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            marginTop: 30,
            background: "radial-gradient(circle at 35% 30%, #ffd66b, #ff7a2d 72%)",
            boxShadow: "0 0 70px rgba(255,150,60,0.75)",
          }}
        />
        <div style={{ fontSize: 76, fontWeight: 700, letterSpacing: -1.5, marginTop: 26, display: "flex", alignItems: "baseline" }}>
          <span style={{ display: "flex" }}>Feel the fire</span>
          <span style={{ display: "flex", color: "#ff7a2d", fontStyle: "italic", marginLeft: 18 }}>before you visit it.</span>
        </div>
        <div style={{ fontSize: 28, color: "#b6aecb", marginTop: 22, maxWidth: 820, textAlign: "center", display: "flex" }}>
          A playable, no-install taste of Refugio&apos;s core mechanic — right in your browser.
        </div>
      </div>
    ),
    { ...size }
  );
}
