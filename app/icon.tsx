import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Favicon: an ember on a deep twilight ground — matches the site's world.
export default function Icon() {
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
          borderRadius: 7,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 9,
            background: "radial-gradient(circle at 35% 30%, #ffd66b, #ff7a2d 72%)",
            boxShadow: "0 0 8px #ff7a2d",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
