import { ImageResponse } from "next/og";

export const runtime = "edge";

// PWA icon (192x192) for the web app manifest — separate from the browser-tab favicon
// (app/icon.tsx), which Next serves at a fixed small size unsuited for home-screen icons.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e0a16",
        }}
      >
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            background: "radial-gradient(circle at 35% 30%, #ffd66b, #ff7a2d 72%)",
            boxShadow: "0 0 40px #ff7a2d",
          }}
        />
      </div>
    ),
    { width: 192, height: 192 }
  );
}
